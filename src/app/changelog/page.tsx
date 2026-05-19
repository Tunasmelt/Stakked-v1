'use client';
/**
 * /changelog — Stakked version history
 */
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, Shield, Wrench, Star, ArrowRight } from 'lucide-react';
import MarketingNav from '@/components/marketing/MarketingNav';
import styles from '@/styles/Marketing.module.css';

const CHANGELOG = [
  {
    version: 'v0.3.0',
    date: 'Apr 2026',
    label: 'Phase 5 — Production',
    badge: 'latest',
    entries: [
      { type: 'feature', text: 'Auth pages (login / signup / OAuth callback) with Supabase integration' },
      { type: 'feature', text: 'Cloud sync gated behind login — projects always saved to IndexedDB first' },
      { type: 'feature', text: 'Resizable left + right sidebars via drag handles' },
      { type: 'feature', text: 'Context menu (right-click): duplicate, lock, z-order, delete, select all' },
      { type: 'feature', text: 'Layer drag-to-reorder in the Layers panel' },
      { type: 'feature', text: 'Asset library pagination — "Load more" for Pexels images and icons' },
      { type: 'feature', text: 'Inline text editing via TipTap double-click' },
      { type: 'feature', text: 'User avatar chip + sign-out in the editor toolbar' },
      { type: 'fix',     text: 'Fixed malformed Canvas.tsx return structure' },
      { type: 'fix',     text: 'Resolved project-store.ts truncation at line 671' },
    ],
  },
  {
    version: 'v0.2.0',
    date: 'Mar 2026',
    label: 'Phase 3 — Editor core',
    badge: null,
    entries: [
      { type: 'feature', text: 'Workflow node editor with page-linking logic' },
      { type: 'feature', text: 'Animation tray: 15 scroll-triggered entrance presets' },
      { type: 'feature', text: 'AI Generate modal — Gemini & Groq layout generation' },
      { type: 'feature', text: 'Publish to URL via Supabase Storage + /v/:slug routes' },
      { type: 'feature', text: 'Export to PNG, JPEG, PDF, GIF, and standalone HTML' },
      { type: 'feature', text: 'Community gallery at /community' },
      { type: 'feature', text: 'Tutorial overlay for new users' },
      { type: 'fix',     text: 'Moveable handles now respect canvas transform correctly' },
      { type: 'fix',     text: 'Snap-to-grid now considers element transform origin' },
    ],
  },
  {
    version: 'v0.1.0',
    date: 'Feb 2026',
    label: 'Phase 1 — Foundation',
    badge: null,
    entries: [
      { type: 'feature', text: 'WYSIWYG canvas with pan, zoom, and snap-to-grid' },
      { type: 'feature', text: '12 native element types: text, image, video, button, icon, music, countdown, social, spacer, divider, QR, GIF' },
      { type: 'feature', text: 'Right-panel property inspector for all element types' },
      { type: 'feature', text: '5 themes × 2 modes × 3 densities × 3 chromes × 3 font pairings' },
      { type: 'feature', text: 'IndexedDB persistence across sessions' },
      { type: 'feature', text: 'Undo / redo with full history branching' },
      { type: 'feature', text: 'Multi-page project support' },
      { type: 'feature', text: 'Breakpoint switcher (desktop / tablet / mobile)' },
    ],
  },
];

const ICON_MAP = {
  feature: Star,
  fix:     Wrench,
  security: Shield,
  perf:    Zap,
};

const BADGE_COLOR: Record<string, string> = {
  feature:  'var(--accent)',
  fix:      'var(--text-dim)',
  security: '#ff8e53',
  perf:     '#8bff9a',
};

export default function ChangelogPage() {
  return (
    <main className={styles.page}>
      <MarketingNav />

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <motion.span className={styles.tag} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.5 }}>
          {'// changelog'}
        </motion.span>
        <motion.h1 className={styles.headline} initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1, duration:0.8, ease:[0.23,1,0.32,1] }}>
          What&apos;s <em>new</em> in Stakked.
        </motion.h1>
        <motion.p className={styles.lede} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2, duration:0.7 }}>
          Every release, from v0.1 to today — shipped in public, one phase at a time.
        </motion.p>
      </section>

      {/* ── Timeline ── */}
      <section className={styles.timelineSection}>
        {CHANGELOG.map((release, ri) => (
          <motion.div
            key={release.version}
            className={styles.release}
            initial={{ opacity:0, y:28 }}
            whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true, margin:'-60px' }}
            transition={{ delay: ri * 0.06, duration: 0.6, ease:[0.23,1,0.32,1] }}
          >
            <div className={styles.releaseHead}>
              <div className={styles.releaseVersion}>
                {release.version}
                {release.badge && <span className={styles.latestBadge}>{release.badge}</span>}
              </div>
              <div className={styles.releaseLabel}>{release.label}</div>
              <div className={styles.releaseDate}>{release.date}</div>
            </div>
            <div className={styles.releaseEntries}>
              {release.entries.map((entry, ei) => {
                const Icon = ICON_MAP[entry.type as keyof typeof ICON_MAP] ?? Star;
                return (
                  <div key={ei} className={styles.entry}>
                    <Icon size={12} style={{ color: BADGE_COLOR[entry.type], flexShrink:0, marginTop:2 }} />
                    <span className={styles.entryText}>{entry.text}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </section>

      {/* ── CTA ── */}
      <section className={styles.ctaSection}>
        <motion.div
          className={styles.ctaBox}
          initial={{ opacity:0, y:24 }}
          whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true, margin:'-40px' }}
          transition={{ duration:0.7 }}
        >
          <span className={styles.ctaBoxTag}>{'// start building'}</span>
          <h2 className={styles.ctaBoxTitle}>The canvas is ready.</h2>
          <p className={styles.ctaBoxBody}>No sign-up required to start building. Open the workspace and create your first project right now.</p>
          <div className={styles.ctaRow}>
            <Link href="/workspace" className={styles.ctaPrimary}>
              Open workspace <ArrowRight size={13} />
            </Link>
            <Link href="/features" className={styles.ctaGhost}>See all features</Link>
          </div>
        </motion.div>
      </section>

      <MarketingFooter />
    </main>
  );
}

function MarketingFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <span className={styles.footerBrand}>{'// stakked · creative os'}</span>
        <nav className={styles.footerNav}>
          <Link href="/features"     className={styles.footerLink}>Features</Link>
          <Link href="/how-it-works" className={styles.footerLink}>How it works</Link>
          <Link href="/docs"         className={styles.footerLink}>Docs</Link>
          <Link href="/changelog"    className={styles.footerLink}>Changelog</Link>
          <Link href="/community"    className={styles.footerLink}>Community</Link>
        </nav>
        <span className={styles.footerRight}>v0.3.0 · phase 5</span>
      </div>
    </footer>
  );
}
