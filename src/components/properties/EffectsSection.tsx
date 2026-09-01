'use client';

import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Trash2, Plus, Eye, EyeOff } from 'lucide-react';
import { useProjectStore } from '@/stores/project-store';
import { StakkedElement } from '@/types/element';
import { BoxShadow } from '@/types/style';
import { Select, Slider, Toggle, ColorPicker, NumberInput } from '@/components/ui/Primitives';
import styles from '@/styles/PropertiesPanel.module.css';

interface EffectsSectionProps {
  element: StakkedElement;
  pageIndex: number;
}

const BLEND_MODES = [
  'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten',
  'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference',
  'exclusion', 'hue', 'saturation', 'color', 'luminosity',
];

const CURSOR_OPTIONS = [
  'default', 'pointer', 'text', 'move', 'grab', 'crosshair',
  'not-allowed', 'zoom-in', 'zoom-out', 'none',
];

const BACKDROP_PRESETS = [
  { label: 'None',         value: '' },
  { label: 'Blur 8',       value: 'blur(8px)' },
  { label: 'Blur 16',      value: 'blur(16px)' },
  { label: 'Blur 32',      value: 'blur(32px)' },
  { label: 'Frosted',      value: 'blur(12px) brightness(1.1) saturate(180%)' },
  { label: 'Custom',       value: '__custom__' },
];

/** Convert box-shadow array to CSS string for preview */
function shadowsToCss(shadows: BoxShadow[]): string {
  if (!shadows.length) return 'none';
  return shadows
    .map((s) => `${s.type === 'inner' ? 'inset ' : ''}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${s.color}`)
    .join(', ');
}

export default function EffectsSection({ element, pageIndex }: EffectsSectionProps) {
  const updateElement      = useProjectStore((s) => s.updateElement);
  const updateElementStyle = useProjectStore((s) => s.updateElementStyle);
  const effects = element.style.effects;

  /** Track which shadows have their eye (visible) toggled off — purely UI state.
   *  Invisible shadows are still stored; we just exclude them from the CSS preview. */
  const [hiddenShadows, setHiddenShadows] = useState<Set<string>>(new Set());

  /** Custom backdrop filter text when 'Custom' preset is selected */
  const [customBackdrop, setCustomBackdrop] = useState(
    effects.backdropFilter && !BACKDROP_PRESETS.find((p) => p.value === effects.backdropFilter)
      ? effects.backdropFilter
      : '',
  );

  const onUpdate = (updates: Partial<typeof effects>) => {
    updateElementStyle(pageIndex, element.id, {
      effects: { ...effects, ...updates },
    });
  };

  // ── Shadows ──────────────────────────────────────────────────────────────

  const addShadow = () => {
    const newShadow: BoxShadow = {
      id: uuidv4(),
      type: 'drop',
      x: 4,
      y: 4,
      blur: 12,
      spread: 0,
      color: 'rgba(0,0,0,0.4)',
    };
    onUpdate({ shadows: [...(effects.shadows ?? []), newShadow] });
  };

  const updateShadow = (id: string, updates: Partial<BoxShadow>) => {
    onUpdate({
      shadows: (effects.shadows ?? []).map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    });
  };

  const removeShadow = (id: string) => {
    onUpdate({ shadows: (effects.shadows ?? []).filter((s) => s.id !== id) });
    setHiddenShadows((prev) => { const n = new Set(prev); n.delete(id); return n; });
  };

  const toggleShadowVisible = (id: string) => {
    setHiddenShadows((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const visibleShadows = (effects.shadows ?? []).filter((s) => !hiddenShadows.has(s.id));
  const previewBoxShadow = shadowsToCss(visibleShadows);

  // ── Backdrop filter ───────────────────────────────────────────────────────

  const currentBackdropValue = effects.backdropFilter ?? '';
  const isCustomBackdrop = currentBackdropValue !== '' &&
    !BACKDROP_PRESETS.find((p) => p.value === currentBackdropValue && p.value !== '__custom__');

  const activePresetValue = isCustomBackdrop ? '__custom__' : currentBackdropValue;

  const handleBackdropPreset = (value: string) => {
    if (value === '__custom__') {
      // Keep existing custom value, just switch UI mode
      onUpdate({ backdropFilter: customBackdrop });
    } else {
      onUpdate({ backdropFilter: value });
    }
  };

  const handleCustomBackdrop = (value: string) => {
    setCustomBackdrop(value);
    onUpdate({ backdropFilter: value });
  };

  return (
    <div className={styles.sectionInner}>

      {/* ── Opacity ────────────────────────────────────────────────────────── */}
      <Slider
        label="Opacity"
        value={effects.opacity}
        onChange={(value) => onUpdate({ opacity: value })}
        min={0}
        max={1}
        step={0.01}
      />

      {/* ── Visible toggle ─────────────────────────────────────────────────── */}
      <Toggle
        label="Visible"
        checked={element.visible}
        onChange={(visible) => {
          updateElement(pageIndex, element.id, { visible });
        }}
      />

      {/* ── Overflow ───────────────────────────────────────────────────────── */}
      <Select
        label="Overflow"
        value={effects.overflow}
        options={[
          { label: 'Visible', value: 'visible' },
          { label: 'Hidden',  value: 'hidden' },
          { label: 'Scroll',  value: 'scroll' },
          { label: 'Auto',    value: 'auto' },
        ]}
        onChange={(value) => onUpdate({ overflow: value as typeof effects.overflow })}
      />

      {/* ── Blend Mode ─────────────────────────────────────────────────────── */}
      <Select
        label="Blend Mode"
        value={effects.blendMode ?? 'normal'}
        options={BLEND_MODES.map((m) => ({ label: m, value: m }))}
        onChange={(value) => onUpdate({ blendMode: value })}
      />

      {/* ── Cursor ─────────────────────────────────────────────────────────── */}
      <Select
        label="Cursor"
        value={CURSOR_OPTIONS.includes(effects.cursor) ? effects.cursor : 'default'}
        options={CURSOR_OPTIONS.map((c) => ({ label: c, value: c }))}
        onChange={(value) => onUpdate({ cursor: value })}
      />

      {/* ── Backdrop Filter ────────────────────────────────────────────────── */}
      <div className={styles.controlGroup}>
        <label className={styles.label}>Backdrop Filter</label>

        {/* Preset chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 4 }}>
          {BACKDROP_PRESETS.map((preset) => (
            <button
              key={preset.label}
              className={`${styles.chip} ${activePresetValue === preset.value ? styles.active : ''}`}
              onClick={() => handleBackdropPreset(preset.value)}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Custom text input — shown when Custom preset active */}
        {activePresetValue === '__custom__' && (
          <input
            className={styles.input}
            type="text"
            value={customBackdrop}
            placeholder="blur(12px) saturate(180%)"
            onChange={(e) => handleCustomBackdrop(e.target.value)}
          />
        )}

        {/* Blur slider — shown when a blur() preset (or custom containing blur) is active */}
        {activePresetValue !== '__custom__' && activePresetValue !== '' && (
          (() => {
            const match = currentBackdropValue.match(/blur\((\d+(?:\.\d+)?)px\)/);
            if (!match) return null;
            const blurPx = parseFloat(match[1]);
            return (
              <Slider
                label="Blur"
                value={blurPx}
                min={0}
                max={40}
                step={1}
                formatValue={(v) => `${v}px`}
                onChange={(v) => {
                  const updated = currentBackdropValue.replace(/blur\(\d+(?:\.\d+)?px\)/, `blur(${v}px)`);
                  onUpdate({ backdropFilter: updated });
                }}
              />
            );
          })()
        )}
      </div>

      {/* ── Shadows ────────────────────────────────────────────────────────── */}
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 6,
        }}>
          <label className={styles.label}>Shadows</label>
          <button
            onClick={addShadow}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '3px 8px',
              background: 'var(--surface-2)',
              border: '1px solid var(--line)',
              borderRadius: 4,
              color: 'var(--accent)',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              cursor: 'pointer',
            }}
          >
            <Plus size={10} /> Add
          </button>
        </div>

        {(effects.shadows ?? []).length === 0 && (
          <div style={{
            fontSize: 10,
            color: 'var(--text-mute)',
            fontFamily: 'var(--font-mono)',
            paddingBottom: 4,
          }}>
            No shadows — click Add to create one.
          </div>
        )}

        {/* Shadow rows */}
        {(effects.shadows ?? []).map((shadow) => {
          const isHidden = hiddenShadows.has(shadow.id);
          return (
            <div
              key={shadow.id}
              style={{
                padding: '6px 8px',
                marginBottom: 5,
                background: 'var(--surface-2)',
                border: '1px solid var(--line)',
                borderRadius: 6,
                display: 'flex',
                flexDirection: 'column',
                gap: 5,
                opacity: isHidden ? 0.45 : 1,
              }}
            >
              {/* Row 1: eye | inset toggle | color swatch | delete */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                height: 26,
              }}>
                {/* Eye toggle */}
                <button
                  className={styles.iconButton}
                  title={isHidden ? 'Show shadow' : 'Hide shadow'}
                  onClick={() => toggleShadowVisible(shadow.id)}
                  style={{ flexShrink: 0, width: 24, height: 24 }}
                >
                  {isHidden ? <EyeOff size={11} /> : <Eye size={11} />}
                </button>

                {/* Inset / Drop toggle */}
                <button
                  title="Toggle inset"
                  onClick={() => updateShadow(shadow.id, { type: shadow.type === 'inner' ? 'drop' : 'inner' })}
                  style={{
                    height: 24,
                    padding: '0 7px',
                    background: shadow.type === 'inner' ? 'color-mix(in oklab, var(--accent) 18%, transparent)' : 'var(--surface)',
                    border: `1px solid ${shadow.type === 'inner' ? 'var(--accent)' : 'var(--line)'}`,
                    borderRadius: 4,
                    color: shadow.type === 'inner' ? 'var(--accent)' : 'var(--text-mute)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9,
                    cursor: 'pointer',
                    letterSpacing: '0.05em',
                    flexShrink: 0,
                    textTransform: 'uppercase' as const,
                  }}
                >
                  {shadow.type === 'inner' ? 'Inset' : 'Drop'}
                </button>

                {/* Color swatch (compact inline color trigger) */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <ColorPicker
                    label=""
                    value={shadow.color}
                    onChange={(v) => updateShadow(shadow.id, { color: v })}
                  />
                </div>

                {/* Delete */}
                <button
                  className={`${styles.iconButton} ${styles.danger}`}
                  onClick={() => removeShadow(shadow.id)}
                  title="Remove shadow"
                  style={{ flexShrink: 0, width: 24, height: 24 }}
                >
                  <Trash2 size={11} />
                </button>
              </div>

              {/* Row 2: X / Y / Blur / Spread — 4 compact number inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 4 }}>
                <NumberInput
                  label="X"
                  value={shadow.x}
                  onChange={(v) => updateShadow(shadow.id, { x: v })}
                  step={1}
                />
                <NumberInput
                  label="Y"
                  value={shadow.y}
                  onChange={(v) => updateShadow(shadow.id, { y: v })}
                  step={1}
                />
                <NumberInput
                  label="Blur"
                  value={shadow.blur}
                  min={0}
                  onChange={(v) => updateShadow(shadow.id, { blur: v })}
                  step={1}
                />
                <NumberInput
                  label="Spread"
                  value={shadow.spread}
                  onChange={(v) => updateShadow(shadow.id, { spread: v })}
                  step={1}
                />
              </div>
            </div>
          );
        })}

        {/* Live preview div — only shown when there's at least one shadow */}
        {(effects.shadows ?? []).length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px 0 4px',
          }}>
            <div
              title="Shadow preview"
              style={{
                width: 52,
                height: 32,
                borderRadius: 6,
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                boxShadow: previewBoxShadow,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
