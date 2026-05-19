'use client';

import React, { useRef, useState, useCallback } from 'react';
import styles from '@/styles/UI.module.css';

/* ============================================================
   Helpers
   ============================================================ */
function clamp(v: number, min?: number, max?: number) {
  if (min !== undefined && v < min) v = min;
  if (max !== undefined && v > max) v = max;
  return v;
}

function roundToStep(v: number, step: number) {
  return Math.round(v / step) * step;
}

/* ============================================================
   NumberInput — local string state + pointer-drag scrub
   ============================================================ */
export function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  placeholder,
  disabled,
}: {
  label?: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [local, setLocal] = useState(String(value));
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ startY: number; startVal: number } | null>(null);
  const [prevExternal, setPrevExternal] = useState(value);
  // Sync from store (undo/redo, external changes) but not while user is dragging
  if (prevExternal !== value && !dragging) {
    setPrevExternal(value);
    setLocal(String(value));
  }

  const commit = useCallback(
    (raw: string) => {
      const n = parseFloat(raw);
      if (!isNaN(n)) {
        const rounded = roundToStep(n, step);
        const clamped = clamp(rounded, min, max);
        setLocal(String(clamped));
        onChange(clamped);
      } else {
        // Restore last valid value
        setLocal(String(value));
      }
    },
    [step, min, max, onChange, value],
  );

  /* ── Pointer-drag scrub on label ──────────────────────────────────── */
  const onLabelPointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (disabled) return;
      e.preventDefault();
      dragRef.current = { startY: e.clientY, startVal: value };
      setDragging(true);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [disabled, value],
  );

  const onLabelPointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!dragRef.current) return;
      const delta = dragRef.current.startY - e.clientY; // up = positive
      const newVal = dragRef.current.startVal + delta * step;
      const clamped = clamp(roundToStep(newVal, step), min, max);
      setLocal(String(clamped));
      onChange(clamped);
    },
    [step, min, max, onChange],
  );

  const onLabelPointerUp = useCallback(() => {
    dragRef.current = null;
    setDragging(false);
  }, []);

  return (
    <div className={styles.inputWrapper}>
      {label && (
        <label
          className={styles.label}
          style={{ cursor: disabled ? 'default' : 'ew-resize', userSelect: 'none' }}
          onPointerDown={onLabelPointerDown}
          onPointerMove={onLabelPointerMove}
          onPointerUp={onLabelPointerUp}
          onPointerCancel={onLabelPointerUp}
        >
          {label}
        </label>
      )}
      <div className={styles.numberInput}>
        <input
          type="number"
          value={local}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => setLocal(e.target.value)}
          onBlur={(e) => commit(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit((e.target as HTMLInputElement).value);
            if (e.key === 'ArrowUp') {
              e.preventDefault();
              commit(String(clamp(roundToStep(value + step, step), min, max)));
            }
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              commit(String(clamp(roundToStep(value - step, step), min, max)));
            }
          }}
        />
      </div>
    </div>
  );
}

/* ============================================================
   Slider
   ============================================================ */
export function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
  formatValue,
}: {
  label?: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Custom formatter; default: shows integer % when max=1, else raw rounded value */
  formatValue?: (v: number) => string;
}) {
  const display = formatValue
    ? formatValue(value)
    : max === 1
    ? `${Math.round(value * 100)}%`
    : String(Math.round(value * 10) / 10);

  return (
    <div className={styles.inputWrapper}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.sliderWrapper}>
        <input
          type="range"
          className={styles.slider}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
        />
        <span style={{ fontSize: '11px', width: '36px', textAlign: 'right', flexShrink: 0 }}>
          {display}
        </span>
      </div>
    </div>
  );
}

/* ============================================================
   Toggle
   ============================================================ */
export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className={styles.toggle} onClick={() => onChange(!checked)}>
      <label className={styles.label}>{label}</label>
      <div className={`${styles.toggleTrack} ${checked ? styles.active : ''}`}>
        <div className={styles.toggleThumb}></div>
      </div>
    </div>
  );
}

/* ============================================================
   Select
   ============================================================ */
export function Select({
  label,
  value,
  options,
  onChange,
}: {
  label?: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className={styles.inputWrapper}>
      {label && <label className={styles.label}>{label}</label>}
      <select className={styles.select} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ============================================================
   ColorPicker — inline hex + opacity, no OS dialog
   ============================================================ */

/**
 * Parse any CSS color to {hex, alpha}. Supports:
 *   - #rrggbb / #rrggbbaa / #rgb / #rgba
 *   - rgba(r,g,b,a) / rgb(r,g,b)
 *   - bare hex strings without #
 */
function parseColor(raw: string | undefined | null): { hex: string; alpha: number } {
  const fallback = { hex: '#000000', alpha: 1 };
  if (!raw) return fallback;

  const s = raw.trim();

  // rgba / rgb
  const rgbaMatch = s.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/i);
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1]);
    const g = parseInt(rgbaMatch[2]);
    const b = parseInt(rgbaMatch[3]);
    const a = rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1;
    return {
      hex: `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b
        .toString(16)
        .padStart(2, '0')}`,
      alpha: Math.min(1, Math.max(0, a)),
    };
  }

  // hex
  let hex = s.startsWith('#') ? s : `#${s}`;
  if (/^#[0-9a-f]{3}$/i.test(hex)) {
    hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }
  if (/^#[0-9a-f]{8}$/i.test(hex)) {
    const a = parseInt(hex.slice(7, 9), 16) / 255;
    return { hex: hex.slice(0, 7), alpha: Math.round(a * 100) / 100 };
  }
  if (/^#[0-9a-f]{6}$/i.test(hex)) {
    return { hex, alpha: 1 };
  }

  return fallback;
}

function buildColor(hex: string, alpha: number): string {
  if (alpha >= 1) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const { hex, alpha } = parseColor(value);
  const [localHex, setLocalHex] = useState(hex);
  const [localAlpha, setLocalAlpha] = useState(alpha);
  const nativeRef = useRef<HTMLInputElement>(null);
  const [prevColorValue, setPrevColorValue] = useState(value);
  // Sync from store (undo/redo, external changes)
  if (prevColorValue !== value) {
    setPrevColorValue(value);
    const { hex: h, alpha: a } = parseColor(value);
    setLocalHex(h);
    setLocalAlpha(a);
  }

  const commit = useCallback(
    (nextHex: string, nextAlpha: number) => {
      onChange(buildColor(nextHex, nextAlpha));
    },
    [onChange],
  );

  const handleHexInput = (raw: string) => {
    setLocalHex(raw);
    const sanitized = raw.startsWith('#') ? raw : `#${raw}`;
    if (/^#[0-9a-f]{6}$/i.test(sanitized)) {
      commit(sanitized, localAlpha);
    }
  };

  const handleAlphaChange = (val: number) => {
    setLocalAlpha(val);
    commit(localHex, val);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          letterSpacing: '0.06em',
          color: 'var(--text-mute)',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </label>

      {/* Swatch + hex row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {/* Visible swatch — clicking opens the hidden native colour input */}
        <div
          style={{ position: 'relative', flexShrink: 0 }}
          onClick={() => nativeRef.current?.click()}
          title="Click to open colour wheel"
        >
          {/* Checker background for transparency visibility */}
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 4,
              border: '1px solid var(--line)',
              backgroundImage:
                'linear-gradient(45deg, #808080 25%, transparent 25%), linear-gradient(-45deg, #808080 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #808080 75%), linear-gradient(-45deg, transparent 75%, #808080 75%)',
              backgroundSize: '8px 8px',
              backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
              cursor: 'pointer',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 1,
              borderRadius: 3,
              background: buildColor(localHex, localAlpha),
            }}
          />
        </div>
        <input
          ref={nativeRef}
          type="color"
          value={localHex}
          style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
          onChange={(e) => {
            setLocalHex(e.target.value);
            commit(e.target.value, localAlpha);
          }}
        />

        {/* Editable hex text field */}
        <input
          type="text"
          value={localHex}
          maxLength={7}
          onChange={(e) => handleHexInput(e.target.value)}
          onBlur={() => {
            const { hex: h } = parseColor(localHex);
            setLocalHex(h);
            commit(h, localAlpha);
          }}
          style={{
            flex: 1,
            height: 26,
            padding: '0 8px',
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: 4,
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--text)',
            outline: 'none',
          }}
          placeholder="#000000"
        />

        {/* Opacity % */}
        <input
          type="number"
          min={0}
          max={100}
          step={1}
          value={Math.round(localAlpha * 100)}
          onChange={(e) =>
            handleAlphaChange(Math.min(1, Math.max(0, parseInt(e.target.value) / 100)) || 0)
          }
          style={{
            width: 46,
            height: 26,
            padding: '0 4px',
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: 4,
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--text)',
            outline: 'none',
            textAlign: 'right',
          }}
        />
        <span style={{ fontSize: 10, color: 'var(--text-mute)', flexShrink: 0 }}>%</span>
      </div>
    </div>
  );
}
