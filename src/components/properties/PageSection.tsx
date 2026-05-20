/* src/components/properties/PageSection.tsx */
'use client';

import React from 'react';
import { useProjectStore } from '@/stores/project-store';
import { CanvasSettings } from '@/types/project';
import { NumberInput } from '@/components/ui/Primitives';
import styles from '@/styles/PropertiesPanel.module.css';

export default function PageSection() {
  const activePageIndex = useProjectStore(state => state.activePageIndex);
  const page = useProjectStore(state => state.project?.pages[activePageIndex]);
  const updatePage = useProjectStore(state => state.updatePage);

  if (!page) return null;

  const setCanvas = (patch: Record<string, string | number>) => {
    updatePage(page.id, { canvas: { ...page.canvas, ...patch } as CanvasSettings });
  };

  return (
    <div className={styles.sectionInner}>
      <div className={styles.grid2}>
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
      
    </div>
  );
}
