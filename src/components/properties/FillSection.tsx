'use client';

import React, { useState } from 'react';
import { useProjectStore } from '@/stores/project-store';
import { StakkedElement } from '@/types/element';
import { ElementFill } from '@/types/style';
import { ColorPicker, Select, Slider } from '@/components/ui/Primitives';
import styles from '@/styles/PropertiesPanel.module.css';

interface FillSectionProps {
  element: StakkedElement;
  pageIndex: number;
}

const GRADIENT_PRESETS = [
  { label: 'Sunset',      value: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)' },
  { label: 'Ocean',       value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { label: 'Forest',      value: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
  { label: 'Fire',        value: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)' },
  { label: 'Midnight',    value: 'linear-gradient(135deg, #141e30 0%, #243b55 100%)' },
  { label: 'Rose',        value: 'linear-gradient(135deg, #f953c6 0%, #b91d73 100%)' },
  { label: 'Neon',        value: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' },
  { label: 'Radial Glow', value: 'radial-gradient(circle at 50% 50%, #d6ff3d 0%, #1a1a1e 70%)' },
];

const GRADIENT_DIRECTIONS = [
  { label: '→ Right',        value: 'to right'        },
  { label: '↓ Down',         value: 'to bottom'       },
  { label: '↗ Top-Right',    value: 'to top right'    },
  { label: '↘ Bottom-Right', value: 'to bottom right' },
  { label: '135°',           value: '135deg'          },
  { label: '45°',            value: '45deg'           },
];

/** Parse `linear-gradient(dir, from 0%, to 100%)` into its parts.
 *  Returns null for radial-gradient and other unsupported syntaxes. */
function parseLinear(val: string): { dir: string; from: string; to: string } | null {
  const m = val.match(
    /linear-gradient\(\s*([^,]+?)\s*,\s*(#[a-f\d]{3,8}|rgba?\([^)]+\)|\w+)\s*(?:\d+%\s*)?[,]\s*(#[a-f\d]{3,8}|rgba?\([^)]+\)|\w+)/i,
  );
  if (!m) return null;
  return { dir: m[1].trim(), from: m[2], to: m[3] };
}

export default function FillSection({ element, pageIndex }: FillSectionProps) {
  // Reactive selector — no stale closure
  const updateElementStyle = useProjectStore((s) => s.updateElementStyle);
  const fill = element.style.fills[0];

  // Gradient builder local state — initialized and kept in sync with the stored value
  const [gradFrom, setGradFrom] = useState('#141e30');
  const [gradTo,   setGradTo]   = useState('#243b55');
  const [gradDir,  setGradDir]  = useState('135deg');

  // Sync builder when the stored gradient value changes (undo/redo, preset apply, etc.)
  const fillKey = `${fill?.type}:${fill?.value}`;
  const [prevFillKey, setPrevFillKey] = useState(fillKey);
  if (prevFillKey !== fillKey) {
    setPrevFillKey(fillKey);
    if (fill?.type === 'gradient') {
      const parsed = parseLinear(fill.value || '');
      if (parsed) {
        setGradDir(parsed.dir);
        setGradFrom(parsed.from);
        setGradTo(parsed.to);
      }
    }
  }

  if (!fill) return null;

  const onUpdate = (updates: Partial<typeof fill>) => {
    const nextFill = { ...fill, ...updates };
    updateElementStyle(pageIndex, element.id, {
      fills: [nextFill, ...element.style.fills.slice(1)],
    });
  };

  const buildGradient = (from: string, to: string, dir: string) =>
    `linear-gradient(${dir}, ${from} 0%, ${to} 100%)`;

  return (
    <div className={styles.sectionInner}>
      <Select
        label="Fill Type"
        value={fill.type}
        options={[
          { label: 'Color',     value: 'color'    },
          { label: 'Gradient',  value: 'gradient' },
          { label: 'Image URL', value: 'image'    },
          { label: 'Pattern',   value: 'pattern'  },
          { label: 'Video',     value: 'video'    },
        ]}
        onChange={(value) => onUpdate({ type: value as typeof fill.type })}
      />

      {/* ── Color ── */}
      {fill.type === 'color' && (
        <ColorPicker
          label="Color"
          value={fill.value || '#000000'}
          onChange={(value) => onUpdate({ value })}
        />
      )}

      {/* ── Gradient ── */}
      {fill.type === 'gradient' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Live preview strip */}
          <div
            style={{
              height: 32,
              borderRadius: 6,
              border: '1px solid var(--line)',
              background: fill.value || buildGradient(gradFrom, gradTo, gradDir),
            }}
          />

          {/* Quick-pick presets */}
          <div>
            <label className={styles.label}>Presets</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
              {GRADIENT_PRESETS.map((p) => (
                <button
                  key={p.label}
                  title={p.label}
                  onClick={() => {
                    onUpdate({ value: p.value });
                    const parsed = parseLinear(p.value);
                    if (parsed) { setGradDir(parsed.dir); setGradFrom(parsed.from); setGradTo(parsed.to); }
                  }}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 4,
                    border: fill.value === p.value ? '2px solid var(--accent)' : '1px solid var(--line)',
                    background: p.value,
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Builder — only shown for linear-gradient (not radial) */}
          {!fill.value?.startsWith('radial') && (
            <>
              <div className={styles.grid2}>
                <ColorPicker
                  label="From"
                  value={gradFrom}
                  onChange={(c) => {
                    setGradFrom(c);
                    onUpdate({ value: buildGradient(c, gradTo, gradDir) });
                  }}
                />
                <ColorPicker
                  label="To"
                  value={gradTo}
                  onChange={(c) => {
                    setGradTo(c);
                    onUpdate({ value: buildGradient(gradFrom, c, gradDir) });
                  }}
                />
              </div>

              <Select
                label="Direction"
                value={GRADIENT_DIRECTIONS.some((d) => d.value === gradDir) ? gradDir : 'custom'}
                options={GRADIENT_DIRECTIONS}
                onChange={(d) => {
                  setGradDir(d);
                  onUpdate({ value: buildGradient(gradFrom, gradTo, d) });
                }}
              />
            </>
          )}

          {/* Raw override for advanced expressions like radial-gradient */}
          <div className={styles.field}>
            <label className={styles.label}>CSS value (advanced)</label>
            <input
              className={styles.input}
              type="text"
              value={fill.value}
              onChange={(e) => {
                onUpdate({ value: e.target.value });
                const parsed = parseLinear(e.target.value);
                if (parsed) { setGradDir(parsed.dir); setGradFrom(parsed.from); setGradTo(parsed.to); }
              }}
              placeholder="linear-gradient(135deg, #000, #fff)"
            />
          </div>
        </div>
      )}

      {/* ── Image URL ── */}
      {fill.type === 'image' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className={styles.field}>
            <label className={styles.label}>Image URL</label>
            <input
              className={styles.input}
              type="text"
              value={fill.value}
              onChange={(e) => onUpdate({ value: e.target.value })}
              placeholder="https://…"
            />
          </div>
          {fill.value && (
            <div
              style={{
                height: 80,
                borderRadius: 6,
                border: '1px solid var(--line)',
                background: `url(${fill.value}) center/cover no-repeat var(--surface)`,
              }}
            />
          )}
          <Select
            label="Fit"
            value={fill.fit ?? 'cover'}
            options={[
              { label: 'Cover',   value: 'cover'   },
              { label: 'Contain', value: 'contain' },
              { label: 'Fill',    value: 'fill'    },
              { label: 'None',    value: 'none'    },
            ]}
            onChange={(v) => onUpdate({ fit: v as ElementFill['fit'] })}
          />
        </div>
      )}

      {/* ── Pattern / Video — raw text override ── */}
      {(fill.type === 'pattern' || fill.type === 'video') && (
        <div className={styles.controlGroup}>
          <label className={styles.label}>Value</label>
          <input
            className={styles.input}
            type="text"
            value={fill.value}
            onChange={(e) => onUpdate({ value: e.target.value })}
            placeholder={
              fill.type === 'pattern'
                ? 'radial-gradient(#00000022 1px, transparent 1px) 0 0/12px 12px'
                : 'https://example.com/video.mp4'
            }
          />
        </div>
      )}

      <Slider
        label="Opacity"
        value={fill.opacity}
        onChange={(value) => onUpdate({ opacity: value })}
        min={0}
        max={1}
        step={0.01}
      />
    </div>
  );
}
