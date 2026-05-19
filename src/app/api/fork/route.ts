import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

/**
 * POST /api/fork
 * Body: { slug: string }
 *
 * Atomically increments fork_count on the published_projects row identified
 * by slug. Called by ForkRedirector after a successful local save so the
 * community gallery reflects real fork activity.
 *
 * Uses a SECURITY DEFINER RPC so it can bypass RLS — the RPC itself
 * validates that the slug exists before incrementing.
 *
 * Rate limited to 20 req/min per IP to prevent count inflation.
 */
export async function POST(req: Request) {
  const rl = rateLimit(req, { limit: 20, windowMs: 60_000 });
  if (!rl.ok) return rl.response;

  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  let slug: string;
  try {
    const body = await req.json() as { slug?: unknown };
    if (typeof body.slug !== 'string' || !body.slug.trim()) {
      return NextResponse.json({ error: 'Missing or invalid slug' }, { status: 400 });
    }
    slug = body.slug.trim();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Validate slug format to prevent injection
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/i.test(slug)) {
    return NextResponse.json({ error: 'Invalid slug format' }, { status: 400 });
  }

  try {
    const { error } = await supabase.rpc('increment_fork_count', { p_slug: slug });

    if (error) {
      // RPC function doesn't exist yet — degrade gracefully so forks still work
      if (error.code === 'PGRST202' || error.message?.includes('function') || error.message?.includes('not found')) {
        console.warn('[fork] increment_fork_count RPC not found — apply migration to enable');
        return NextResponse.json({ success: true, degraded: true });
      }
      console.error('[fork] RPC error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[fork] unexpected error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Fork count update failed' },
      { status: 500 },
    );
  }
}
