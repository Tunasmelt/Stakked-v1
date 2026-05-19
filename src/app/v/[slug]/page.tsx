/* src/app/v/[slug]/page.tsx */
export const revalidate = 60;

import { cache } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import PublicApp from '@/components/viewer/PublicApp';
import ForkRedirector from './ForkRedirector';
import { StakkedProject } from '@/types/project';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ fork?: string }>;
}

/**
 * Wrapped with React `cache()` so that `generateMetadata` and the page
 * component share one Supabase round-trip per SSR render instead of two.
 */
const fetchPublishedProject = cache(async (slug: string): Promise<StakkedProject | null> => {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('published_projects')
    .select('data, title')
    .eq('slug', slug)
    .single();

  if (error || !data?.data) {
    console.warn('[viewer] fetch error:', error?.message);
    return null;
  }

  // Runtime guard — the JSONB column could be corrupted or from an older schema.
  const raw = data.data as Record<string, unknown>;
  if (!Array.isArray(raw.pages) || raw.pages.length === 0) {
    console.warn('[viewer] malformed project data for slug:', slug, '— missing pages');
    return null;
  }

  return raw as unknown as StakkedProject;
});

/**
 * Public Viewing Route
 * --------------------
 * Fetches the published project snapshot from Supabase and renders
 * the read-only PublicApp viewer. Also handles ?fork=1 to redirect
 * the user to a remixed copy in the editor.
 *
 * When Supabase is not configured the route renders 404 — static HTML
 * can still be served directly via the CDN/storage public URL.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await fetchPublishedProject(slug);

  const title     = project?.settings?.metaTitle || (project ? `${project.title} · Stakked` : 'Stakked Project');
  const desc      = project?.settings?.metaDesc  || 'A creative project built with Stakked';
  const robots    = project?.settings?.robots;
  return {
    title,
    description: desc,
    ...(robots && { robots }),
    openGraph: {
      title: project?.settings?.metaTitle || project?.title || 'Stakked Project',
      description: desc,
      images: project?.settings?.ogImage ? [project.settings.ogImage] : [],
    },
  };
}

export default async function PublicPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = searchParams ? await searchParams : {};
  const project = await fetchPublishedProject(slug);

  if (!project) {
    notFound();
  }

  // ?fork=1 — save a copy to the visitor's IndexedDB and redirect to workspace
  if (sp.fork === '1') {
    return <ForkRedirector project={project} sourceSlug={slug} />;
  }

  return <PublicApp project={project} />;
}
