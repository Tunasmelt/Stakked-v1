'use client';

import React from 'react';
import { FlipHorizontal2, FlipVertical2 } from 'lucide-react';
import { useProjectStore } from '@/stores/project-store';
import { StakkedElement } from '@/types/element';
import { NumberInput, Slider, Select } from '@/components/ui/Primitives';
import styles from '@/styles/PropertiesPanel.module.css';

export default function TransformsSection({ element, pageIndex }: { element: StakkedElement, pageIndex: number }) {
  const updateElement      = useProjectStore((s) => s.updateElement);
  const updateElementStyle = useProjectStore((s) => s.updateElementStyle);

  const tr = element.style.transform;

  const isFlippedH = (tr?.scaleX ?? 1) < 0;
  const isFlippedV = (tr?.scaleY ?? 1) < 0;

  const handleFlipH = () => {
    updateElementStyle(pageIndex, element.id, {
      transform: { ...tr, scaleX: isFlippedH ? 1 : -1 },
    });
  };

  const handleFlipV = () => {
    updateElementStyle(pageIndex, element.id, {
      transform: { ...tr, scaleY: isFlippedV ? 1 : -1 },
    });
  };

  return (
    <div className={styles.sectionInner}>
      <Select
        label="Transform Origin"
        value={tr.origin || 'center'}
        options={[
          { label: 'Center', value: 'center' },
          { label: 'Top Left', value: 'top left' },
          { label: 'Top Right', value: 'top right' },
          { label: 'Bottom Left', value: 'bottom left' },
          { label: 'Bottom Right', value: 'bottom right' }
        ]}
        onChange={(v) => updateElementStyle(pageIndex, element.id, {
          transform: { ...tr, origin: v }
        })}
      />

      <div className={styles.grid2}>
        <NumberInput
          label="Rotate (deg)"
          value={element.rotation ?? 0}
          onChange={(v) => {
            // element.rotation is the single source of truth for the canvas (react-moveable).
            // style.transform.rotation is kept in sync so CSS export matches.
            updateElement(pageIndex, element.id, { rotation: v });
            updateElementStyle(pageIndex, element.id, { transform: { ...tr, rotation: v } });
          }}
        />
        <NumberInput
          label="Perspective"
          value={tr.perspective || 1000}
          onChange={(v) => updateElementStyle(pageIndex, element.id, {
            transform: { ...tr, perspective: v }
          })}
        />
      </div>

      {/* Flip H / V toggle buttons */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={handleFlipH}
          title="Flip Horizontal"
          style={isFlippedH ? { background: 'var(--accent)', color: '#fff' } : undefined}
        >
          <FlipHorizontal2 size={14} />
        </button>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={handleFlipV}
          title="Flip Vertical"
          style={isFlippedV ? { background: 'var(--accent)', color: '#fff' } : undefined}
        >
          <FlipVertical2 size={14} />
        </button>
      </div>

      <div className={styles.grid2}>
        <Slider
          label="Scale X"
          value={tr.scaleX}
          onChange={(v) => updateElementStyle(pageIndex, element.id, {
            transform: { ...tr, scaleX: v }
          })}
          min={-5}
          max={5}
          step={0.01}
          formatValue={(v) => `${v.toFixed(2)}×`}
        />
        <Slider
          label="Scale Y"
          value={tr.scaleY}
          onChange={(v) => updateElementStyle(pageIndex, element.id, {
            transform: { ...tr, scaleY: v }
          })}
          min={-5}
          max={5}
          step={0.01}
          formatValue={(v) => `${v.toFixed(2)}×`}
        />
      </div>

      <div className={styles.grid2}>
        <NumberInput
          label="Skew X"
          value={tr.skewX || 0}
          onChange={(v) => updateElementStyle(pageIndex, element.id, {
            transform: { ...tr, skewX: v }
          })}
        />
        <NumberInput
          label="Skew Y"
          value={tr.skewY || 0}
          onChange={(v) => updateElementStyle(pageIndex, element.id, {
            transform: { ...tr, skewY: v }
          })}
        />
      </div>
      
      <div className={styles.grid2}>
        <NumberInput
          label="Rotate X (3D)"
          value={tr.rotateX || 0}
          onChange={(v) => updateElementStyle(pageIndex, element.id, {
            transform: { ...tr, rotateX: v }
          })}
        />
        <NumberInput
          label="Rotate Y (3D)"
          value={tr.rotateY || 0}
          onChange={(v) => updateElementStyle(pageIndex, element.id, {
            transform: { ...tr, rotateY: v }
          })}
        />
      </div>
    </div>
  );
}
