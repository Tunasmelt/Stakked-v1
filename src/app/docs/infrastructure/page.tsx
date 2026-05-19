import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import MarketingNav from '@/components/marketing/MarketingNav';
import styles from '@/styles/Landing.module.css';

export const metadata = { title: 'Stores & State · Stakked Docs' };

export default function InfrastructurePage() {
  return (
    <main className={styles.main}>
      <MarketingNav />
      <div className={styles.sysbar}>
        <div className={styles.sysLeft}>
          <span className={styles.dot} aria-hidden />
          <span>stakked · docs · stores & state</span>
        </div>
        <div className={styles.sysRight}>
          <Link href="/docs" className={styles.sysSep} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            <ArrowLeft size={10} /> docs home
          </Link>
        </div>
      </div>

      <section className={styles.brief}>
        <div className={styles.briefInner}>
          <span className={styles.tag}>{'// stores & state'}</span>
          <h1 className={styles.headline}>Zustand stores in <em>Stakked.</em></h1>
          <p className={styles.lede}>Five Zustand + Immer stores manage all runtime state. Each store is a single source of truth for its domain.</p>
        </div>
      </section>

      <div className={styles.sectionBody} style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)', marginBottom: 8 }}>projectStore</h2>
        <p style={{ color: 'var(--text-mute)', lineHeight: 1.7, marginBottom: 32 }}>
          Owns the entire <code>StakkedProject</code> JSON — pages, elements, canvas settings, workflow graph. Wraps every mutation with Immer for structural sharing. Maintains a 50-entry undo stack (<code>history[]</code>) and a redo stack (<code>future[]</code>) via <code>commit()</code> snapshots. Key actions: <code>addElement</code>, <code>updateElement</code>, <code>updateElementStyle</code>, <code>commitElementMove</code>, <code>commitElementResize</code>.
        </p>

        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)', marginBottom: 8 }}>editorStore</h2>
        <p style={{ color: 'var(--text-mute)', lineHeight: 1.7, marginBottom: 32 }}>
          Owns transient editor UI state that does not belong in the project JSON: selected element IDs, active tool, zoom level, pan offset, current breakpoint, canvas size, and drag/editing flags. Never persisted to IndexedDB.
        </p>

        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)', marginBottom: 8 }}>uiStore</h2>
        <p style={{ color: 'var(--text-mute)', lineHeight: 1.7, marginBottom: 32 }}>
          Modal visibility, panel open/closed state, preview mode, active theme, toast queue, and command palette state. Also owns the <code>showConfirm()</code> imperative API used by destructive actions.
        </p>

        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)', marginBottom: 8 }}>tutorialStore</h2>
        <p style={{ color: 'var(--text-mute)', lineHeight: 1.7, marginBottom: 32 }}>
          Tour definitions and step tracking for the on-boarding overlay. Persisted to <code>localStorage</code> so completed tours are not replayed.
        </p>

        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)', marginBottom: 8 }}>stateStore</h2>
        <p style={{ color: 'var(--text-mute)', lineHeight: 1.7, marginBottom: 32 }}>
          Global key-value state bag for element behaviors (<code>setGlobalState</code> / <code>emitEvent</code> actions). Drives cross-element interactivity without coupling element components directly.
        </p>

        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)', marginBottom: 8 }}>JSON persistence</h2>
        <p style={{ color: 'var(--text-mute)', lineHeight: 1.7 }}>
          Projects are saved to IndexedDB via <code>src/lib/db.ts</code> (idb-keyval). Auto-save fires 2 s after the last dirty mutation. A BroadcastChannel syncs changes across open tabs using timestamp comparison to avoid overwriting newer work.
        </p>
      </div>
    </main>
  );
}
