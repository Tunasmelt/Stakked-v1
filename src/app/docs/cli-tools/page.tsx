import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import MarketingNav from '@/components/marketing/MarketingNav';
import styles from '@/styles/Landing.module.css';

export const metadata = { title: 'CLI Generators · Stakked Docs' };

export default function CliToolsPage() {
  return (
    <main className={styles.main}>
      <MarketingNav />
      <div className={styles.sysbar}>
        <div className={styles.sysLeft}>
          <span className={styles.dot} aria-hidden />
          <span>stakked · docs · cli generators</span>
        </div>
        <div className={styles.sysRight}>
          <Link href="/docs" className={styles.sysSep} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            <ArrowLeft size={10} /> docs home
          </Link>
        </div>
      </div>

      <section className={styles.brief}>
        <div className={styles.briefInner}>
          <span className={styles.tag}>{'// cli generators'}</span>
          <h1 className={styles.headline}>Tooling &amp; <em>export workflows.</em></h1>
          <p className={styles.lede}>Stakked ships a small set of Node scripts for exporting project files, validating JSON, and scaffolding new element types without touching the UI.</p>
        </div>
      </section>

      <div className={styles.sectionBody} style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)', marginBottom: 8 }}>Export to HTML</h2>
        <p style={{ color: 'var(--text-mute)', lineHeight: 1.7, marginBottom: 32 }}>
          The primary export path is built into the editor (<em>Toolbar → Export → HTML</em>). The same function is exposed as a Node-importable module at <code>src/lib/export.ts</code>. You can drive it programmatically by importing <code>compileProjectToHtml(project, options)</code> and writing the result to disk. Useful for CI pipelines that auto-export on every commit.
        </p>

        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)', marginBottom: 8 }}>Export to PNG / PDF</h2>
        <p style={{ color: 'var(--text-mute)', lineHeight: 1.7, marginBottom: 32 }}>
          Image and PDF export is handled by <code>src/lib/export-media.ts</code>. In the browser these run via <code>html2canvas</code> and <code>jsPDF</code>. For headless generation, consider running the preview route through a Puppeteer or Playwright script — the <code>/preview/[id]</code> route renders a clean canvas-only page without editor chrome, suitable for screenshotting.
        </p>

        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)', marginBottom: 8 }}>Project JSON validation</h2>
        <p style={{ color: 'var(--text-mute)', lineHeight: 1.7, marginBottom: 32 }}>
          The <code>StakkedProject</code> type is the canonical schema. To validate a <code>.stk</code> file (which is plain JSON) against the schema outside the editor, import the type and run it through a Zod schema or <code>tsc --noEmit</code> against a typed parse. A lightweight Zod mirror of the schema is planned for a future release to allow CLI validation without the full Next.js environment.
        </p>

        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)', marginBottom: 8 }}>Scaffolding a new element</h2>
        <p style={{ color: 'var(--text-mute)', lineHeight: 1.7, marginBottom: 32 }}>
          There is no generator script yet — follow the four-step guide in the <Link href="/docs/custom-elements" style={{ color: 'var(--accent)' }}>Custom Elements</Link> doc. A Plop-based generator (<code>pnpm gen:element MyElement</code>) is planned that will create the type stub, renderer component, and sidebar entry automatically.
        </p>

        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)', marginBottom: 8 }}>Dev workflow</h2>
        <p style={{ color: 'var(--text-mute)', lineHeight: 1.7 }}>
          Run <code>pnpm dev</code> to start the Next.js development server with Turbopack. TypeScript is checked separately with <code>pnpm tsc --noEmit</code> — this is faster than relying on the dev server&apos;s incremental type checking during development. Lint with <code>pnpm lint</code>. There is no test suite yet; component tests with Vitest + React Testing Library are on the roadmap.
        </p>
      </div>
    </main>
  );
}
