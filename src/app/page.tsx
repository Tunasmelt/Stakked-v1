'use client';
/**
 * / — Stakked landing page
 */
import React from 'react';
import Link from 'next/link';
import {
  ArrowRight, Boxes, Layers3, Sparkles, MousePointer2,
  Wand2, Share2, Rocket, Play, Zap, Globe, Download,
  Type, Image as ImageIcon, Music, Video, FileText as TimerIcon, Square,
  List, MapPin, Star, ChevronRight, Minus, Navigation, LayoutGrid,
  Quote, AlignLeft, PenLine, Box,
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
  { Icon: MousePointer2, label: 'Button' },
  { Icon: Music,         label: 'Music' },
  { Icon: Video,         label: 'Video' },
  { Icon: TimerIcon,     label: 'Countdown' },
  { Icon: MapPin,        label: 'Map' },
  { Icon: List,          label: 'Form' },
  { Icon: LayoutGrid,    label: 'Gallery' },
  { Icon: Square,        label: 'Shape' },
  { Icon: Star,          label: 'Icon' },
  { Icon: ChevronRight,  label: 'Accordion' },
  { Icon: LayoutGrid,    label: 'Tabs' },
  { Icon: Minus,         label: 'Divider' },
  { Icon: AlignLeft,     label: 'Marquee' },
  { Icon: Share2,        label: 'Social' },
  { Icon: Quote,         label: 'Testimonial' },
  { Icon: Navigation,    label: 'Navigation' },
  { Icon: Globe,         label: 'Embed' },
  { Icon: Box,           label: 'Container' },
  { Icon: PenLine,       label: 'Drawing' },
  { Icon: Minus,         label: 'Line' },
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
          <span>stakked · creative os</span>
          <span className={styles.sysSep}>·</span>
          <span>v0.3.0 · phase 5</span>
        </div>
        <div className={styles.sysRight}>
          <span>{'// 22 element types · 15 animation presets · 5 themes'}</span>
        </div>
      </motion.div>

      {/* ── Hero ── */}
      <section className={styles.brief}>
        <div className={styles.briefInner}>
          <motion.span className={styles.tag} {...fade(0.1)}>
            {'// visual builder · for digital artists'}
          </motion.span>

          <motion.h1 className={styles.headline} {...fade(0.2)}>
            22 elements. Animate anything.
            <br /><em>Ship in one click.</em>
          </motion.h1>

          <motion.p className={styles.lede} {...fade(0.3)}>
            Stakked is a drag-and-drop canvas for musicians, designers, and photographers.
            Drop elements, wire up scroll animations, generate layouts with AI, then publish
            to a CDN URL — no code, no config, no hosting bill.
          </motion.p>

          <motion.div className={styles.ctaRow} {...fade(0.4)}>
            <Link href="/workspace" className={styles.cta}>
              <Rocket size={13} /> Open workspace
            </Link>
            <Link href="/how-it-works" className={styles.ctaGhost}>
              <Play size={13} />
              How it works
            </Link>
          </motion.div>

          <motion.dl className={styles.meta} {...fade(0.55)}>
            <div><dt>Elements</dt><dd>22 native types</dd></div>
            <div><dt>Animations</dt><dd>15 presets + parallax</dd></div>
            <div><dt>Themes</dt><dd>5 palettes · live swap</dd></div>
            <div><dt>Export</dt><dd>HTML · PNG · PDF · GIF</dd></div>
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
        <h2>Every building block you need, built in.</h2>
        <p>No embeds, no iframes. Each element renders natively and exports to clean HTML.</p>
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
        <h2>A canvas that thinks and ships.</h2>
        <p>From first element to live URL — everything in one tool.</p>
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
              body: 'Moveable handles for every element. Multi-select, group, lock, and reorder via the Layers panel. Right-click for context actions.',
            },
            {
              Icon: Layers3,
              title: '15 animation presets',
              body: 'fadeIn, slideUp, zoomIn, typewriter, elastic, bounce — triggered on scroll, click, or hover. Parallax and snap-scroll sections included.',
            },
            {
              Icon: Sparkles,
              title: 'AI layout generator',
              body: 'Describe your project and Gemini or Groq generates a full page layout — copy, colors, and positions — injected directly onto your canvas.',
            },
            {
              Icon: Boxes,
              title: 'Responsive breakpoints',
              body: 'Desktop, tablet, and mobile views with per-breakpoint style overrides. Switch with one click; changes never bleed across breakpoints.',
            },
            {
              Icon: Wand2,
              title: 'Workflow node editor',
              body: 'Connect pages with visual trigger nodes. Set conditions, fire custom events, and orchestrate multi-page transitions without writing JavaScript.',
            },
            {
              Icon: Download,
              title: 'Export everything',
              body: 'Publish to a CDN URL or download standalone HTML. Also export as high-res PNG, JPEG, PDF, or animated GIF from the Export menu.',
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
        <span className={styles.sectionIdx}>03 / workflow</span>
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
            gridTemplateColumns: 'repeat(5, 1fr)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--r-md)',
            overflow: 'hidden',
            background: 'var(--surface)',
          }}
        >
          {[
            { num: '01', label: 'Drag elements',    sub: '22 types from the left tray' },
            { num: '02', label: 'Generate with AI', sub: 'Prompt Gemini or Groq' },
            { num: '03', label: 'Add motion',       sub: 'Scroll triggers, parallax, springs' },
            { num: '04', label: 'Preview live',     sub: 'Real tab, real breakpoints' },
            { num: '05', label: 'Publish',          sub: 'CDN URL or download HTML' },
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
          No sign-up required to start. Your work saves locally via IndexedDB.
          Create a free account any time to sync to the cloud and publish to a shareable URL.
        </p>
        <div className={styles.ctaRow}>
          <Link href="/workspace" className={styles.cta}>
            <Zap size={13} /> Open workspace free
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
          <span>v0.3.0</span>
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
