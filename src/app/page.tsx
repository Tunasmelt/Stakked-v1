'use client';
/**
 * / — Stakked landing page
 */
import React from 'react';
import Link from 'next/link';
import {
  ArrowRight, Rocket, Zap, Download, Globe,
  Type, Image as ImageIcon, Square, Minus, PenLine, Box,
  MousePointer2, Star, Video, AlignLeft, LayoutGrid,
  Sparkles, Layers3, Share2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import MarketingNav from '@/components/marketing/MarketingNav';
import styles from '@/styles/Landing.module.css';

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.7, ease: [0.23, 1, 0.32, 1] as [number,number,number,number] },
});

const ELEMENT_TYPES = [
  { Icon: Type,          label: 'Text' },
  { Icon: ImageIcon,     label: 'Image' },
  { Icon: Square,        label: 'Shape' },
  { Icon: Minus,         label: 'Line' },
  { Icon: PenLine,       label: 'Drawing' },
  { Icon: Box,           label: 'Container' },
  { Icon: AlignLeft,     label: 'Divider' },
  { Icon: MousePointer2, label: 'Button' },
  { Icon: Star,          label: 'Icon' },
  { Icon: Video,         label: 'Video' },
  { Icon: Globe,         label: 'Embed' },
  { Icon: LayoutGrid,    label: 'Gallery' },
];

export default function LandingPage() {
  return (
    <main className={styles.main}>
      <MarketingNav />

      {/* ── System status bar ── */}
      <motion.div
        className={styles.sysbar}
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.sysLeft}>
          <span className={styles.dot} aria-hidden />
          <span>stakked · creative canvas</span>
          <span className={styles.sysSep}>·</span>
          <span>v1.0</span>
        </div>
        <div className={styles.sysRight}>
          <span>{'// 12 elements · drag & drop · publish instantly'}</span>
        </div>
      </motion.div>

      {/* ── Hero ── */}
      <section className={styles.brief}>
        <div className={styles.briefInner}>
          <motion.span className={styles.tag} {...fade(0.1)}>
            {'// canvas for creators'}
          </motion.span>

          <motion.h1 className={styles.headline} {...fade(0.2)}>
            Make anything visual.
            <br /><em>Ship it in one click.</em>
          </motion.h1>

          <motion.p className={styles.lede} {...fade(0.3)}>
            Stakked is a drag-and-drop canvas for artists, designers, and photographers.
            Build graphics, webpages, and digital art — then publish to a live URL
            or export as HTML. No code. No config. Just create.
          </motion.p>

          <motion.div className={styles.ctaRow} {...fade(0.4)}>
            <Link href="/workspace" className={styles.cta}>
              <Rocket size={13} /> Start creating free
            </Link>
            <Link href="/how-it-works" className={styles.ctaGhost}>
              <ArrowRight size={13} />
              How it works
            </Link>
          </motion.div>

          <motion.dl className={styles.meta} {...fade(0.55)}>
            <div><dt>Elements</dt><dd>12 native types</dd></div>
            <div><dt>Themes</dt><dd>5 palettes · live swap</dd></div>
            <div><dt>Export</dt><dd>HTML · PNG · PDF</dd></div>
            <div><dt>Publish</dt><dd>CDN URL · one click</dd></div>
          </motion.dl>
        </div>
      </section>

      {/* ── Element type showcase ── */}
      <motion.div
        className={styles.sectionH}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-80px' }}
      >
        <span className={styles.sectionIdx}>01 / elements</span>
        <h2>Everything you need to build, built in.</h2>
        <p>12 native element types — no embeds, no plugins, no overhead. Each one exports to clean HTML.</p>
      </motion.div>

      <div className={styles.sectionBody} style={{ paddingBottom: 40 }}>
        <motion.div
          className={styles.elementGrid}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7 }}
        >
          {ELEMENT_TYPES.map(({ Icon, label }) => (
            <div key={label} className={styles.elementChip}>
              <Icon size={13} />
              <span>{label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Core features ── */}
      <motion.div
        className={styles.sectionH}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-80px' }}
      >
        <span className={styles.sectionIdx}>02 / capabilities</span>
        <h2>A canvas built for makers.</h2>
        <p>From blank canvas to live URL — everything in one focused tool.</p>
      </motion.div>

      <div className={styles.sectionBody}>
        <motion.div
          className={styles.tiles}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8 }}
        >
          {[
            {
              Icon: MousePointer2,
              title: 'Drag, resize, layer',
              body: 'Pixel-perfect handles on every element. Multi-select, group, lock, align, and reorder via the Layers panel. Right-click for context actions.',
            },
            {
              Icon: Layers3,
              title: 'Full style control',
              body: 'Colors, gradients, borders, shadows, typography, opacity — all exposed in the Properties panel. What you see is exactly what exports.',
            },
            {
              Icon: Sparkles,
              title: 'AI layout generator',
              body: 'Describe your project and the AI generates a full page layout — copy, colors, and positions — injected directly onto your canvas.',
            },
            {
              Icon: Share2,
              title: 'Responsive breakpoints',
              body: 'Desktop, tablet, and mobile views with per-breakpoint overrides. Switch with one click; changes never bleed across breakpoints.',
            },
            {
              Icon: Globe,
              title: 'Publish anywhere',
              body: 'Hit Publish and get a live CDN-backed URL instantly. Share it, embed it, or point your custom domain to it.',
            },
            {
              Icon: Download,
              title: 'Export everything',
              body: 'Download standalone HTML with all interactivity intact. Also export as high-res PNG, JPEG, or PDF from the Export menu.',
            },
          ].map(({ Icon, title, body }) => (
            <motion.div
              key={title}
              className={styles.tile}
              whileHover={{ y: -4, boxShadow: 'inset 0 0 0 1px var(--accent)', transition: { duration: 0.18 } }}
            >
              <Icon size={22} className={styles.tileIcon} />
              <h3 className={styles.tileTitle}>{title}</h3>
              <p className={styles.tileBody}>{body}</p>
            </motion.div>
          ))}
        </motion.div>

        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
          <Link href="/features" className={styles.ctaGhost} style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
            Full feature breakdown <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* ── How it works ── */}
      <motion.div
        className={styles.sectionH}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-80px' }}
      >
        <span className={styles.sectionIdx}>03 / process</span>
        <h2>Canvas to live URL. No build step.</h2>
        <p>Open the editor and ship. No config files, no terminal required.</p>
      </motion.div>

      <div className={styles.sectionBody}>
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--r-md)',
            overflow: 'hidden',
            background: 'var(--surface)',
          }}
        >
          {[
            { num: '01', label: 'Drop elements',   sub: '12 types from the left panel' },
            { num: '02', label: 'Style freely',     sub: 'Colors, fonts, shapes, layers' },
            { num: '03', label: 'Preview live',     sub: 'Real tab, real breakpoints' },
            { num: '04', label: 'Publish',          sub: 'CDN URL or download HTML' },
          ].map((step, i, arr) => (
            <div
              key={step.num}
              style={{
                padding: '20px 16px',
                borderRight: i < arr.length - 1 ? '1px solid var(--line)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                textAlign: 'center',
                alignItems: 'center',
              }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent)', letterSpacing: '0.14em' }}>
                {step.num}
              </span>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                {step.label}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)', lineHeight: 1.5 }}>
                {step.sub}
              </span>
            </div>
          ))}
        </motion.div>
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <Link href="/how-it-works" className={styles.ctaGhost} style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
            Full walkthrough <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* ── Bottom CTA ── */}
      <motion.div
        style={{
          margin: '0 clamp(16px,4vw,48px) 64px',
          padding: '48px 40px',
          border: '1px solid color-mix(in oklab, var(--accent) 25%, var(--line))',
          borderRadius: 'var(--r-lg)',
          background: 'color-mix(in oklab, var(--accent) 5%, var(--surface))',
          display: 'flex',
          flexDirection: 'column' as const,
          gap: 16,
        }}
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.8 }}
      >
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', color: 'var(--accent)', textTransform: 'uppercase' as const }}>
          {'// start building'}
        </span>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,3.5vw,40px)', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', margin: 0 }}>
          The canvas is always open.
        </h2>
        <p style={{ fontSize: 15, color: 'var(--text-mute)', lineHeight: 1.6, maxWidth: 560, margin: 0 }}>
          No sign-up required to start. Your work saves locally in your browser.
          Create a free account any time to sync to the cloud and publish to a shareable URL.
        </p>
        <div className={styles.ctaRow}>
          <Link href="/workspace" className={styles.cta}>
            <Zap size={13} /> Open canvas free
          </Link>
          <Link href="/auth/signup" className={styles.ctaGhost}>
            Create account <ArrowRight size={12} />
          </Link>
        </div>
      </motion.div>

      {/* ── Footer ── */}
      <motion.div
        className={styles.foot}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className={styles.leftFoot}>
          <span>{'// stakked'}</span>
          <span>v1.0</span>
        </div>
        <div className={styles.rightFoot}>
          <Link href="/features"     style={{ color: 'var(--text-dim)', textDecoration: 'none', fontFamily: 'var(--font-mono)', fontSize: 10 }}>Features</Link>
          <Link href="/how-it-works" style={{ color: 'var(--text-dim)', textDecoration: 'none', fontFamily: 'var(--font-mono)', fontSize: 10 }}>How it works</Link>
          <Link href="/docs"         style={{ color: 'var(--text-dim)', textDecoration: 'none', fontFamily: 'var(--font-mono)', fontSize: 10 }}>Docs</Link>
          <Link href="/changelog"    style={{ color: 'var(--text-dim)', textDecoration: 'none', fontFamily: 'var(--font-mono)', fontSize: 10 }}>Changelog</Link>
          <Link href="/community"    style={{ color: 'var(--text-dim)', textDecoration: 'none', fontFamily: 'var(--font-mono)', fontSize: 10 }}>Community</Link>
        </div>
      </motion.div>
    </main>
  );
}
