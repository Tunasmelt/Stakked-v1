import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

/**
 * Image Proxy Route: Prevents CORS "tainted canvas" issues when exporting
 * elements with external source URLs.
 *
 * SSRF Mitigations
 * ----------------
 * 1. Only https:// URLs are accepted — file://, http://, and custom schemes
 *    are rejected immediately before any network call.
 * 2. The resolved hostname is checked against private/loopback ranges so
 *    the proxy cannot be used to reach internal services or cloud metadata
 *    endpoints (AWS 169.254.169.254, GCP metadata.google.internal, etc.).
 */

/** Reject private / link-local / loopback IPv4 ranges. */
function isPrivateIp(hostname: string): boolean {
  // Resolve well-known hostnames that map to loopback
  if (
    hostname === 'localhost' ||
    hostname === 'metadata.google.internal' ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal')
  ) {
    return true;
  }

  // Numeric IPv4 check for RFC-1918 + link-local + loopback + CGNAT.
  // Strict: each octet must be 1-3 decimal digits representing a value 0-255.
  // Leading-zero octets are rejected (they are invalid in dotted-decimal notation
  // and could be misinterpreted as octal by some stacks).
  const ipv4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(hostname);
  if (ipv4) {
    const parts = ipv4.slice(1); // ['a', 'b', 'c', 'd'] strings
    // Reject leading-zero octets (e.g. "0192") and out-of-range values (e.g. "999").
    if (parts.some(p => (p.length > 1 && p[0] === '0') || Number(p) > 255)) {
      return true; // treat malformed IP as private — don't proxy it
    }
    const [a, b] = parts.map(Number);
    if (a === 10) return true;                        // 10.0.0.0/8
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
    if (a === 192 && b === 168) return true;          // 192.168.0.0/16
    if (a === 127) return true;                       // 127.0.0.0/8 loopback
    if (a === 169 && b === 254) return true;          // 169.254.0.0/16 link-local (AWS metadata)
    if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10 CGNAT
    if (a === 0) return true;                         // 0.0.0.0/8
  }

  // Reject bare IPv6 loopback / link-local
  if (hostname === '::1' || hostname.startsWith('fe80:')) return true;

  return false;
}

export async function GET(request: NextRequest) {
  const rl = rateLimit(request, { limit: 60, windowMs: 60_000 });
  if (!rl.ok) return rl.response;

  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  // ── SSRF guard ─────────────────────────────────────────────────────────────
  let parsed: URL;
  try {
    parsed = new URL(imageUrl);
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  if (parsed.protocol !== 'https:') {
    return NextResponse.json(
      { error: 'Only https:// URLs are accepted' },
      { status: 400 },
    );
  }

  if (isPrivateIp(parsed.hostname)) {
    return NextResponse.json(
      { error: 'Requests to private/internal addresses are not allowed' },
      { status: 403 },
    );
  }
  // ───────────────────────────────────────────────────────────────────────────

  try {
    // Many legitimate image hosts (picsum.photos, Unsplash's source redirector,
    // etc.) serve the actual image via a redirect. Blanket-rejecting redirects
    // breaks those hosts entirely, so we follow them ourselves — re-running the
    // same https-only + private-IP checks on every hop — rather than trusting
    // fetch's own redirect-following (which would let a redirect to
    // 169.254.x.x etc. bypass the SSRF mitigation above).
    let currentUrl = parsed;
    let response: Response;
    let hops = 0;
    const MAX_REDIRECTS = 5;

    for (;;) {
      response = await fetch(currentUrl.toString(), {
        headers: { 'User-Agent': 'Stakked-Proxy/1.0' },
        redirect: 'manual',
      });

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (!location) throw new Error('Redirect with no Location header');
        if (++hops > MAX_REDIRECTS) throw new Error('Too many redirects');

        const nextUrl = new URL(location, currentUrl);
        if (nextUrl.protocol !== 'https:') {
          throw new Error('Redirect target must be https://');
        }
        if (isPrivateIp(nextUrl.hostname)) {
          throw new Error('Redirect target resolves to a private/internal address');
        }
        currentUrl = nextUrl;
        continue;
      }
      break;
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') ?? '';
    const allowed =
      contentType.startsWith('image/') ||
      contentType === 'application/xml' ||
      contentType === 'image/svg+xml';

    if (!allowed) {
      return NextResponse.json(
        { error: `Unsupported content-type: ${contentType || 'unknown'}` },
        { status: 415 },
      );
    }

    const blob = await response.blob();
    const headers = new Headers();
    headers.set('Content-Type', contentType || 'image/jpeg');
    headers.set('Cache-Control', 'public, max-age=86400');
    headers.set('Access-Control-Allow-Origin', '*');

    return new NextResponse(blob, { status: 200, headers });
  } catch (error) {
    console.error('Image proxy error:', error);
    return NextResponse.json({ error: 'Failed to proxy image' }, { status: 500 });
  }
}
