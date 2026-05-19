/* src/lib/publish.ts */
import { supabase, isSupabaseConfigured } from './supabase';
import { StakkedProject } from '@/types/project';

export interface PublishResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Publishes a project snapshot to the cloud.
 * This creates a static, public version of the project.
 */
export async function publishProject(project: StakkedProject, customSlug?: string): Promise<PublishResult> {
  if (!supabase || !isSupabaseConfigured) {
    return { success: false, error: 'Cloud services not configured. Set SUPABASE keys in .env.local' };
  }

  try {
    const slug = customSlug || project.slug || project.id;
    const updatedAt = new Date().toISOString();

    // Resolve the current user so the row's user_id is set correctly.
    // Without this, authenticated users' rows default to 'anon', which allows
    // any other authenticated user to overwrite them via the RLS policy.
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id ?? project.userId ?? 'anon';

    // We use a dedicated table for published projects to ensure
    // public view safety and performance.
    const { data, error } = await supabase
      .from('published_projects')
      .upsert({
        id: project.id, // We can reuse project ID or generate a new one
        slug: slug,
        project_id: project.id,
        user_id: userId,
        data: { ...project, updatedAt },
        updated_at: updatedAt
      }, { onConflict: 'slug' })
      .select('slug')
      .single();

    if (error) {
      console.error('[publish] Supabase error:', error.message);
      return { success: false, error: error.message };
    }

    const host = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL || '';
    return { 
      success: true, 
      url: `${host}/v/${data.slug}` 
    };
  } catch (err) {
    console.error('[publish] Unexpected error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown publish error' };
  }
}
