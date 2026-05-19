import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import MarketingNav from '@/components/marketing/MarketingNav';
import styles from '@/styles/Landing.module.css';

export const metadata = { title: 'Credentials & Keys · Stakked Docs' };

export default function ApiKeysPage() {
  return (
    <main className={styles.main}>
      <MarketingNav />
      <div className={styles.sysbar}>
        <div className={styles.sysLeft}>
          <span className={styles.dot} aria-hidden />
          <span>stakked · docs · credentials &amp; keys</span>
        </div>
        <div className={styles.sysRight}>
          <Link href="/docs" className={styles.sysSep} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            <ArrowLeft size={10} /> docs home
          </Link>
        </div>
      </div>

      <section className={styles.brief}>
        <div className={styles.briefInner}>
          <span className={styles.tag}>{'// credentials & keys'}</span>
          <h1 className={styles.headline}>Configuring <em>external services.</em></h1>
          <p className={styles.lede}>All secrets live in <code>.env.local</code> and are never committed to source control. Copy <code>.env.example</code> and fill in the values below.</p>
        </div>
      </section>

      <div className={styles.sectionBody} style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)', marginBottom: 8 }}>Supabase</h2>
        <p style={{ color: 'var(--text-mute)', lineHeight: 1.7, marginBottom: 8 }}>
          Required for auth, project persistence, and publish. Create a free project at <strong>supabase.com</strong>, then copy the URL and anon key from <em>Settings → API</em>.
        </p>
        <ul style={{ color: 'var(--text-mute)', lineHeight: 2, marginBottom: 32, paddingLeft: 20 }}>
          <li><code>NEXT_PUBLIC_SUPABASE_URL</code></li>
          <li><code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code></li>
        </ul>

        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)', marginBottom: 8 }}>Gemini (Google AI)</h2>
        <p style={{ color: 'var(--text-mute)', lineHeight: 1.7, marginBottom: 8 }}>
          Powers the AI generation modal (<em>Generate with AI</em>). Obtain a key from Google AI Studio. The app falls back to Groq if this key is absent.
        </p>
        <ul style={{ color: 'var(--text-mute)', lineHeight: 2, marginBottom: 32, paddingLeft: 20 }}>
          <li><code>GEMINI_API_KEY</code></li>
        </ul>

        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)', marginBottom: 8 }}>Groq</h2>
        <p style={{ color: 'var(--text-mute)', lineHeight: 1.7, marginBottom: 8 }}>
          Alternative AI provider used for fast inference when Gemini is unavailable. Obtain a key at <strong>console.groq.com</strong>.
        </p>
        <ul style={{ color: 'var(--text-mute)', lineHeight: 2, marginBottom: 32, paddingLeft: 20 }}>
          <li><code>GROQ_API_KEY</code></li>
        </ul>

        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)', marginBottom: 8 }}>Mapbox</h2>
        <p style={{ color: 'var(--text-mute)', lineHeight: 1.7, marginBottom: 8 }}>
          Enables the Mapbox provider inside Map elements. Without this token the Map element shows a clear placeholder instead of an invisible broken iframe. OpenStreetMap and Google Maps embed modes require no token.
        </p>
        <ul style={{ color: 'var(--text-mute)', lineHeight: 2, marginBottom: 32, paddingLeft: 20 }}>
          <li><code>NEXT_PUBLIC_MAPBOX_TOKEN</code></li>
        </ul>

        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)', marginBottom: 8 }}>Pexels</h2>
        <p style={{ color: 'var(--text-mute)', lineHeight: 1.7, marginBottom: 8 }}>
          Enables stock image search inside the Asset Panel. Without it the search returns empty results (graceful degradation — no errors). Get a free key at <strong>pexels.com/api</strong>.
        </p>
        <ul style={{ color: 'var(--text-mute)', lineHeight: 2, marginBottom: 32, paddingLeft: 20 }}>
          <li><code>PEXELS_API_KEY</code></li>
        </ul>

        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)', marginBottom: 8 }}>App URL</h2>
        <p style={{ color: 'var(--text-mute)', lineHeight: 1.7 }}>
          Used to generate absolute URLs in published pages and auth redirects. Set to your deployed domain in production; leave as <code>http://localhost:3000</code> in development.
        </p>
        <ul style={{ color: 'var(--text-mute)', lineHeight: 2, marginBottom: 0, paddingLeft: 20 }}>
          <li><code>NEXT_PUBLIC_SITE_URL</code></li>
        </ul>
      </div>
    </main>
  );
}
