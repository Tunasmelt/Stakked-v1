'use client';

import React from 'react';
import { useProjectStore } from '@/stores/project-store';
import { StakkedElement } from '@/types/element';
import { Select, Slider } from '@/components/ui/Primitives';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import styles from '@/styles/PropertiesPanel.module.css';

export default function OverlaysSection({ element, pageIndex }: { element: StakkedElement, pageIndex: number }) {
  const updateElementStyle = useProjectStore((s) => s.updateElementStyle);
  
  const overlays = element.style.overlays || [];

  const addOverlay = () => {
    updateElementStyle(pageIndex, element.id, {
      overlays: [
        ...overlays,
        { id: uuidv4(), type: 'noise', value: '0.5', opacity: 0.1, blendMode: 'overlay' }
      ]
    });
  };

  const updateOverlay = (id: string, updates: Partial<import('@/types/style').ElementOverlay>) => {
    updateElementStyle(pageIndex, element.id, {
      overlays: overlays.map(o => o.id === id ? { ...o, ...updates } : o)
    });
  };

  const removeOverlay = (id: string) => {
    updateElementStyle(pageIndex, element.id, {
      overlays: overlays.filter(o => o.id !== id)
    });
  };

  return (
    <div className={styles.sectionInner}>
      {overlays.map((o) => (
        <div key={o.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px', background: 'var(--surface)', borderRadius: 'var(--r-md)', border: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Select
              value={o.type}
              options={[
                { label: 'Noise', value: 'noise' },
                { label: 'Grain', value: 'grain' },
                { label: 'Color', value: 'color' },
                { label: 'Gradient', value: 'gradient' }
              ]}
              onChange={(v) => updateOverlay(o.id, { type: v as 'color' | 'gradient' | 'noise' | 'grain' })}
            />
            <button className={styles.iconButton} onClick={() => removeOverlay(o.id)} style={{ minWidth: '30px', minHeight: '30px', padding: '4px' }}>
              <Trash2 size={14} />
            </button>
          </div>
          
          <div className={styles.grid2}>
            <Slider
              label="Opacity"
              value={o.opacity}
              onChange={(v) => updateOverlay(o.id, { opacity: v })}
              min={0}
              max={1}
            />
            <Select
              label="Blend"
              value={o.blendMode}
              options={[
                { label: 'Normal', value: 'normal' },
                { label: 'Overlay', value: 'overlay' },
                { label: 'Multiply', value: 'multiply' },
                { label: 'Screen', value: 'screen' }
              ]}
              onChange={(v) => updateOverlay(o.id, { blendMode: v })}
            />
          </div>
        </div>
      ))}

      <button 
        onClick={addOverlay}
        className={styles.layerStackAdd}
        style={{ borderRadius: 'var(--r-sm)', border: '1px dashed var(--line)' }}
      >
        <Plus size={14} style={{ marginRight: '6px' }} /> Add Overlay
      </button>
    </div>
  );
}
