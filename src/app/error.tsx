'use client';

import { useEffect } from 'react';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error('[stakked] runtime error:', error);
    }
  }, [error]);

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        background: 'var(--bg, #09090b)',
        color: 'var(--text, #fafafa)',
        fontFamily: 'var(--font-ui, system-ui, sans-serif)',
        padding: '0 24px',
        textAlign: 'center',
      }}
    >
      {/* Status line */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: 11,
          color: 'var(--text-mute, #71717a)',
          letterSpacing: '0.1em',
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#ef4444',
            boxShadow: '0 0 8px rgba(239,68,68,0.6)',
          }}
        />
        <span>stakked · error</span>
        {error.digest && (
          <span style={{ color: 'var(--text-dim, #52525b)' }}>· {error.digest}</span>
        )}
      </div>

      {/* Headline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
        <h1
          style={{
            fontFamily: 'var(--font-display, system-ui)',
            fontSize: 'clamp(32px, 6vw, 56px)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            margin: 0,
            color: 'var(--text, #fafafa)',
          }}
        >
          Something went wrong.
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: 12,
            color: 'var(--text-mute, #71717a)',
            margin: 0,
            maxWidth: 400,
            lineHeight: 1.5,
          }}
        >
          {process.env.NODE_ENV === 'development'
            ? error.message
            : 'An unexpected error occurred. Your work is saved locally.'}
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={reset}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--accent, #6366f1)',
            color: 'var(--accent-ink, #fff)',
            padding: '9px 16px',
            borderRadius: 6,
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.04em',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          try again
        </button>
        <a
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'transparent',
            color: 'var(--text-mute, #71717a)',
            padding: '9px 16px',
            borderRadius: 6,
            border: '1px solid var(--line, #27272a)',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: 12,
            letterSpacing: '0.04em',
            textDecoration: 'none',
          }}
        >
          ← home
        </a>
      </div>
    </main>
  );
}
