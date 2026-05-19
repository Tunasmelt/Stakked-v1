'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Key, Palette, HardDrive, Cpu, TerminalSquare } from 'lucide-react';
import MarketingNav from '@/components/marketing/MarketingNav';
import styles from '@/styles/Landing.module.css';
import mstyles from '@/styles/Marketing.module.css';

export default function DocsPage() {
  return (
    <main className={styles.main}>
      <MarketingNav />

      <div className={styles.sysbar}>
        <div className={styles.sysLeft}>
          <span className={styles.dot} aria-hidden />
          <span>stakked · documentation</span>
          <span className={styles.sysSep}>·</span>
          <span>v0.3.0</span>
        </div>
        <div className={styles.sysRight}>
          <Link href="/" className={styles.sysSep} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowLeft size={10} /> return home
          </Link>
        </div>
      </div>

      <section className={styles.brief} style={{ paddingBottom: '64px' }}>
        <div className={styles.briefInner}>
          <span className={styles.tag}>{'// handbook'}</span>
          <h1 className={styles.headline}>
            Official <em>developer</em> documentation.
          </h1>
          <p className={styles.lede}>
            Comprehensive guides covering the core Stakked architecture, state stores,
            UI tokens, and instructions for building custom elements and themes.
          </p>
        </div>
      </section>

      <div className={styles.sectionH}>
        <span className={styles.sectionIdx}>01 / getting started</span>
        <h2>Core Concepts</h2>
      </div>

      <div className={styles.sectionBody}>
        <div className={styles.tiles}>
          <Link href="/docs/infrastructure" style={{ textDecoration: 'none', color: 'inherit' }} className={styles.tile}>
            <HardDrive size={22} className={styles.tileIcon} />
            <h3 className={styles.tileTitle}>Stores & State</h3>
            <p className={styles.tileBody}>
              Understanding Zustand in Stakked. Project, Editor, and UI stores, history tracking, and JSON serialization.
            </p>
          </Link>
          <Link href="/docs/theme-engine" style={{ textDecoration: 'none', color: 'inherit' }} className={styles.tile}>
            <Palette size={22} className={styles.tileIcon} />
            <h3 className={styles.tileTitle}>Theme Engine</h3>
            <p className={styles.tileBody}>
              The Claude Design primitive model. CSS variables, active theme resolution, and semantic token mapping.
            </p>
          </Link>
          <Link href="/docs/api-keys" style={{ textDecoration: 'none', color: 'inherit' }} className={styles.tile}>
            <Key size={22} className={styles.tileIcon} />
            <h3 className={styles.tileTitle}>Credentials & Keys</h3>
            <p className={styles.tileBody}>
              How to configure Supabase, Gemini, Groq, and external asset providers in your <code>.env.local</code>.
            </p>
          </Link>
        </div>
      </div>

      <div className={styles.sectionH}>
        <span className={styles.sectionIdx}>02 / advanced guides</span>
        <h2>Extending the Engine</h2>
      </div>

      <div className={styles.sectionBody}>
        <div className={styles.tiles}>
          <Link href="/docs/custom-elements" style={{ textDecoration: 'none', color: 'inherit' }} className={styles.tile}>
            <Cpu size={22} className={styles.tileIcon} />
            <h3 className={styles.tileTitle}>Custom Elements</h3>
            <p className={styles.tileBody}>
              Hooking into the element factory. Defining strict props, interactive previews, and properties panel bindings.
            </p>
          </Link>
          <Link href="/docs/animation-logic" style={{ textDecoration: 'none', color: 'inherit' }} className={styles.tile}>
            <BookOpen size={22} className={styles.tileIcon} />
            <h3 className={styles.tileTitle}>Animation Logic</h3>
            <p className={styles.tileBody}>
              Using the intersection observer, framer-style loops, and building new scroll presets.
            </p>
          </Link>
          <Link href="/docs/cli-tools" style={{ textDecoration: 'none', color: 'inherit' }} className={styles.tile}>
            <TerminalSquare size={22} className={styles.tileIcon} />
            <h3 className={styles.tileTitle}>CLI Generators</h3>
            <p className={styles.tileBody}>
              Workflows for exporting <code>.stk</code> files and running automated testing suites against your components.
            </p>
          </Link>
        </div>
      </div>

      <footer className={mstyles.footer}>
        <div className={mstyles.footerInner}>
          <span className={mstyles.footerBrand}>{'// stakked · documentation'}</span>
          <nav className={mstyles.footerNav}>
            <Link href="/features"     className={mstyles.footerLink}>Features</Link>
            <Link href="/how-it-works" className={mstyles.footerLink}>How it works</Link>
            <Link href="/changelog"    className={mstyles.footerLink}>Changelog</Link>
            <Link href="/workspace"    className={mstyles.footerLink}>Workspace →</Link>
          </nav>
          <span className={mstyles.footerRight}>v0.3.0</span>
        </div>
      </footer>
    </main>
  );
}
