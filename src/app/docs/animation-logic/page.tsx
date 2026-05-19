import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import MarketingNav from '@/components/marketing/MarketingNav';
import styles from '@/styles/Landing.module.css';

export const metadata = { title: 'Animation Logic · Stakked Docs' };

export default function AnimationLogicPage() {
  return (
    <main className={styles.main}>
      <MarketingNav />
      <div className={styles.sysbar}>
        <div className={styles.sysLeft}>
          <span className={styles.dot} aria-hidden />
          <span>stakked · docs · animation logic</span>
        </div>
        <div className={styles.sysRight}>
          <Link href="/docs" className={styles.sysSep} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            <ArrowLeft size={10} /> docs home
          </Link>
        </div>
      </div>

      <section className={styles.brief}>
        <div className={styles.briefInner}>
          <span className={styles.tag}>{'// animation logic'}</span>
          <h1 className={styles.headline}>Scroll &amp; entrance <em>animations.</em></h1>
          <p className={styles.lede}>Animations are data, not imperative code. Each element carries an <code>animation</code> config object that the preview renderer interprets at runtime.</p>
        </div>
      </section>

      <div className={styles.sectionBody} style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)', marginBottom: 8 }}>Animation config shape</h2>
        <p style={{ color: 'var(--text-mute)', lineHeight: 1.7, marginBottom: 32 }}>
          Every <code>StakkedElement</code> has an <code>animation</code> field typed as <code>ElementAnimation | undefined</code>. The object holds <code>preset</code> (string key like <code>&apos;fadeIn&apos;</code>, <code>&apos;slideUp&apos;</code>), <code>duration</code> (ms), <code>delay</code> (ms), <code>easing</code> (CSS easing string), and <code>repeat</code> (boolean). When <code>preset</code> is <code>&apos;none&apos;</code> or undefined the element renders without any entrance transition.
        </p>

        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)', marginBottom: 8 }}>Intersection Observer trigger</h2>
        <p style={{ color: 'var(--text-mute)', lineHeight: 1.7, marginBottom: 32 }}>
          In the preview and published HTML, each animated element is observed by a shared <code>IntersectionObserver</code> (threshold 0.15). When the element enters the viewport the observer adds a <code>data-visible</code> attribute, which CSS keyframe classes key off of. The observer is created once per page mount in <code>src/components/preview/PreviewRenderer.tsx</code> and disconnected on unmount.
        </p>

        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)', marginBottom: 8 }}>Built-in presets</h2>
        <p style={{ color: 'var(--text-mute)', lineHeight: 1.7, marginBottom: 16 }}>
          Presets are defined in <code>src/lib/animation-presets.ts</code> as a map from preset key to CSS keyframe and initial style values. Current presets:
        </p>
        <ul style={{ color: 'var(--text-mute)', lineHeight: 2, marginBottom: 32, paddingLeft: 20 }}>
          <li><code>fadeIn</code> — opacity 0 → 1</li>
          <li><code>slideUp</code> — translateY(24px) + opacity 0 → natural position</li>
          <li><code>slideDown</code> — translateY(-24px) + opacity 0 → natural position</li>
          <li><code>slideLeft</code> / <code>slideRight</code> — horizontal variants</li>
          <li><code>zoomIn</code> — scale(0.9) + opacity 0 → natural scale</li>
          <li><code>bounceIn</code> — spring overshoot sequence</li>
        </ul>

        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)', marginBottom: 8 }}>Adding a new preset</h2>
        <p style={{ color: 'var(--text-mute)', lineHeight: 1.7, marginBottom: 32 }}>
          Add a new entry to the map in <code>src/lib/animation-presets.ts</code>. Each entry exports a <code>keyframes</code> string (injected as a <code>&lt;style&gt;</code> tag at runtime) and an <code>initialStyle</code> object applied before the element becomes visible. Then add the key to the <code>ANIMATION_PRESETS</code> array used by the Animation section in the properties panel — the UI will pick it up automatically.
        </p>

        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)', marginBottom: 8 }}>Editor vs preview behaviour</h2>
        <p style={{ color: 'var(--text-mute)', lineHeight: 1.7 }}>
          The canvas editor never plays animations — elements are always visible at full opacity so they remain selectable. Animations fire only in the preview panel (<em>Preview</em> button) and in the exported HTML. The properties panel shows a <em>Play</em> button that temporarily forces the animation class on the canvas element for a one-shot preview without leaving edit mode.
        </p>
      </div>
    </main>
  );
}
