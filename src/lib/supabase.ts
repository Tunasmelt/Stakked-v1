/* src/lib/supabase.ts */
import { createClient } from '@supabase/supabase-js';
import { StakkedProject } from '@/types/project';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured =
  Boolean(supabaseUrl) &&
  Boolean(supabaseAnonKey) &&
  supabaseUrl.startsWith('https://') &&
  (supabaseUrl.includes('.supabase.co') || supabaseUrl.includes('.supabase.in'));

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

interface ProjectRow {
  data: StakkedProject | null;
  updated_at?: string | null;
}

/**
 * Returns the authenticated Supabase user ID, or a stable per-device
 * anonymous ID stored in localStorage. Never returns the literal
 * string 'temp-user'.
 */
export async function getCurrentUserId(): Promise<string> {
  if (supabase) {
    try {
      const { data } = await supabase.auth.getUser();
      if (data.user?.id) return data.user.id;
    } catch {
      // fall through to anonymous
    }
  }

  if (typeof window === 'undefined') return 'anon-ssr';

  const KEY = 'stakked_anon_id';
  let anonId = localStorage.getItem(KEY);
  if (!anonId) {
    anonId = `anon-${crypto.randomUUID()}`;
    localStorage.setItem(KEY, anonId);
  }
  return anonId;
}

export async function fetchProjectFromCloud(projectId: string): Promise<StakkedProject | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('projects')
    .select('data, updated_at')
    .eq('id', projectId)
    .maybeSingle<ProjectRow>();

  if (error) {
    console.warn('Supabase project fetch failed:', error.message);
    return null;
  }

  if (!data?.data) return null;

  return {
    ...data.data,
    updatedAt: data.updated_at ?? data.data.updatedAt,
  };
}
