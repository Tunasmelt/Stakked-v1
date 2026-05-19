import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import MarketingNav from '@/components/marketing/MarketingNav';
import styles from '@/styles/Landing.module.css';

export const metadata = { title: 'Theme Engine · Stakked Docs' };

export default function ThemeEnginePage() {
  return (
    <main className={styles.main}>
      <MarketingNav />
      <div className={styles.sysbar}>
        <div className={styles.sysLeft}>
          <span className={styles.dot} aria-hidden />
          <span>stakked · docs · theme engine</span>
        </div>
        <div className={styles.sysRight}>
          <Link href="/docs" className={styles.sysSep} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            <ArrowLeft size={10} /> docs home
          </Link>
        </div>
      </div>

      <section className={styles.brief}>
        <div className={styles.briefInner}>
          <span className={styles.tag}>{'// theme engine'}</span>
          <h1 className={styles.headline}>CSS tokens &amp; <em>theming</em> in Stakked.</h1>
          <p className={styles.lede}>All visual primitives are CSS custom properties. Themes swap token values at the <code>:root</code> level; components never hard-code colours.</p>
        </div>
      </section>

      <div className={styles.sectionBody} style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)', marginBottom: 8 }}>Token taxonomy</h2>
        <p style={{ color: 'var(--text-mute)', lineHeight: 1.7, marginBottom: 32 }}>
          Tokens are grouped into three layers. <strong>Primitives</strong> are raw values (<code>--slate-900</code>, <code>--emerald-500</code>). <strong>Semantic tokens</strong> map intent to primitives (<code>--bg</code>, <code>--text</code>, <code>--accent</code>, <code>--border</code>, <code>--text-mute</code>). <strong>Component tokens</strong> scope overrides to a single component (<code>--panel-bg</code>, <code>--toolbar-height</code>).
        </p>

        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)', marginBottom: 8 }}>Theme resolution</h2>
        <p style={{ color: 'var(--text-mute)', lineHeight: 1.7, marginBottom: 32 }}>
          The active theme is stored in <code>uiStore.activeTheme</code> (string key). On mount and on theme change, <code>src/lib/theme.ts</code> writes all token values onto <code>document.documentElement</code>. Theme definitions live in <code>src/lib/themes/</code> as plain TypeScript objects — no CSS files to import. Adding a new theme means exporting a record from that directory and registering it in the theme index.
        </p>

        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)', marginBottom: 8 }}>Core semantic tokens</h2>
        <p style={{ color: 'var(--text-mute)', lineHeight: 1.7, marginBottom: 16 }}>
          The tokens every component should consume:
        </p>
        <ul style={{ color: 'var(--text-mute)', lineHeight: 2, marginBottom: 32, paddingLeft: 20 }}>
          <li><code>--bg</code> — page / panel background</li>
          <li><code>--bg-raise</code> — elevated surface (cards, modals)</li>
          <li><code>--bg-hover</code> — hover / focus highlight</li>
          <li><code>--text</code> — primary foreground</li>
          <li><code>--text-mute</code> — secondary / caption text</li>
          <li><code>--accent</code> — brand highlight (links, active states)</li>
          <li><code>--border</code> — dividers and outlines</li>
          <li><code>--font-mono</code> — monospace font family</li>
          <li><code>--font-sans</code> — proportional font family</li>
        </ul>

        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)', marginBottom: 8 }}>Canvas preview theming</h2>
        <p style={{ color: 'var(--text-mute)', lineHeight: 1.7, marginBottom: 32 }}>
          The canvas and preview renderer are isolated from the editor theme. Canvas background colour is driven by <code>project.canvasBackground</code> in the project JSON, not by the editor&apos;s active theme. This ensures exported HTML looks the same regardless of which editor theme the author uses.
        </p>

        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)', marginBottom: 8 }}>Adding a custom theme</h2>
        <p style={{ color: 'var(--text-mute)', lineHeight: 1.7 }}>
          Create a file at <code>src/lib/themes/my-theme.ts</code> that exports a <code>Theme</code> object (see <code>src/lib/themes/dark.ts</code> for reference). Then add it to the index in <code>src/lib/themes/index.ts</code>. The Tweaks panel will pick it up automatically from the theme list.
        </p>
      </div>
    </main>
  );
}
