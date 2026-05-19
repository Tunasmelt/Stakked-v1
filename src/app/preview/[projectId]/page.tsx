'use client';

import React, { use, useEffect, useState } from 'react';
import { loadProject } from '@/lib/db';
import { StakkedProject } from '@/types/project';
import PreviewRenderer from '@/components/preview/PreviewRenderer';

/**
 * Preview page — client component that loads the project from IndexedDB
 * and renders it through the shared PreviewRenderer (animations, parallax,
 * scroll-snap all live).
 *
 * Next.js 16: `params` is a Promise, unwrapped with React's `use()` hook.
 */
export default function PreviewPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const [project, setProject] = useState<StakkedProject | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const proj = await loadProject(projectId);
        if (cancelled) return;
        if (!proj) {
          setError(`Project "${projectId}" not found in local storage. Open it in the editor first.`);
          return;
        }
        setProject(proj);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load project');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 24, background: '#0a0a0a', color: '#fca5a5', fontFamily: 'ui-sans-serif, system-ui' }}>
        <div style={{ maxWidth: 520, textAlign: 'center' }}>
          <h1 style={{ fontSize: 20, marginBottom: 8 }}>Preview unavailable</h1>
          <p style={{ fontSize: 13, opacity: 0.8 }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0a0a0a', color: 'white', fontFamily: 'ui-sans-serif, system-ui' }}>
        Loading preview…
      </div>
    );
  }

  return <PreviewRenderer project={project} />;
}
