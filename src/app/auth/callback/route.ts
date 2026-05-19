import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * /auth/callback
 * Handles the OAuth / magic-link PKCE code exchange.
 * Supabase redirects here after the user confirms their email
 * or authenticates with an OAuth provider (Google, GitHub, etc.)
 */
/** Validate the post-auth redirect target to prevent open redirect attacks. */
function safeRedirectPath(next: string | null): string {
  if (!next) return '/workspace';
  // Reject absolute URLs, protocol-relative URLs, and anything that doesn't
  // start with a forward slash — all of these could redirect off-domain.
  if (!next.startsWith('/') || next.startsWith('//')) return '/workspace';
  // Only allow known top-level paths.
  const ALLOWED_PREFIXES = ['/workspace', '/editor', '/preview', '/community', '/features', '/docs', '/changelog', '/auth/reset-password'];
  const isAllowed = ALLOWED_PREFIXES.some(p => next === p || next.startsWith(p + '/'));
  return isAllowed ? next : '/workspace';
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code   = requestUrl.searchParams.get('code');
  const next   = safeRedirectPath(requestUrl.searchParams.get('next'));
  const origin = requestUrl.origin;

  const supabaseUrl    = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

  // A missing code means the OAuth callback was visited directly (link replay,
  // code already consumed, or manual navigation). Redirect to login with an
  // informative error rather than silently landing on the target page without
  // a valid session.
  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=missing_code`);
  }

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const client = createClient(supabaseUrl, supabaseAnonKey);
      const { error } = await client.auth.exchangeCodeForSession(code);
      if (error) {
        console.error('[auth/callback] exchange error:', error.message);
        return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(error.message)}`);
      }
    } catch (err) {
      console.error('[auth/callback] unexpected error:', err);
      return NextResponse.redirect(`${origin}/auth/login?error=callback_failed`);
    }
  }

  // `next` has already been validated by safeRedirectPath — always an internal path.
  return NextResponse.redirect(`${origin}${next}`);
}
