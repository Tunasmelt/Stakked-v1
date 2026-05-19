'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { X, Palette, Globe, Search, Code2, BarChart3, Link2 } from 'lucide-react';
import {
  useUIStore, CHROME_THEMES,
  ChromeTheme, ChromeMode, ChromeDensity,
  ChromeIntensity, FontPairing
} from '@/stores/ui-store';
import { useProjectStore } from '@/stores/project-store';
import type { ProjectSettings } from '@/types/project';
import styles from '@/styles/SettingsModal.module.css';

type Tab = 'editor' | 'general' | 'seo' | 'code' | 'analytics';

const NAV: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'editor',    label: 'Editor',    icon: <Palette size={14} /> },
  { id: 'general',  label: 'General',   icon: <Globe size={14} /> },
  { id: 'seo',      label: 'SEO',       icon: <Search size={14} /> },
  { id: 'code',     label: 'Custom Code', icon: <Code2 size={14} /> },
  { id: 'analytics',label: 'Analytics', icon: <BarChart3 size={14} /> },
];

export function SettingsModal() {
  const {
    settingsModalOpen,
    setSettingsModalOpen,
    theme, setTheme,
    mode, setMode,
    density, setDensity,
    chrome, setChrome,
    fontPair, setFontPair
  } = useUIStore();

  const { project, updateProject } = useProjectStore();
  const [tab, setTab] = useState<Tab>('editor');

  // Local state for website settings — flushed on save
  const settings: ProjectSettings = project?.settings ?? { theme: 'minimal-dark' };
  const [siteTitle,    setSiteTitle]    = useState(project?.title ?? '');
  const [favicon,      setFavicon]      = useState(settings.favicon ?? '');
  const [ogImage,      setOgImage]      = useState(settings.ogImage ?? '');
  const [language,     setLanguage]     = useState(settings.language ?? 'en');
  const [metaTitle,    setMetaTitle]    = useState(settings.metaTitle ?? '');
  const [metaDesc,     setMetaDesc]     = useState(settings.metaDesc ?? '');
  const [robots,       setRobots]       = useState(settings.robots ?? 'index, follow');
  const [headCode,     setHeadCode]     = useState(settings.headCode ?? '');
  const [bodyCode,     setBodyCode]     = useState(settings.bodyCode ?? '');
  const [customCss,    setCustomCss]    = useState(settings.customCss ?? '');
  const [analyticsId,  setAnalyticsId]  = useState(settings.analyticsId ?? '');
  const [plausible,    setPlausible]    = useState(settings.plausible ?? '');

  // Sync form fields when the modal opens or the project identity changes
  const syncKey = `${settingsModalOpen}:${project?.id}`;
  const [prevSyncKey, setPrevSyncKey] = useState(syncKey);
  if (prevSyncKey !== syncKey && settingsModalOpen) {
    setPrevSyncKey(syncKey);
    const s: ProjectSettings = project?.settings ?? { theme: 'minimal-dark' };
    setSiteTitle(project?.title ?? '');
    setFavicon(s.favicon ?? '');
    setOgImage(s.ogImage ?? '');
    setLanguage(s.language ?? 'en');
    setMetaTitle(s.metaTitle ?? '');
    setMetaDesc(s.metaDesc ?? '');
    setRobots(s.robots ?? 'index, follow');
    setHeadCode(s.headCode ?? '');
    setBodyCode(s.bodyCode ?? '');
    setCustomCss(s.customCss ?? '');
    setAnalyticsId(s.analyticsId ?? '');
    setPlausible(s.plausible ?? '');
  }

  const handleSave = useCallback(() => {
    if (project) {
      updateProject({
        title: siteTitle || project.title,
        settings: {
          ...project.settings,
          favicon,
          ogImage,
          language,
          analyticsId,
          metaTitle,
          metaDesc,
          robots,
          headCode,
          bodyCode,
          customCss,
          plausible,
        },
      });
    }
    setSettingsModalOpen(false);
  }, [project, updateProject, siteTitle, favicon, ogImage, language, analyticsId, metaTitle, metaDesc, robots, headCode, bodyCode, customCss, plausible, setSettingsModalOpen]);

  // Close on Escape — saves current field values
  useEffect(() => {
    if (!settingsModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settingsModalOpen, handleSave]);

  if (!settingsModalOpen) return null;

  return (
    <div className={styles.overlay} onClick={() => { handleSave(); }}>
      <div className={styles.modalWide} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Settings</h2>
          <button className={styles.closeButton} onClick={handleSave}>
            <X size={18} />
          </button>
        </div>

        {/* Body: sidebar + content */}
        <div className={styles.body}>
          {/* Sidebar nav */}
          <nav className={styles.sidebar}>
            {NAV.map(n => (
              <button
                key={n.id}
                className={`${styles.navItem} ${tab === n.id ? styles.active : ''}`}
                onClick={() => setTab(n.id)}
              >
                {n.icon}
                {n.label}
              </button>
            ))}
          </nav>

          {/* Content area */}
          <div className={styles.content}>

            {/* ── Editor tab ── */}
            {tab === 'editor' && (
              <>
                <div className={styles.tabSection}>
                  <div className={styles.sectionTitle}>Editor Appearance</div>

                  <div className={styles.row}>
                    <div className={styles.rowLabel}>
                      <span className={styles.fieldLabel}>Theme Colorway</span>
                      <span className={styles.fieldDesc}>Structural styling tokens for the UI shell.</span>
                    </div>
                    <select className={styles.select} value={theme} onChange={e => setTheme(e.target.value as ChromeTheme)}>
                      {CHROME_THEMES.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.k})</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.row}>
                    <div className={styles.rowLabel}>
                      <span className={styles.fieldLabel}>Mode</span>
                    </div>
                    <select className={styles.select} value={mode} onChange={e => setMode(e.target.value as ChromeMode)}>
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                    </select>
                  </div>

                  <div className={styles.row}>
                    <div className={styles.rowLabel}>
                      <span className={styles.fieldLabel}>Chrome Intensity</span>
                      <span className={styles.fieldDesc}>Panel transparency and contrast.</span>
                    </div>
                    <select className={styles.select} value={chrome} onChange={e => setChrome(e.target.value as ChromeIntensity)}>
                      <option value="minimal">Minimal</option>
                      <option value="balanced">Balanced</option>
                      <option value="edgy">Edgy (Glass)</option>
                    </select>
                  </div>
                </div>

                <div className={styles.tabSection}>
                  <div className={styles.sectionTitle}>Typography &amp; Spacing</div>

                  <div className={styles.row}>
                    <div className={styles.rowLabel}>
                      <span className={styles.fieldLabel}>UI Font Pairing</span>
                      <span className={styles.fieldDesc}>Font family used in the editor workspace.</span>
                    </div>
                    <select className={styles.select} value={fontPair} onChange={e => setFontPair(e.target.value as FontPairing)}>
                      <option value="geist">Geist / Sans</option>
                      <option value="jb">JetBrains Mono</option>
                      <option value="space">Space Grotesk</option>
                    </select>
                  </div>

                  <div className={styles.row}>
                    <div className={styles.rowLabel}>
                      <span className={styles.fieldLabel}>Density</span>
                      <span className={styles.fieldDesc}>Toolbars, panels and margins.</span>
                    </div>
                    <select className={styles.select} value={density} onChange={e => setDensity(e.target.value as ChromeDensity)}>
                      <option value="compact">Compact</option>
                      <option value="cozy">Cozy</option>
                      <option value="spacious">Spacious</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* ── General tab ── */}
            {tab === 'general' && (
              <div className={styles.tabSection}>
                <div className={styles.sectionTitle}>Website — General</div>
                <p className={styles.tabDesc}>Basic identity settings for your published site.</p>

                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Site Title</label>
                  <input
                    className={styles.input}
                    value={siteTitle}
                    onChange={e => setSiteTitle(e.target.value)}
                    placeholder="My Awesome Site"
                  />
                  <span className={styles.fieldDesc}>Shown in the browser tab and as the default page title.</span>
                </div>

                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Language</label>
                  <select className={styles.select} value={language} onChange={e => setLanguage(e.target.value)}>
                    <option value="en">English (en)</option>
                    <option value="es">Spanish (es)</option>
                    <option value="fr">French (fr)</option>
                    <option value="de">German (de)</option>
                    <option value="pt">Portuguese (pt)</option>
                    <option value="ja">Japanese (ja)</option>
                    <option value="zh">Chinese (zh)</option>
                    <option value="ar">Arabic (ar)</option>
                    <option value="ko">Korean (ko)</option>
                    <option value="it">Italian (it)</option>
                    <option value="nl">Dutch (nl)</option>
                    <option value="ru">Russian (ru)</option>
                  </select>
                  <span className={styles.fieldDesc}>Sets the HTML lang attribute for accessibility and search engines.</span>
                </div>

                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Favicon URL</label>
                  <input
                    className={styles.input}
                    value={favicon}
                    onChange={e => setFavicon(e.target.value)}
                    placeholder="https://example.com/favicon.ico"
                  />
                  <span className={styles.fieldDesc}>Small icon shown in the browser tab. Use a .ico, .png, or .svg URL.</span>
                </div>

                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Social Share Image (OG Image)</label>
                  <input
                    className={styles.input}
                    value={ogImage}
                    onChange={e => setOgImage(e.target.value)}
                    placeholder="https://example.com/og-image.jpg"
                  />
                  <span className={styles.fieldDesc}>1200×630px image shown when your site is shared on social media.</span>
                  {ogImage && (
                    <div className={styles.imgPreview}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={ogImage} alt="OG preview" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── SEO tab ── */}
            {tab === 'seo' && (
              <div className={styles.tabSection}>
                <div className={styles.sectionTitle}>Website — SEO</div>
                <p className={styles.tabDesc}>Control how search engines index and display your site.</p>

                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Meta Title</label>
                  <input
                    className={styles.input}
                    value={metaTitle}
                    onChange={e => setMetaTitle(e.target.value)}
                    placeholder="My Site – Amazing Tagline"
                    maxLength={60}
                  />
                  <span className={styles.fieldDesc}>{metaTitle.length}/60 characters · Shown in Google search results.</span>
                </div>

                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Meta Description</label>
                  <textarea
                    className={styles.textarea}
                    value={metaDesc}
                    onChange={e => setMetaDesc(e.target.value)}
                    placeholder="A short description of your site for search engines…"
                    rows={3}
                    maxLength={160}
                  />
                  <span className={styles.fieldDesc}>{metaDesc.length}/160 characters · Shown below your title in search results.</span>
                </div>

                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Robots</label>
                  <select className={styles.select} value={robots} onChange={e => setRobots(e.target.value)}>
                    <option value="index, follow">Index &amp; Follow (default)</option>
                    <option value="noindex, follow">No Index, Follow</option>
                    <option value="index, nofollow">Index, No Follow</option>
                    <option value="noindex, nofollow">No Index, No Follow</option>
                  </select>
                  <span className={styles.fieldDesc}>Controls whether search engines crawl and index your site.</span>
                </div>
              </div>
            )}

            {/* ── Code tab ── */}
            {tab === 'code' && (
              <div className={styles.tabSection}>
                <div className={styles.sectionTitle}>Website — Custom Code</div>
                <p className={styles.tabDesc}>Inject scripts and CSS into your published site. Use with caution.</p>

                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Custom CSS</label>
                  <textarea
                    className={styles.codeArea}
                    value={customCss}
                    onChange={e => setCustomCss(e.target.value)}
                    placeholder={`/* Add global styles here */\nbody { font-family: 'Inter', sans-serif; }`}
                    rows={5}
                    spellCheck={false}
                  />
                  <span className={styles.fieldDesc}>Injected inside a &lt;style&gt; tag in the &lt;head&gt;.</span>
                </div>

                <div className={styles.field}>
                  <label className={styles.fieldLabel}>&lt;head&gt; Scripts</label>
                  <textarea
                    className={styles.codeArea}
                    value={headCode}
                    onChange={e => setHeadCode(e.target.value)}
                    placeholder={`<!-- Paste scripts here -->\n<script>...</script>`}
                    rows={5}
                    spellCheck={false}
                  />
                  <span className={styles.fieldDesc}>Injected at the end of &lt;head&gt;. Good for tag managers, fonts, etc.</span>
                </div>

                <div className={styles.field}>
                  <label className={styles.fieldLabel}>&lt;body&gt; Scripts</label>
                  <textarea
                    className={styles.codeArea}
                    value={bodyCode}
                    onChange={e => setBodyCode(e.target.value)}
                    placeholder={`<!-- Paste scripts here -->\n<script>...</script>`}
                    rows={5}
                    spellCheck={false}
                  />
                  <span className={styles.fieldDesc}>Injected just before &lt;/body&gt;. Good for chat widgets, pixel scripts, etc.</span>
                </div>
              </div>
            )}

            {/* ── Analytics tab ── */}
            {tab === 'analytics' && (
              <div className={styles.tabSection}>
                <div className={styles.sectionTitle}>Website — Analytics</div>
                <p className={styles.tabDesc}>Connect analytics tools to track visitors on your published site.</p>

                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Google Analytics 4 — Measurement ID</label>
                  <div className={styles.inputWithIcon}>
                    <BarChart3 size={13} className={styles.inputIcon} />
                    <input
                      className={styles.input}
                      value={analyticsId}
                      onChange={e => setAnalyticsId(e.target.value)}
                      placeholder="G-XXXXXXXXXX"
                    />
                  </div>
                  <span className={styles.fieldDesc}>Found in your GA4 property &gt; Data Streams &gt; Measurement ID.</span>
                </div>

                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Plausible Analytics — Domain</label>
                  <div className={styles.inputWithIcon}>
                    <Link2 size={13} className={styles.inputIcon} />
                    <input
                      className={styles.input}
                      value={plausible}
                      onChange={e => setPlausible(e.target.value)}
                      placeholder="example.com"
                    />
                  </div>
                  <span className={styles.fieldDesc}>Your site&apos;s domain as registered in Plausible (no https://).</span>
                </div>

                <div className={styles.analyticsNote}>
                  <span>Analytics scripts are only injected into your <strong>published</strong> site — not the editor preview.</span>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.button} onClick={() => setSettingsModalOpen(false)}>
            Cancel
          </button>
          <button className={styles.primaryBtn} onClick={handleSave}>
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
