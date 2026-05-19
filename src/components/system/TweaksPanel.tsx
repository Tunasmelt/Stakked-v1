'use client';

import { X } from 'lucide-react';
import {
  useUIStore,
  CHROME_THEMES,
  type ChromeDensity,
  type ChromeIntensity,
  type FontPairing,
} from '@/stores/ui-store';
import styles from '@/styles/TweaksPanel.module.css';

const DENSITIES: ChromeDensity[] = ['compact', 'cozy', 'spacious'];
const INTENSITIES: ChromeIntensity[] = ['minimal', 'balanced', 'edgy'];
const FONT_PAIRS: { id: FontPairing; label: string }[] = [
  { id: 'geist', label: 'Inter · JB Mono' },
  { id: 'jb',    label: 'Instrument · JB' },
  { id: 'space', label: 'Space · Space Mono' },
];

/**
 * TweaksPanel
 *
 * A floating bottom-right widget that exposes the five design-token knobs:
 * theme · mode · density · chrome intensity · font pairing.
 *
 * Persisted through the UI store.
 */
export function TweaksPanel() {
  const open = useUIStore((s) => s.tweaksOpen);
  const toggle = useUIStore((s) => s.toggleTweaks);
  const setOpen = useUIStore((s) => s.setTweaksOpen);

  const theme = useUIStore((s) => s.theme);
  const mode = useUIStore((s) => s.mode);
  const density = useUIStore((s) => s.density);
  const chrome = useUIStore((s) => s.chrome);
  const fontPair = useUIStore((s) => s.fontPair);

  const setTheme = useUIStore((s) => s.setTheme);
  const setMode = useUIStore((s) => s.setMode);
  const setDensity = useUIStore((s) => s.setDensity);
  const setChrome = useUIStore((s) => s.setChrome);
  const setFontPair = useUIStore((s) => s.setFontPair);

  if (!open) {
    return (
      <button
        type="button"
        aria-label="Open Tweaks"
        className={styles.toggleBtn}
        onClick={toggle}
      >
        ◆
      </button>
    );
  }

  return (
    <div className={styles.panel} role="dialog" aria-label="Design tweaks">
      <div className={styles.hd}>
        <span className={styles.title}>◆ Tweaks</span>
        <span className={styles.tip}>live · persisted</span>
        <button
          type="button"
          aria-label="Close"
          className={styles.close}
          onClick={() => setOpen(false)}
        >
          <X size={14} />
        </button>
      </div>

      <div className={styles.body}>
        <div>
          <div className={styles.grpLbl}>Theme</div>
          <div className={styles.swatchRow}>
            {CHROME_THEMES.map((t) => (
              <div
                key={t.id}
                role="button"
                tabIndex={0}
                title={t.name}
                aria-label={`Theme ${t.name}`}
                aria-pressed={theme === t.id}
                className={`${styles.swatchOpt} ${theme === t.id ? styles.active : ''}`}
                onClick={() => setTheme(t.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setTheme(t.id);
                }}
                style={{
                  background: `linear-gradient(135deg, ${t.sw[0]} 0%, ${t.sw[1]} 50%, ${t.sw[3]} 100%)`,
                }}
              >
                <span className={styles.swatchLabel}>{t.id}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className={styles.grpLbl}>Mode</div>
          <div className={styles.segLrg}>
            <button
              type="button"
              className={mode === 'dark' ? styles.active : ''}
              onClick={() => setMode('dark')}
            >
              dark
            </button>
            <button
              type="button"
              className={mode === 'light' ? styles.active : ''}
              onClick={() => setMode('light')}
            >
              light
            </button>
          </div>
        </div>

        <div>
          <div className={styles.grpLbl}>Density</div>
          <div className={styles.segLrg}>
            {DENSITIES.map((d) => (
              <button
                key={d}
                type="button"
                className={density === d ? styles.active : ''}
                onClick={() => setDensity(d)}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className={styles.grpLbl}>Chrome intensity</div>
          <div className={styles.segLrg}>
            {INTENSITIES.map((c) => (
              <button
                key={c}
                type="button"
                className={chrome === c ? styles.active : ''}
                onClick={() => setChrome(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className={styles.grpLbl}>Font pairing</div>
          <div className={styles.segLrg}>
            {FONT_PAIRS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={fontPair === f.id ? styles.active : ''}
                onClick={() => setFontPair(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
