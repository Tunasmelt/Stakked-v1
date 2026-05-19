import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import MarketingNav from '@/components/marketing/MarketingNav';
import styles from '@/styles/Landing.module.css';

export const metadata = { title: 'Custom Elements · Stakked Docs' };

export default function CustomElementsPage() {
  return (
    <main className={styles.main}>
      <MarketingNav />
      <div className={styles.sysbar}>
        <div className={styles.sysLeft}>
          <span className={styles.dot} aria-hidden />
          <span>stakked · docs · custom elements</span>
        </div>
        <div className={styles.sysRight}>
          <Link href="/docs" className={styles.sysSep} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            <ArrowLeft size={10} /> docs home
          </Link>
        </div>
      </div>

      <section className={styles.brief}>
        <div className={styles.briefInner}>
          <span className={styles.tag}>{'// custom elements'}</span>
          <h1 className={styles.headline}>Building <em>new element types.</em></h1>
          <p className={styles.lede}>Every draggable block on the canvas is a <code>StakkedElement</code> with a typed <code>content</code> union. Adding a new element type involves four files.</p>
        </div>
      </section>

      <div className={styles.sectionBody} style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)', marginBottom: 8 }}>1. Extend the content union</h2>
        <p style={{ color: 'var(--text-mute)', lineHeight: 1.7, marginBottom: 32 }}>
          Open <code>src/types/element.ts</code> and add a new interface to the <code>ElementContent</code> discriminated union. Give it a unique <code>type</code> literal (<code>type: &apos;my-element&apos;</code>) and declare all required fields. Then add a <code>defaultMyElementContent()</code> helper that returns safe initial values, and call it from <code>defaultElement()</code>.
        </p>

        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)', marginBottom: 8 }}>2. Create the renderer component</h2>
        <p style={{ color: 'var(--text-mute)', lineHeight: 1.7, marginBottom: 32 }}>
          Create <code>src/components/elements/MyElement.tsx</code>. The component receives <code>{'{ element: StakkedElement }'}</code> as its only prop. Narrow the content with a type guard (<code>element.content.type === &apos;my-element&apos;</code>), then render using <code>element.content</code> fields. Keep the root node&apos;s <code>style</code> minimal — the canvas wrapper already handles position, size, rotation, and opacity via <code>wrapperStyle</code>.
        </p>

        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)', marginBottom: 8 }}>3. Register in the element factory</h2>
        <p style={{ color: 'var(--text-mute)', lineHeight: 1.7, marginBottom: 32 }}>
          Open <code>src/components/editor/CanvasElement.tsx</code> and add a branch to the <code>renderContent()</code> switch (or the equivalent render map). Import your new component and return it for the matching content type. Repeat in <code>src/components/preview/PreviewRenderer.tsx</code> so the element also renders correctly in preview and export.
        </p>

        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)', marginBottom: 8 }}>4. Add a sidebar entry</h2>
        <p style={{ color: 'var(--text-mute)', lineHeight: 1.7, marginBottom: 32 }}>
          Open <code>src/components/editor/LeftSidebar.tsx</code> and add an entry to the elements list. Each entry specifies a label, an icon, and a <code>factory</code> function that returns a partial <code>StakkedElement</code> (content + default size). The sidebar&apos;s drag and click handlers will call your factory to produce the element.
        </p>

        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)', marginBottom: 8 }}>5. Properties panel bindings (optional)</h2>
        <p style={{ color: 'var(--text-mute)', lineHeight: 1.7 }}>
          If your element has user-configurable content fields, add a section to <code>src/components/properties/ContentSection.tsx</code>. Gate it behind a <code>element.content.type === &apos;my-element&apos;</code> check. Use <code>useProjectStore</code>&apos;s <code>updateElement</code> action to write changes back — all mutations flow through the store so undo/redo works automatically.
        </p>
      </div>
    </main>
  );
}
