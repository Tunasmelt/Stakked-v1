'use client';
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight,
  MonitorSmartphone, Sparkles, Download, Keyboard,
  Layers3, Palette, Zap, Globe, Lock, History,
  Type, Image as ImageIcon, Music, Video, FileText as TimerIcon, Square,
  List, MapPin, Star, ChevronRight, Minus, Share2,
  Quote, AlignLeft, PenLine, Box, Navigation, LayoutGrid, MousePointer2,
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
  { Icon: Type,          label: 'Text',        desc: 'Rich HTML editing via TipTap. Bold, italic, links, color, alignment.' },
  { Icon: ImageIcon,     label: 'Image',        desc: 'URL or Pexels stock search. objectFit, alt text, error fallback.' },
  { Icon: MousePointer2, label: 'Button',       desc: 'Custom label, URL, style. Inherits accent color from theme.' },
  { Icon: Share2,        label: 'Social Link',  desc: '40+ platforms with brand colors and icons. Icon-only or icon+text.' },
  { Icon: Music,         label: 'Music Player', desc: 'Spotify, SoundCloud, Apple Music embeds with native controls.' },
  { Icon: Video,         label: 'Video',        desc: 'YouTube, Vimeo, TikTok. Autoplay, loop, mute controls.' },
  { Icon: Minus,         label: 'Divider',      desc: 'Horizontal separator with adjustable weight, color, and style.' },
  { Icon: Globe,         label: 'Embed',        desc: 'Universal iframe embed. oEmbed resolver for major platforms.' },
  { Icon: LayoutGrid,    label: 'Gallery',      desc: 'Grid, masonry, bento, carousel, and strip layouts.' },
  { Icon: TimerIcon,     label: 'Countdown',    desc: 'Days/hours/minutes/seconds to a target date. Auto-starts on publish.' },
  { Icon: Star,          label: 'Icon',         desc: 'Iconify library with 150 000+ icons. Searchable.' },
  { Icon: Square,        label: 'Shape',        desc: 'Rect, circle, triangle, star, hexagon, arrow, cloud.' },
  { Icon: Box,           label: 'Container',    desc: 'Flex or grid wrapper for child elements. Stack or grid layout.' },
  { Icon: Navigation,    label: 'Navigation',   desc: 'Site nav bar with links, logo slot, and mobile collapse.' },
  { Icon: List,          label: 'Form',         desc: 'Text, email, textarea, checkbox fields. Submits to Supabase or custom URL.' },
  { Icon: MapPin,        label: 'Map',          desc: 'Mapbox, OpenStreetMap, or Google Maps embed. Lat/lng + zoom.' },
  { Icon: Quote,         label: 'Testimonial',  desc: 'Avatar, quote, author name and title. Customizable accent.' },
  { Icon: AlignLeft,     label: 'Marquee',      desc: 'Infinite horizontal scroll strip. Left or right direction.' },
  { Icon: ChevronRight,  label: 'Accordion',    desc: 'Expandable FAQ sections with Framer Motion spring animation.' },
  { Icon: LayoutGrid,    label: 'Tabs',         desc: 'Tabbed content with accent underline indicator.' },
  { Icon: Minus,         label: 'Line',         desc: 'Freeform straight line with color, weight, cap style.' },
  { Icon: PenLine,       label: 'Drawing',      desc: 'Freehand SVG paths drawn directly on the canvas.' },
];

const ANIMATIONS = [
  'fadeIn', 'fadeOut', 'slideUp', 'slideDown', 'slideLeft', 'slideRight',
  'zoomIn', 'zoomOut', 'bounceIn', 'flipX', 'flipY', 'rotate',
  'pulse', 'elastic', 'typewriter',
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
          <span>v0.3.0</span>
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
            22 elements. 15 animations.<br />
            <em>One canvas.</em>
          </h1>
          <p className={styles.lede}>
            Every feature listed here is live and shipped. No roadmap items, no coming-soon placeholders.
            Open the workspace and use all of it today.
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
        <h2>22 native element types.</h2>
        <p>All render natively on the canvas and compile to clean HTML on publish.</p>
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

      {/* ── Animation system ── */}
      <motion.div className={styles.sectionH} {...fade()}>
        <span className={styles.sectionIdx}>02 / motion</span>
        <h2>15 animation presets. 3 triggers.</h2>
        <p>Scroll, click, or hover. Combine with parallax and snap-scroll sections.</p>
      </motion.div>

      <div className={styles.sectionBody}>
        <motion.div
          className={styles.tiles}
          {...fade()}
          style={{ marginBottom: 24 }}
        >
          {[
            {
              Icon: Layers3,
              title: 'Scroll trigger',
              body: 'Animate on whileInView — fires once or repeats every time the element enters the viewport. Configurable threshold.',
            },
            {
              Icon: Zap,
              title: 'Click trigger',
              body: 'Toggle an animation on click. Combine with hover states for interactive elements like buttons and cards.',
            },
            {
              Icon: MonitorSmartphone,
              title: 'Parallax layers',
              body: 'Assign a scroll speed factor to any element. Positive values scroll slower (recede), negative values scroll faster (advance).',
            },
          ].map(({ Icon, title, body }) => (
            <div key={title} className={styles.tile}>
              <Icon size={22} className={styles.tileIcon} />
              <h3 className={styles.tileTitle}>{title}</h3>
              <p className={styles.tileBody}>{body}</p>
            </div>
          ))}
        </motion.div>

        <motion.div className={styles.elementGrid} {...fade()}>
          {ANIMATIONS.map((name) => (
            <div key={name} className={styles.elementChip}>
              <span>{name}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Canvas & editor ── */}
      <motion.div className={styles.sectionH} {...fade()}>
        <span className={styles.sectionIdx}>03 / editor</span>
        <h2>Built for power users.</h2>
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
              title: 'AI co-pilot',
              body: 'Generate full-page layouts from a text prompt. Extract color palettes from an image. Summarize page copy.',
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
        <span className={styles.sectionIdx}>04 / shortcuts</span>
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
        <span className={styles.sectionIdx}>05 / export</span>
        <h2>Ship anywhere, in any format.</h2>
        <p>From CDN URL to downloadable file — all formats from the Export menu.</p>
      </motion.div>

      <div className={styles.sectionBody}>
        <motion.div className={styles.tiles} {...fade()}>
          {[
            {
              Icon: Globe,
              title: 'Publish to CDN',
              body: 'One click compiles all pages to HTML and uploads to Supabase Storage. Your project is live at /v/your-slug instantly.',
            },
            {
              Icon: Download,
              title: 'Standalone HTML',
              body: 'Self-contained file. Inlines all styles, respects your custom CSS, analytics tags, and head/body code injections.',
            },
            {
              Icon: ImageIcon,
              title: 'PNG & JPEG',
              body: 'Canvas screenshot at any pixel ratio. Captures the exact rendered state including animations paused at frame 0.',
            },
            {
              Icon: Download,
              title: 'PDF',
              body: 'Multi-page PDF via jsPDF. One page per Stakked page. A4 and letter sizes supported.',
            },
            {
              Icon: Video,
              title: 'Animated GIF',
              body: 'Record canvas frames over a configurable duration and export as a compressed GIF — no server required.',
            },
            {
              Icon: Zap,
              title: 'SEO & analytics',
              body: 'Custom meta title, description, og:image, robots tag, Google Analytics ID, Plausible domain — all from Project Settings.',
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

      {/* ── Data & persistence ── */}
      <motion.div className={styles.sectionH} {...fade()}>
        <span className={styles.sectionIdx}>06 / data</span>
        <h2>Your data, always.</h2>
        <p>No lock-in. Your project is pure JSON — readable, portable, and yours.</p>
      </motion.div>

      <div className={styles.sectionBody} style={{ paddingBottom: 64 }}>
        <motion.div className={styles.tiles} {...fade()}>
          {[
            {
              Icon: History,
              title: 'Local-first via IndexedDB',
              body: 'Works offline. Auto-saves to browser storage every second. Cloud sync only runs when you\'re online.',
            },
            {
              Icon: Globe,
              title: 'Cloud sync via Supabase',
              body: 'Sign in to sync across devices. The newer copy wins — local and remote timestamps are compared on load.',
            },
            {
              Icon: Zap,
              title: 'Pure JSON format',
              body: 'The entire project — pages, elements, styles, animations — is one JSON document. Import and export any time.',
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

      <footer className={mstyles.footer}>
        <div className={mstyles.footerInner}>
          <span className={mstyles.footerBrand}>{'// stakked · features'}</span>
          <nav className={mstyles.footerNav}>
            <Link href="/how-it-works" className={mstyles.footerLink}>How it works</Link>
            <Link href="/docs"         className={mstyles.footerLink}>Docs</Link>
            <Link href="/changelog"    className={mstyles.footerLink}>Changelog</Link>
            <Link href="/workspace"    className={mstyles.footerLink}>Workspace →</Link>
          </nav>
          <span className={mstyles.footerRight}>v0.3.0</span>
        </div>
      </footer>
    </main>
  );
}
