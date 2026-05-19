'use client';
/**
 * /auth/signup — Stakked account creation
 * Design: matches the Stakked landing page visual language
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import styles from '@/styles/Auth.module.css';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [sent, setSent]         = useState(false);

  // Redirect if already signed in
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace('/workspace');
    });
  }, [router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 8)  { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    if (err) setError(err.message);
    else setSent(true);
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

  // ── Not configured ───────────────────────────────────────────
  if (!isSupabaseConfigured) {
    return (
      <main className={styles.page}>
        <div className={styles.sysbar}>
          <div className={styles.sysLeft}>
            <span className={styles.sysDot} aria-hidden />
            <span>stakked · auth</span>
            <span className={styles.sysSep}>·</span>
            <span>sign-up</span>
          </div>
          <div className={styles.sysRight}>
            <Link href="/" className={styles.sysLink}>← home</Link>
          </div>
        </div>
        <div className={styles.body}>
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
                <code>.env.local</code> to enable accounts.
              </p>
              <Link href="/workspace" className={styles.btnPrimary}>
                Continue as guest →
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ── Email sent confirmation ──────────────────────────────────
  if (sent) {
    return (
      <main className={styles.page}>
        <div className={styles.sysbar}>
          <div className={styles.sysLeft}>
            <span className={styles.sysDot} aria-hidden />
            <span>stakked · auth</span>
            <span className={styles.sysSep}>·</span>
            <span>verify email</span>
          </div>
          <div className={styles.sysRight}>
            <Link href="/" className={styles.sysLink}>← home</Link>
          </div>
        </div>
        <div className={styles.body}>
          <div className={styles.card}>
            <div className={styles.brand}>
              <div className={styles.logo}><span className={styles.logoDot} />stakked</div>
              <div className={styles.logoSub}>{'// creative os · verify'}</div>
            </div>
            <div className={styles.panelHead}>
              <div className={styles.panelTitle}>Check your email</div>
              <div className={styles.panelSub}>{'// confirmation link sent'}</div>
            </div>
            <div className={styles.panelBody}>
              <div className={styles.successBox}>
                <div className={styles.successIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="var(--ok, #8bff9a)" strokeWidth={2} strokeLinecap="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <div className={styles.successTitle}>almost there</div>
                <p className={styles.successBody}>
                  We sent a confirmation link to{' '}
                  <strong>{email}</strong>.
                  <br />Click it to activate your account.
                </p>
              </div>
              <Link href="/auth/login" className={styles.btnPrimary}>
                → back to sign in
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ── Main signup form ─────────────────────────────────────────
  return (
    <main className={styles.page}>
      {/* System bar */}
      <div className={styles.sysbar}>
        <div className={styles.sysLeft}>
          <span className={styles.sysDot} aria-hidden />
          <span>stakked · auth</span>
          <span className={styles.sysSep}>·</span>
          <span>sign-up</span>
        </div>
        <div className={styles.sysRight}>
          <Link href="/" className={styles.sysLink}>← home</Link>
        </div>
      </div>

      {/* Centred card */}
      <div className={styles.body}>
        <div className={styles.card}>
          <div className={styles.brand}>
            <div className={styles.logo}><span className={styles.logoDot} />stakked</div>
            <div className={styles.logoSub}>{'// creative os · create account'}</div>
          </div>

          <div className={styles.panelHead}>
            <div className={styles.panelTitle}>Create account</div>
            <div className={styles.panelSub}>
              {'// your projects stay local — cloud sync activates on sign-in'}
            </div>
          </div>

          <div className={styles.panelBody}>
            {error && <div className={styles.errorBanner}>{error}</div>}

            <form onSubmit={handleSignup} className={styles.form}>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="signup-email">email</label>
                <input
                  id="signup-email"
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
                <label className={styles.label} htmlFor="signup-password">password</label>
                <input
                  id="signup-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="min 8 characters"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="signup-confirm">confirm password</label>
                <input
                  id="signup-confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={styles.input}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="re-enter password"
                />
              </div>

              <button type="submit" className={styles.btnPrimary} disabled={loading}>
                {loading ? '// creating account…' : '→ create account'}
              </button>
            </form>

            <div className={styles.divider}>or</div>

            <button className={styles.btnGoogle} onClick={handleGoogle} disabled={loading}>
              <GoogleIcon />
              continue with google
            </button>

            <div className={styles.switchRow}>
              already have an account?&nbsp;
              <Link href="/auth/login" className={styles.switchLink}>sign in →</Link>
            </div>

            <div className={styles.guestRow}>
              <Link href="/workspace" className={styles.guestLink}>
                skip → continue as guest (no account needed)
              </Link>
            </div>
          </div>
        </div>
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
