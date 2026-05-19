import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { StakkedProject } from '@/types/project';
import { compileProjectToHtml } from '@/lib/export';
import { rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const STORAGE_BUCKET = 'published-html';

export async function POST(req: Request) {
  const rl = rateLimit(req, { limit: 10, windowMs: 60_000 });
  if (!rl.ok) return rl.response;

  try {
    const project = (await req.json()) as StakkedProject;

    if (!project || !project.id) {
      return NextResponse.json({ error: 'Missing project data' }, { status: 400 });
    }

    if (!Array.isArray(project.pages) || project.pages.length === 0) {
      return NextResponse.json({ error: 'Project must have at least one page' }, { status: 400 });
    }

    const client = supabase;
    if (!client) {
      // Supabase not configured — fall through to the explicit 500 below.
    } else {
      // Auth check: verify the caller owns the project being published.
      // A missing Authorization header is only allowed for genuinely anonymous
      // projects (userId starts with 'anon-'). Authenticated projects require
      // a valid token — otherwise any caller could overwrite any project slug.
      const authHeader = req.headers.get('authorization') ?? '';
      const token = authHeader.replace(/^Bearer\s+/i, '');

      const isAnonymousProject =
        !project.userId || project.userId.startsWith('anon-');

      if (!isAnonymousProject && !token) {
        return NextResponse.json(
          { error: 'Unauthorized: a Bearer token is required to publish authenticated projects' },
          { status: 401 },
        );
      }

      if (token) {
        try {
          const { data: { user }, error: authError } = await client.auth.getUser(token);
          if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }
          if (project.userId && project.userId !== user.id) {
            return NextResponse.json({ error: 'Forbidden: you do not own this project' }, { status: 403 });
          }
        } catch {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
      }
    }

    if (!client) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const slug = project.slug || project.id;

    // Validate slug format: alphanumeric and hyphens only
    if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/i.test(slug)) {
      return NextResponse.json(
        { error: 'Slug must contain only alphanumeric characters and hyphens' },
        { status: 400 },
      );
    }

    // Guard against slug collisions from different users
    const { data: existingRow } = await client
      .from('published_projects')
      .select('user_id')
      .eq('slug', slug)
      .maybeSingle();
    if (existingRow && existingRow.user_id !== (project.userId ?? 'anon')) {
      return NextResponse.json(
        { error: 'Slug is already taken by another project' },
        { status: 409 },
      );
    }

    const updatedAt = new Date().toISOString();

    // Build a map from 'page-<id>' → relative filename so the navigate runtime can
    // resolve cross-page links. Page 0 = 'index.html'; subsequent pages = 'page-N.html'.
    const pageUrlMap: Record<string, string> = {};
    project.pages.forEach((p, i) => {
      pageUrlMap[`page-${p.id}`] = i === 0 ? 'index.html' : `page-${i}.html`;
    });

    // 1. Compile each page to HTML and concatenate into a single multi-page
    //    export.  For now we publish all pages as separate files and treat
    //    page 0 as the entry point `index.html`.
    const uploadErrors: string[] = [];

    for (let i = 0; i < project.pages.length; i++) {
      const html = compileProjectToHtml(project, { pageIndex: i, pageUrlMap });
      const filename = i === 0 ? 'index.html' : `page-${i}.html`;
      const storagePath = `${slug}/${filename}`;

      const { error: uploadErr } = await client.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, html, {
          contentType: 'text/html; charset=utf-8',
          upsert: true,
        });

      if (uploadErr) {
        console.warn(`[publish] storage upload failed for ${storagePath}:`, uploadErr.message);
        uploadErrors.push(uploadErr.message);
      }
    }

    // 2. Get the public URL for the entry point
    const { data: urlData } = client.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(`${slug}/index.html`);
    const publicUrl = urlData?.publicUrl ?? null;

    // 3. Upsert metadata row in published_projects
    const { error: dbError } = await client
      .from('published_projects')
      .upsert(
        {
          id: project.id,
          slug,
          project_id: project.id,
          title: project.title,
          user_id: project.userId ?? 'anon',
          tags: project.tags ?? [],
          fork_count: project.forkCount ?? 0,
          public_url: publicUrl,
          data: { ...project, updatedAt },
          updated_at: updatedAt,
        },
        { onConflict: 'slug' },
      );

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      slug,
      url: publicUrl,
      pagesPublished: project.pages.length - uploadErrors.length,
      uploadErrors: uploadErrors.length > 0 ? uploadErrors : undefined,
    });
  } catch (err) {
    console.error('[publish] API error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Publishing failed' },
      { status: 500 },
    );
  }
}
