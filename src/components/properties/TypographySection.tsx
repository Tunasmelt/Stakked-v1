'use client';

import React from 'react';
import { useProjectStore } from '@/stores/project-store';
import { StakkedElement } from '@/types/element';
import { StakkedTypographyStyle } from '@/types/style';
import { Select, ColorPicker } from '@/components/ui/Primitives';
import styles from '@/styles/PropertiesPanel.module.css';

interface TypographySectionProps {
  element: StakkedElement;
  pageIndex: number;
}

const FONT_WEIGHTS = [
  { label: 'Thin (100)',       value: '100' },
  { label: 'Light (300)',      value: '300' },
  { label: 'Normal (400)',     value: '400' },
  { label: 'Medium (500)',     value: '500' },
  { label: 'Semi Bold (600)', value: '600' },
  { label: 'Bold (700)',       value: '700' },
  { label: 'Extra Bold (800)',value: '800' },
  { label: 'Black (900)',      value: '900' },
];

const TEXT_ALIGNS = [
  { label: 'Left',    value: 'left' },
  { label: 'Center',  value: 'center' },
  { label: 'Right',   value: 'right' },
  { label: 'Justify', value: 'justify' },
];

const TEXT_DECORATIONS = [
  { label: 'None',         value: 'none' },
  { label: 'Underline',    value: 'underline' },
  { label: 'Line Through', value: 'line-through' },
  { label: 'Overline',     value: 'overline' },
];

const TEXT_TRANSFORMS = [
  { label: 'None',       value: 'none' },
  { label: 'Uppercase',  value: 'uppercase' },
  { label: 'Lowercase',  value: 'lowercase' },
  { label: 'Capitalize', value: 'capitalize' },
];

export default function TypographySection({ element, pageIndex }: TypographySectionProps) {
  const updateElementStyle = useProjectStore((s) => s.updateElementStyle);
  const style = element.style.typography;

  if (!style) return null;

  const onUpdate = (updates: Partial<StakkedTypographyStyle>) => {
    updateElementStyle(pageIndex, element.id, {
      typography: { ...style, ...updates },
    });
  };

  return (
    <div className={styles.sectionInner}>
      {/* Font family */}
      <div className={styles.controlGroup}>
        <label className={styles.label}>Font Family</label>
        <input
          className={styles.input}
          type="text"
          value={style.fontFamily ?? ''}
          placeholder="Inter, sans-serif"
          onChange={(e) => onUpdate({ fontFamily: e.target.value })}
        />
      </div>

      {/* Size + Weight */}
      <div className={styles.grid2}>
        <div className={styles.controlGroup}>
          <label className={styles.label}>Size (px)</label>
          <input
            type="number"
            className={styles.input}
            value={style.fontSize}
            min={1}
            onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
          />
        </div>
        <Select
          label="Weight"
          value={String(style.fontWeight)}
          options={FONT_WEIGHTS}
          onChange={(v) => onUpdate({ fontWeight: Number(v) })}
        />
      </div>

      {/* Line height + Letter spacing */}
      <div className={styles.grid2}>
        <div className={styles.controlGroup}>
          <label className={styles.label}>Line Height</label>
          <input
            type="number"
            step="0.1"
            className={styles.input}
            value={style.lineHeight}
            onChange={(e) => onUpdate({ lineHeight: Number(e.target.value) })}
          />
        </div>
        <div className={styles.controlGroup}>
          <label className={styles.label}>Letter Space</label>
          <input
            type="number"
            step="0.1"
            className={styles.input}
            value={style.letterSpacing}
            onChange={(e) => onUpdate({ letterSpacing: Number(e.target.value) })}
          />
        </div>
      </div>

      {/* Align + Transform */}
      <div className={styles.grid2}>
        <Select
          label="Align"
          value={style.textAlign}
          options={TEXT_ALIGNS}
          onChange={(v) => onUpdate({ textAlign: v as StakkedTypographyStyle['textAlign'] })}
        />
        <Select
          label="Transform"
          value={style.textTransform ?? 'none'}
          options={TEXT_TRANSFORMS}
          onChange={(v) => onUpdate({ textTransform: v as StakkedTypographyStyle['textTransform'] })}
        />
      </div>

      {/* Decoration */}
      <Select
        label="Decoration"
        value={style.textDecoration ?? 'none'}
        options={TEXT_DECORATIONS}
        onChange={(v) => onUpdate({ textDecoration: v as StakkedTypographyStyle['textDecoration'] })}
      />

      {/* Color */}
      <ColorPicker
        label="Text Color"
        value={style.color ?? '#ffffff'}
        onChange={(v) => onUpdate({ color: v })}
      />
    </div>
  );
}
