import Link from 'next/link';

export default function NotFound() {
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
            background: 'var(--accent, #6366f1)',
            boxShadow: '0 0 8px var(--accent, #6366f1)',
          }}
        />
        <span>stakked · 404</span>
      </div>

      {/* Headline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
        <h1
          style={{
            fontFamily: 'var(--font-display, system-ui)',
            fontSize: 'clamp(48px, 10vw, 96px)',
            fontWeight: 700,
            letterSpacing: '-0.04em',
            lineHeight: 1,
            margin: 0,
            color: 'var(--text, #fafafa)',
          }}
        >
          404
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: 13,
            color: 'var(--text-mute, #71717a)',
            margin: 0,
            letterSpacing: '0.04em',
          }}
        >
          page not found
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          href="/"
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
            textDecoration: 'none',
          }}
        >
          ← home
        </Link>
        <Link
          href="/workspace"
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
          open workspace
        </Link>
      </div>
    </main>
  );
}
