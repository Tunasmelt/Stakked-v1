'use client';

import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Trash2 } from 'lucide-react';
import { useProjectStore } from '@/stores/project-store';
import { StakkedElement } from '@/types/element';
import { BoxShadow } from '@/types/style';
import { Select, Slider, Toggle, ColorPicker } from '@/components/ui/Primitives';
import styles from '@/styles/PropertiesPanel.module.css';

interface EffectsSectionProps {
  element: StakkedElement;
  pageIndex: number;
}

export default function EffectsSection({ element, pageIndex }: EffectsSectionProps) {
  const updateElement      = useProjectStore((s) => s.updateElement);
  const updateElementStyle = useProjectStore((s) => s.updateElementStyle);
  const effects = element.style.effects;

  const onUpdate = (updates: Partial<typeof effects>) => {
    updateElementStyle(pageIndex, element.id, {
      effects: { ...effects, ...updates },
    });
  };

  const addShadow = () => {
    const newShadow: BoxShadow = {
      id: uuidv4(),
      type: 'drop',
      x: 0,
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
  };

  return (
    <div className={styles.sectionInner}>
      <Slider
        label="Opacity"
        value={effects.opacity}
        onChange={(value) => onUpdate({ opacity: value })}
        min={0}
        max={1}
        step={0.01}
      />

      <Toggle
        label="Visible"
        checked={element.visible}
        onChange={(visible) => {
          updateElement(pageIndex, element.id, { visible });
        }}
      />

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

      <div className={styles.controlGroup}>
        <label className={styles.label}>Backdrop Filter</label>
        <input
          className={styles.input}
          type="text"
          value={effects.backdropFilter ?? ''}
          placeholder="blur(12px) saturate(180%)"
          onChange={(e) => onUpdate({ backdropFilter: e.target.value })}
        />
      </div>

      <div className={styles.controlGroup}>
        <label className={styles.label}>Cursor</label>
        <input
          className={styles.input}
          type="text"
          value={effects.cursor}
          placeholder="pointer"
          onChange={(e) => onUpdate({ cursor: e.target.value })}
        />
      </div>

      {/* ── Shadows ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
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
          <div style={{ fontSize: 10, color: 'var(--text-mute)', fontFamily: 'var(--font-mono)' }}>
            No shadows — click Add to create one.
          </div>
        )}

        {(effects.shadows ?? []).map((shadow) => (
          <div
            key={shadow.id}
            style={{
              padding: '8px 10px',
              marginBottom: 6,
              background: 'var(--surface-2)',
              border: '1px solid var(--line)',
              borderRadius: 6,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Select
                value={shadow.type}
                options={[
                  { label: 'Drop Shadow', value: 'drop' },
                  { label: 'Inner Shadow', value: 'inner' },
                ]}
                onChange={(v) => updateShadow(shadow.id, { type: v as BoxShadow['type'] })}
              />
              <button
                onClick={() => removeShadow(shadow.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-mute)',
                  cursor: 'pointer',
                  padding: 2,
                  display: 'flex',
                }}
              >
                <Trash2 size={12} />
              </button>
            </div>

            <div className={styles.grid2}>
              <div className={styles.controlGroup}>
                <label className={styles.label}>X</label>
                <input
                  type="number"
                  className={styles.input}
                  value={shadow.x}
                  onChange={(e) => updateShadow(shadow.id, { x: Number(e.target.value) })}
                />
              </div>
              <div className={styles.controlGroup}>
                <label className={styles.label}>Y</label>
                <input
                  type="number"
                  className={styles.input}
                  value={shadow.y}
                  onChange={(e) => updateShadow(shadow.id, { y: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className={styles.grid2}>
              <div className={styles.controlGroup}>
                <label className={styles.label}>Blur</label>
                <input
                  type="number"
                  className={styles.input}
                  value={shadow.blur}
                  min={0}
                  onChange={(e) => updateShadow(shadow.id, { blur: Number(e.target.value) })}
                />
              </div>
              <div className={styles.controlGroup}>
                <label className={styles.label}>Spread</label>
                <input
                  type="number"
                  className={styles.input}
                  value={shadow.spread}
                  onChange={(e) => updateShadow(shadow.id, { spread: Number(e.target.value) })}
                />
              </div>
            </div>

            <ColorPicker
              label="Color"
              value={shadow.color}
              onChange={(v) => updateShadow(shadow.id, { color: v })}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
