'use client';
/**
 * /how-it-works — Stakked marketing page
 * Step-by-step explainer: canvas → animate → publish
 */
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MousePointer2, Sparkles, Layers3, Rocket,
  MonitorSmartphone, Wand2, ArrowRight,
} from 'lucide-react';
import MarketingNav from '@/components/marketing/MarketingNav';
import styles from '@/styles/Marketing.module.css';

const STEPS = [
  {
    num: '01',
    icon: MousePointer2,
    title: 'Open the canvas',
    body: 'Your workspace starts blank. Drag any of the 22 element types from the left tray — text, images, music players, countdowns, maps, forms, shapes, galleries — and arrange them on the canvas. Resize with handles, reorder in the Layers panel.',
    tag: '// start',
  },
  {
    num: '02',
    icon: Sparkles,
    title: 'Generate with AI',
    body: 'Open the AI modal, describe your project ("neon DJ portfolio with a show schedule"), and Gemini or Groq generates a full layout with positioned elements, copy, and colors. Everything lands on your canvas as editable elements — nothing is locked.',
    tag: '// generate',
  },
  {
    num: '03',
    icon: Wand2,
    title: 'Add motion & interactions',
    body: 'Select any element and open the Animation panel. Pick from 15 presets — fadeIn, slideUp, typewriter, elastic bounce — and choose a trigger: scroll into view, click, or hover. Add parallax scroll factors for depth. Chain pages with the Workflow node editor.',
    tag: '// animate',
  },
  {
    num: '04',
    icon: Layers3,
    title: 'Preview in real-time',
    body: 'Click Preview to open your exact published output in a new tab — animations firing, forms interactive, multi-page navigation working. Switch between desktop, tablet, and mobile to verify your responsive breakpoint overrides.',
    tag: '// preview',
  },
  {
    num: '05',
    icon: MonitorSmartphone,
    title: 'Publish or export',
    body: 'Hit Publish to compile every page to standalone HTML and deploy to a CDN URL at /v/your-slug. Or use the Export menu to download HTML, PNG, JPEG, PDF, or an animated GIF — all client-side, no server round-trip needed.',
    tag: '// ship',
  },
];

const FAQS = [
  {
    q: 'Do I need an account to start?',
    a: 'No. Build and preview indefinitely as a guest. Your projects auto-save to browser IndexedDB every second. Create a free account to sync across devices and publish to a public URL.',
  },
  {
    q: 'What does the exported HTML look like?',
    a: 'A self-contained file — all styles inline, no external JS bundles, no iframes for native elements. Your custom CSS, analytics tags, and head/body code injections from Project Settings are all included.',
  },
  {
    q: 'Which AI models are supported?',
    a: 'Google Gemini 2.0 Flash and Groq (Llama 3.3 70B) are both included. The app auto-falls back to Groq if your Gemini key is absent. Both run on free tiers.',
  },
  {
    q: 'How does multi-page work?',
    a: 'Add pages from the bottom page bar. Each page compiles to its own HTML file (index.html, page-1.html, …). Navigation elements and Workflow node links resolve across pages automatically on publish.',
  },
  {
    q: 'Can I use my own domain?',
    a: 'The publish pipeline uploads to a Supabase Storage CDN URL at /v/your-slug. For a custom domain, point your DNS to that URL or download the HTML and host it anywhere.',
  },
  {
    q: 'Is the canvas infinite?',
    a: 'Yes. Pan with Spacebar+drag or the hand tool. Zoom with Ctrl+scroll. The Fit button in the toolbar scales to show the entire page.',
  },
];


export default function HowItWorksPage() {
  return (
    <main className={styles.page}>
      <MarketingNav />

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <motion.span className={styles.tag}
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}>
          {'// how it works'}
        </motion.span>
        <motion.h1 className={styles.headline}
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8 }}>
          From canvas<br />to <em>live URL</em> in five steps.
        </motion.h1>
        <motion.p className={styles.lede}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}>
          Stakked is a visual builder for digital artists. Here&apos;s exactly how a project
          goes from idea to published page.
        </motion.p>
      </section>

      {/* ── Steps ── */}
      <section className={styles.stepsSection}>
        <div className={styles.stepsGrid}>
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              className={styles.stepCard}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.08, duration: 0.6, ease: [0.23,1,0.32,1] }}
            >
              <div className={styles.stepHead}>
                <span className={styles.stepNum}>{step.num}</span>
                <span className={styles.stepTag}>{step.tag}</span>
              </div>
              <step.icon size={24} className={styles.stepIcon} />
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepBody}>{step.body}</p>
            </motion.div>
          ))}

          {/* CTA card */}
          <motion.div
            className={`${styles.stepCard} ${styles.stepCta}`}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ delay: STEPS.length * 0.08, duration: 0.6 }}
          >
            <Rocket size={28} className={styles.stepIcon} />
            <h3 className={styles.stepTitle}>Ready to build?</h3>
            <p className={styles.stepBody}>
              Open the workspace and start your first project — no sign-up required.
            </p>
            <div className={styles.ctaRow}>
              <Link href="/workspace" className={styles.ctaPrimary}>
                Open workspace <ArrowRight size={13} />
              </Link>
              <Link href="/auth/signup" className={styles.ctaGhost}>
                Create account
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className={styles.faqSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIdx}>{'// faq'}</span>
          <h2 className={styles.sectionTitle}>Common questions</h2>
        </div>
        <div className={styles.faqGrid}>
          {FAQS.map((f, i) => (
            <motion.div
              key={i}
              className={styles.faqCard}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
            >
              <h4 className={styles.faqQ}>{f.q}</h4>
              <p  className={styles.faqA}>{f.a}</p>
            </motion.div>
          ))}
        </div>
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
          <Link href="/features" className={styles.footerLink}>Features</Link>
          <Link href="/how-it-works" className={styles.footerLink}>How it works</Link>
          <Link href="/docs" className={styles.footerLink}>Docs</Link>
          <Link href="/changelog" className={styles.footerLink}>Changelog</Link>
          <Link href="/community" className={styles.footerLink}>Community</Link>
        </nav>
        <span className={styles.footerRight}>v0.3.0 · phase 5</span>
      </div>
    </footer>
  );
}
