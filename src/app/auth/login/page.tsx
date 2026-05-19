'use client';
/**
 * /auth/login — Stakked sign-in
 * Design: matches the Stakked landing page visual language
 *   • Grid texture background
 *   • System bar with mono identifier
 *   • Lime (#d6ff3d) accent
 *   • JetBrains Mono for labels + buttons
 */

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import styles from '@/styles/Auth.module.css';

function LoginForm() {
  const router       = useRouter();
  const params       = useSearchParams();
  const errorParam   = params.get('error');

  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(errorParam);
  const [info, setInfo]             = useState<string | null>(null);
  const [forgotMode, setForgotMode] = useState(false);

  // Redirect if already signed in
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace('/workspace');
    });
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) { setError(err.message); setLoading(false); }
    else router.replace('/workspace');
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    });
    setLoading(false);
    if (err) setError(err.message);
    else { setInfo('Password reset link sent — check your email.'); setForgotMode(false); }
  };

  const handleGoogle = async () => {
    if (!supabase) return;
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (err) { setError(err.message); setLoading(false); }
  };

  if (!isSupabaseConfigured) {
    return (
      <div className={styles.card}>
        <div className={styles.brand}>
          <div className={styles.logo}><span className={styles.logoDot} />stakked</div>
          <div className={styles.logoSub}>{'// creative os · auth'}</div>
        </div>
        <div className={styles.panelHead}>
          <div className={styles.panelTitle}>Supabase not configured</div>
          <div className={styles.panelSub}>{'// running in offline-first mode'}</div>
        </div>
        <div className={styles.panelBody}>
          <p className={styles.notice}>
            Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to{' '}
            <code>.env.local</code> to enable accounts and cloud sync.
          </p>
          <Link href="/workspace" className={styles.btnPrimary}>
            Continue as guest →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.brand}>
        <div className={styles.logo}><span className={styles.logoDot} />stakked</div>
        <div className={styles.logoSub}>{'// creative os · '}{forgotMode ? 'reset' : 'sign in'}</div>
      </div>

      <div className={styles.panelHead}>
        <div className={styles.panelTitle}>
          {forgotMode ? 'Reset your password' : 'Sign in'}
        </div>
        <div className={styles.panelSub}>
          {forgotMode
            ? '// enter your email to receive a reset link'
            : '// welcome back — projects sync to cloud when signed in'}
        </div>
      </div>

      <div className={styles.panelBody}>
        {error && <div className={styles.errorBanner}>{error}</div>}
        {info  && <div className={styles.infoBanner}>{info}</div>}

        {!forgotMode ? (
          <>
            <form onSubmit={handleLogin} className={styles.form}>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="login-email">email</label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="login-password">password</label>
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <button type="submit" className={styles.btnPrimary} disabled={loading}>
                {loading ? '// signing in…' : '→ sign in'}
              </button>
            </form>

            <button className={styles.linkBtn}
              onClick={() => { setForgotMode(true); setError(null); }}>
              forgot password?
            </button>

            <div className={styles.divider}>or</div>

            <button className={styles.btnGoogle} onClick={handleGoogle} disabled={loading}>
              <GoogleIcon />
              continue with google
            </button>

            <div className={styles.switchRow}>
              no account?&nbsp;
              <Link href="/auth/signup" className={styles.switchLink}>sign up →</Link>
            </div>
          </>
        ) : (
          <>
            <form onSubmit={handleForgot} className={styles.form}>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="reset-email">email</label>
                <input
                  id="reset-email"
                  type="email"
                  required
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <button type="submit" className={styles.btnPrimary} disabled={loading}>
                {loading ? '// sending…' : '→ send reset link'}
              </button>
            </form>
            <button className={styles.linkBtn}
              onClick={() => { setForgotMode(false); setError(null); }}>
              ← back to sign in
            </button>
          </>
        )}

        <div className={styles.guestRow}>
          <Link href="/workspace" className={styles.guestLink}>
            skip → continue as guest (no account needed)
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className={styles.page}>
      {/* System bar */}
      <div className={styles.sysbar}>
        <div className={styles.sysLeft}>
          <span className={styles.sysDot} aria-hidden />
          <span>stakked · auth</span>
          <span className={styles.sysSep}>·</span>
          <span>sign-in</span>
        </div>
        <div className={styles.sysRight}>
          <Link href="/" className={styles.sysLink}>← home</Link>
        </div>
      </div>

      {/* Centred card */}
      <div className={styles.body}>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908C16.658 14.102 17.64 11.832 17.64 9.2z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}
