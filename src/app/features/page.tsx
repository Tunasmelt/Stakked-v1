'use client';
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight,
  MonitorSmartphone, Sparkles, Download, Keyboard,
  Layers3, Palette, Zap, Globe, Lock, History,
  Type, Image as ImageIcon, Square, Minus, PenLine, Box,
  Star, Video, AlignLeft, LayoutGrid, MousePointer2,
} from 'lucide-react';
import MarketingNav from '@/components/marketing/MarketingNav';
import styles from '@/styles/Landing.module.css';
import mstyles from '@/styles/Marketing.module.css';

const fade = (i = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { delay: i * 0.07, duration: 0.55, ease: [0.23, 1, 0.32, 1] as [number,number,number,number] },
});

const ELEMENTS = [
  { Icon: Type,          label: 'Text',       desc: 'Rich HTML editing via TipTap. Bold, italic, links, color, alignment.' },
  { Icon: ImageIcon,     label: 'Image',      desc: 'URL or Pexels stock search. objectFit, alt text, error fallback.' },
  { Icon: Square,        label: 'Shape',      desc: 'Rect, circle, triangle, star, hexagon, arrow, cloud — all scaleable.' },
  { Icon: Minus,         label: 'Line',       desc: 'Straight line with adjustable weight, color, and cap style.' },
  { Icon: PenLine,       label: 'Drawing',    desc: 'Freehand SVG paths drawn directly on the canvas. Any color/weight.' },
  { Icon: Box,           label: 'Container',  desc: 'Flex or grid wrapper. Stack, align, and group child elements.' },
  { Icon: AlignLeft,     label: 'Divider',    desc: 'Horizontal separator with adjustable weight, color, and style.' },
  { Icon: MousePointer2, label: 'Button',     desc: 'Custom label, URL, style. Inherits accent color from theme.' },
  { Icon: Star,          label: 'Icon',       desc: 'Iconify library with 150 000+ icons. Searchable, scaleable.' },
  { Icon: Video,         label: 'Video',      desc: 'YouTube, Vimeo, TikTok. Autoplay, loop, mute controls.' },
  { Icon: Globe,         label: 'Embed',      desc: 'Universal iframe embed. oEmbed resolver for major platforms.' },
  { Icon: LayoutGrid,    label: 'Gallery',    desc: 'Grid, masonry, bento, carousel, and strip layouts.' },
];

const KEYBOARD = [
  { keys: 'Cmd / Ctrl + Z', action: 'Undo (50-step history)' },
  { keys: 'Cmd / Ctrl + Shift + Z', action: 'Redo' },
  { keys: 'Cmd / Ctrl + C / V', action: 'Copy / Paste' },
  { keys: 'Cmd / Ctrl + D', action: 'Duplicate selection' },
  { keys: 'Cmd / Ctrl + G', action: 'Group elements' },
  { keys: 'Cmd / Ctrl + Shift + G', action: 'Ungroup' },
  { keys: 'Cmd / Ctrl + A', action: 'Select all' },
  { keys: 'Arrow keys', action: 'Nudge (1 px) — hold Shift for 10 px' },
  { keys: 'Cmd / Ctrl + ] / [', action: 'Move forward / backward in z-order' },
  { keys: 'Del / Backspace', action: 'Delete selected' },
  { keys: 'Space + drag', action: 'Pan canvas' },
  { keys: 'Ctrl + scroll', action: 'Zoom in / out' },
];

export default function FeaturesPage() {
  return (
    <main className={styles.main}>
      <MarketingNav />

      <div className={styles.sysbar}>
        <div className={styles.sysLeft}>
          <span className={styles.dot} aria-hidden />
          <span>stakked · features</span>
          <span className={styles.sysSep}>·</span>
          <span>v1.0</span>
        </div>
        <div className={styles.sysRight}>
          <Link href="/" className={styles.sysSep} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowLeft size={10} /> home
          </Link>
        </div>
      </div>

      {/* ── Hero ── */}
      <section className={styles.brief} style={{ paddingBottom: 56 }}>
        <div className={styles.briefInner}>
          <span className={styles.tag}>{'// capabilities'}</span>
          <h1 className={styles.headline}>
            12 elements. Infinite combinations.<br />
            <em>One canvas.</em>
          </h1>
          <p className={styles.lede}>
            Every feature listed here is live and shipped. No roadmap items, no placeholders.
            Open the workspace and build something real today.
          </p>
          <div className={styles.ctaRow} style={{ marginTop: 24 }}>
            <Link href="/workspace" className={styles.cta}>
              <Zap size={13} /> Open workspace
            </Link>
            <Link href="/how-it-works" className={styles.ctaGhost}>
              See how it works <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Element types ── */}
      <motion.div className={styles.sectionH} {...fade()}>
        <span className={styles.sectionIdx}>01 / elements</span>
        <h2>12 native element types.</h2>
        <p>All render natively and compile to clean HTML on export or publish.</p>
      </motion.div>

      <div className={styles.sectionBody} style={{ paddingBottom: 48 }}>
        <div className={styles.featureTable}>
          {ELEMENTS.map(({ Icon, label, desc }, i) => (
            <motion.div key={label} className={styles.featureRow} {...fade(i * 0.025)}>
              <div className={styles.featureRowLeft}>
                <Icon size={14} className={styles.featureRowIcon} />
                <span className={styles.featureRowLabel}>{label}</span>
              </div>
              <span className={styles.featureRowDesc}>{desc}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Canvas & editor ── */}
      <motion.div className={styles.sectionH} {...fade()}>
        <span className={styles.sectionIdx}>02 / editor</span>
        <h2>Built for creators and power users.</h2>
        <p>Layers panel, multi-select, context menus, undo stack, and full keyboard control.</p>
      </motion.div>

      <div className={styles.sectionBody}>
        <motion.div className={styles.tiles} {...fade()}>
          {[
            {
              Icon: Layers3,
              title: 'Layers panel',
              body: 'Full element tree. Drag to reorder z-index. Toggle visibility. Lock elements against accidental edits.',
            },
            {
              Icon: MonitorSmartphone,
              title: 'Responsive breakpoints',
              body: 'Desktop, tablet, and mobile views. Per-breakpoint style overrides for position, size, typography, and fills.',
            },
            {
              Icon: Palette,
              title: '5 design themes',
              body: 'Ghost (dark), Velvet (purple), Chalk (light), Copper (warm), Glacier (blue). Live-swap without reloading.',
            },
            {
              Icon: History,
              title: '50-step undo history',
              body: 'Every action is committed to an in-memory history stack. Undo/redo never resets on cloud sync.',
            },
            {
              Icon: Lock,
              title: 'Lock & group',
              body: 'Lock elements to prevent edits. Group multiple elements for collective move, scale, and z-order changes.',
            },
            {
              Icon: Sparkles,
              title: 'AI layout generator',
              body: 'Generate full-page layouts from a text prompt. Positions, copy, and colors injected directly onto the canvas.',
            },
          ].map(({ Icon, title, body }) => (
            <div key={title} className={styles.tile}>
              <Icon size={22} className={styles.tileIcon} />
              <h3 className={styles.tileTitle}>{title}</h3>
              <p className={styles.tileBody}>{body}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Keyboard shortcuts ── */}
      <motion.div className={styles.sectionH} {...fade()}>
        <span className={styles.sectionIdx}>03 / shortcuts</span>
        <h2>Full keyboard control.</h2>
        <p>Every action is reachable without a mouse.</p>
      </motion.div>

      <div className={styles.sectionBody} style={{ paddingBottom: 48 }}>
        <motion.div className={styles.featureTable} {...fade()}>
          {KEYBOARD.map(({ keys, action }) => (
            <div key={keys} className={styles.featureRow}>
              <div className={styles.featureRowLeft}>
                <Keyboard size={13} className={styles.featureRowIcon} />
                <code className={styles.featureRowKey}>{keys}</code>
              </div>
              <span className={styles.featureRowDesc}>{action}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Export & publish ── */}
      <motion.div className={styles.sectionH} {...fade()}>
        <span className={styles.sectionIdx}>04 / export</span>
        <h2>Ship anywhere, in any format.</h2>
        <p>From CDN URL to downloadable file — all formats from the Export menu.</p>
      </motion.div>

      <div className={styles.sectionBody}>
        <motion.div className={styles.tiles} {...fade()}>
          {[
            {
              Icon: Globe,
              title: 'Publish to CDN',
              body: 'One click compiles pages to HTML and uploads to Supabase Storage. Live at /v/your-slug instantly.',
            },
            {
              Icon: Download,
              title: 'Standalone HTML',
              body: 'Self-contained file. Inlines styles, respects custom CSS, analytics tags, and head/body code injections.',
            },
            {
              Icon: ImageIcon,
              title: 'PNG & JPEG',
              body: 'Canvas screenshot at any pixel ratio. Captures the exact rendered state of your design.',
            },
            {
              Icon: Download,
              title: 'PDF',
              body: 'Multi-page PDF via jsPDF. One page per Stakked page. A4 and letter sizes supported.',
            },
            {
              Icon: Zap,
              title: 'SEO & analytics',
              body: 'Custom meta title, description, og:image, robots tag, Google Analytics ID, Plausible domain — all from Project Settings.',
            },
            {
              Icon: History,
              title: 'Local-first & cloud sync',
              body: 'Works offline via IndexedDB. Sign in to sync across devices with Supabase cloud storage.',
            },
          ].map(({ Icon, title, body }) => (
            <div key={title} className={styles.tile}>
              <Icon size={22} className={styles.tileIcon} />
              <h3 className={styles.tileTitle}>{title}</h3>
              <p className={styles.tileBody}>{body}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Bottom CTA ── */}
      <div style={{ padding: '48px clamp(16px,4vw,48px) 64px' }}>
        <motion.div
          {...fade()}
          style={{
            padding: '40px 36px',
            border: '1px solid color-mix(in oklab, var(--accent) 25%, var(--line))',
            borderRadius: 'var(--r-lg)',
            background: 'color-mix(in oklab, var(--accent) 5%, var(--surface))',
            display: 'flex',
            flexDirection: 'column' as const,
            gap: 16,
          }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', color: 'var(--accent)', textTransform: 'uppercase' as const }}>{'// build now'}</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,3vw,36px)', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', margin: 0 }}>
            Ready to create?
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-mute)', lineHeight: 1.6, maxWidth: 480, margin: 0 }}>
            No account needed to start. Open the workspace and your first canvas is ready in seconds.
          </p>
          <div className={styles.ctaRow}>
            <Link href="/workspace" className={styles.cta}>
              <Zap size={13} /> Open workspace free
            </Link>
            <Link href="/how-it-works" className={styles.ctaGhost}>
              How it works <ArrowRight size={12} />
            </Link>
          </div>
        </motion.div>
      </div>

      <footer className={mstyles.footer}>
        <div className={mstyles.footerInner}>
          <span className={mstyles.footerBrand}>{'// stakked · features'}</span>
          <nav className={mstyles.footerNav}>
            <Link href="/how-it-works" className={mstyles.footerLink}>How it works</Link>
            <Link href="/docs"         className={mstyles.footerLink}>Docs</Link>
            <Link href="/changelog"    className={mstyles.footerLink}>Changelog</Link>
            <Link href="/workspace"    className={mstyles.footerLink}>Workspace →</Link>
          </nav>
          <span className={mstyles.footerRight}>v1.0</span>
        </div>
      </footer>
    </main>
  );
}
