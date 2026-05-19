'use client';
/**
 * MarketingNav — shared navbar for all marketing/public pages
 *
 * Auth-aware:
 *   - signed in  → "Open workspace" button + avatar/logout
 *   - signed out → "Sign in" + "Get started" (→ /auth/signup)
 *   - Supabase not configured → "Open workspace" (guest mode)
 *
 * Design: matches Stakked design language
 *   • Sticky, blurred bg-2 with bottom border
 *   • JetBrains Mono for labels
 *   • Lime accent CTAs
 *   • Mobile hamburger collapsible
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowRight, LogOut, ExternalLink } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import styles from '@/styles/MarketingNav.module.css';

const NAV_LINKS = [
  { href: '/features',     label: 'Features' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/docs',         label: 'Docs' },
  { href: '/changelog',    label: 'Changelog' },
  { href: '/community',    label: 'Community' },
];

export default function MarketingNav() {
  const pathname  = usePathname();
  const [open, setOpen]           = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [avatarOpen, setAvatarOpen] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user?.email ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserEmail(session?.user?.email ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setAvatarOpen(false);
  };

  return (
    <header className={styles.nav}>
      <div className={styles.inner}>
        {/* ── Brand ── */}
        <Link href="/" className={styles.brand}>
          <span className={styles.brandDot} />
          <span className={styles.brandName}>stakked</span>
          <span className={styles.brandTag}>{'// creative os'}</span>
        </Link>

        {/* ── Desktop links ── */}
        <nav className={styles.links} aria-label="Main navigation">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`${styles.link} ${pathname === href ? styles.linkActive : ''}`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* ── Desktop actions ── */}
        <div className={styles.actions}>
          {isSupabaseConfigured ? (
            userEmail ? (
              /* Signed in */
              <>
                <Link href="/workspace" className={styles.btnWorkspace}>
                  Workspace
                  <ExternalLink size={11} />
                </Link>
                <div className={styles.avatarWrap}>
                  <button
                    className={styles.avatarBtn}
                    onClick={() => setAvatarOpen(v => !v)}
                    aria-label="Account menu"
                    title={userEmail}
                  >
                    {userEmail.charAt(0).toUpperCase()}
                  </button>
                  {avatarOpen && (
                    <div className={styles.avatarMenu}>
                      <div className={styles.avatarEmail}>{userEmail}</div>
                      <button className={styles.avatarItem} onClick={handleSignOut}>
                        <LogOut size={12} /> Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Signed out */
              <>
                <Link href="/auth/login" className={styles.btnGhost}>Sign in</Link>
                <Link href="/auth/signup" className={styles.btnCta}>
                  Get started <ArrowRight size={12} />
                </Link>
              </>
            )
          ) : (
            /* No Supabase — guest only */
            <Link href="/workspace" className={styles.btnCta}>
              Open workspace <ArrowRight size={12} />
            </Link>
          )}
        </div>

        {/* ── Mobile hamburger ── */}
        <button
          className={styles.hamburger}
          onClick={() => setOpen(v => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      {open && (
        <div className={styles.drawer}>
          <nav className={styles.drawerLinks}>
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`${styles.drawerLink} ${pathname === href ? styles.drawerLinkActive : ''}`}
                onClick={() => setOpen(false)}
              >
                <span className={styles.drawerArrow}>{'//'}</span>
                {label}
              </Link>
            ))}
          </nav>
          <div className={styles.drawerActions}>
            {isSupabaseConfigured ? (
              userEmail ? (
                <>
                  <Link href="/workspace" className={styles.btnCta} onClick={() => setOpen(false)}>
                    Open workspace <ArrowRight size={12} />
                  </Link>
                  <button className={styles.btnGhost} onClick={() => { handleSignOut(); setOpen(false); }}>
                    <LogOut size={12} /> Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/signup" className={styles.btnCta} onClick={() => setOpen(false)}>
                    Get started <ArrowRight size={12} />
                  </Link>
                  <Link href="/auth/login" className={styles.btnGhost} onClick={() => setOpen(false)}>
                    Sign in
                  </Link>
                </>
              )
            ) : (
              <Link href="/workspace" className={styles.btnCta} onClick={() => setOpen(false)}>
                Open workspace <ArrowRight size={12} />
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
