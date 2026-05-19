'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { saveProject } from '@/lib/db';
import { StakkedProject } from '@/types/project';

interface Props {
  project: StakkedProject;
  sourceSlug: string;
}

/**
 * ForkRedirector — handles the ?fork=1 flow for community projects.
 *
 * On mount it:
 *  1. Creates a fresh copy of the project with a new UUID and "(Fork)" suffix
 *  2. Saves it to the browser's IndexedDB via saveProject()
 *  3. Navigates to /workspace so the user lands in the editor with their fork
 *
 * Renders a minimal loading screen while this happens; the whole flow
 * completes in <100 ms so the user barely sees it.
 */
export default function ForkRedirector({ project, sourceSlug }: Props) {
  const router = useRouter();
  const ran = useRef(false);
  const [forkError, setForkError] = useState<string | null>(null);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const now = new Date().toISOString();
    const forked: StakkedProject = {
      ...project,
      id: uuidv4(),
      title: `${project.title ?? 'Untitled'} (Fork)`,
      slug: `${sourceSlug}-fork-${Date.now()}`,
      published: false,
      visibility: 'private',
      forkedFrom: project.id,
      forkCount: 0,
      createdAt: now,
      updatedAt: now,
      // Re-ID all pages so they don't collide with the original
      pages: (project.pages ?? []).map(p => ({ ...p, id: uuidv4() })),
    };

    saveProject(forked)
      .then(() => router.replace('/workspace'))
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        setForkError(msg);
      });
  }, [project, sourceSlug, router]);

  if (forkError) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          background: 'var(--bg, #09090b)',
          color: 'var(--text, #fafafa)',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: 13,
          letterSpacing: '0.06em',
          padding: '0 24px',
          textAlign: 'center',
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#ef4444',
            boxShadow: '0 0 12px rgba(239,68,68,0.5)',
          }}
        />
        <p style={{ margin: 0, color: 'var(--text-mute, #71717a)', maxWidth: 360, lineHeight: 1.5 }}>
          Could not save your fork locally. Your browser storage may be full or unavailable.
          <br />
          <span style={{ color: 'var(--text-dim, #52525b)', fontSize: 11 }}>{forkError}</span>
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <a
            href={`/v/${sourceSlug}`}
            style={{
              padding: '8px 14px',
              borderRadius: 6,
              border: '1px solid var(--line, #27272a)',
              color: 'var(--text-mute, #71717a)',
              textDecoration: 'none',
              fontSize: 12,
            }}
          >
            ← back
          </a>
          <a
            href="/workspace"
            style={{
              padding: '8px 14px',
              borderRadius: 6,
              background: 'var(--accent, #6366f1)',
              color: '#fff',
              textDecoration: 'none',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            go to workspace
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        background: 'var(--bg, #09090b)',
        color: 'var(--text-mute, #71717a)',
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: 13,
        letterSpacing: '0.06em',
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: 'var(--accent, #6366f1)',
          boxShadow: '0 0 12px var(--accent, #6366f1)',
          animation: 'pulse 1.2s ease-in-out infinite',
        }}
      />
      <span>forking project&hellip;</span>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  );
}
