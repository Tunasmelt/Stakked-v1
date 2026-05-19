/* src/components/properties/PageSection.tsx */
'use client';

import React from 'react';
import { useProjectStore } from '@/stores/project-store';
import { PRESET_LIST, AnimationPresetId } from '@/lib/animation-engine';
import { CanvasSettings } from '@/types/project';
import { Select, NumberInput } from '@/components/ui/Primitives';
import styles from '@/styles/PropertiesPanel.module.css';

export default function PageSection() {
  const activePageIndex = useProjectStore(state => state.activePageIndex);
  const page = useProjectStore(state => state.project?.pages[activePageIndex]);
  const updatePage = useProjectStore(state => state.updatePage);

  if (!page) return null;

  const setTransition = (v: string) => {
    updatePage(page.id, { transition: v as AnimationPresetId });
  };

  const setCanvas = (patch: Record<string, string | number>) => {
    updatePage(page.id, { canvas: { ...page.canvas, ...patch } as CanvasSettings });
  };

  return (
    <div className={styles.sectionInner}>
      <Select
        label="Page Transition"
        value={page.transition ?? 'none'}
        options={[
          { label: 'None', value: 'none' },
          ...PRESET_LIST.map(p => ({ label: p.label, value: p.id }))
        ]}
        onChange={setTransition}
      />

      <div className={styles.grid2} style={{ marginTop: 10 }}>
        <NumberInput
          label="Canvas Width"
          value={page.canvas.width}
          min={320}
          max={3840}
          onChange={(v) => setCanvas({ width: v })}
        />
        <NumberInput
          label="Padding"
          value={page.canvas.padding}
          min={0}
          max={200}
          onChange={(v) => setCanvas({ padding: v })}
        />
      </div>
      
      <div style={{ marginTop: 10 }}>
         <p style={{ fontSize: 10, color: 'var(--text-mute)', fontStyle: 'italic' }}>
            {"// transitions apply when entering this page"}
         </p>
      </div>
    </div>
  );
}
