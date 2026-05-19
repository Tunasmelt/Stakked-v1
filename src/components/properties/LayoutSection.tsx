'use client';

import React from 'react';
import { useProjectStore } from '@/stores/project-store';
import { StakkedElement } from '@/types/element';
import { Select, NumberInput, Toggle } from '@/components/ui/Primitives';
import styles from '@/styles/PropertiesPanel.module.css';

// Default layout object for elements that don't have one yet
const DEFAULT_LAYOUT = {
  type: 'free' as const,
  direction: 'row' as const,
  align: 'start' as const,
  distribution: 'start' as const,
  gap: 0,
  wrap: false,
  padding: { top: 0, right: 0, bottom: 0, left: 0, linked: true },
};

export default function LayoutSection({ element, pageIndex }: { element: StakkedElement, pageIndex: number }) {
  const updateElementStyle = useProjectStore((s) => s.updateElementStyle);

  // If the element has no layout object, treat it as free/absolute but still
  // allow the user to switch to stack/grid. We never return null here.
  const layout = element.style.layout ?? DEFAULT_LAYOUT;

  return (
    <div className={styles.sectionInner}>
      <Select
        label="Layout Type"
        value={layout.type}
        options={[
          { label: 'Free (Absolute)', value: 'free' },
          { label: 'Stack (Flexbox)', value: 'stack' },
          { label: 'Grid', value: 'grid' }
        ]}
        onChange={(v) => updateElementStyle(pageIndex, element.id, {
          layout: { ...layout, type: v as 'free' | 'stack' | 'grid' }
        })}
      />

      {layout.type !== 'free' && (
        <>
          <div className={styles.grid2}>
            <Select
              label="Direction"
              value={layout.direction}
              options={[
                { label: 'Row', value: 'row' },
                { label: 'Column', value: 'column' },
                { label: 'Row (Reversed)', value: 'row-reverse' },
                { label: 'Column (Reversed)', value: 'column-reverse' },
              ]}
              onChange={(v) => updateElementStyle(pageIndex, element.id, {
                layout: { ...layout, direction: v as 'row' | 'column' | 'row-reverse' | 'column-reverse' }
              })}
            />
            <Select
              label="Align"
              value={layout.align}
              options={[
                { label: 'Start', value: 'start' },
                { label: 'Center', value: 'center' },
                { label: 'End', value: 'end' },
                { label: 'Stretch', value: 'stretch' }
              ]}
              onChange={(v) => updateElementStyle(pageIndex, element.id, {
                layout: { ...layout, align: v as 'start' | 'center' | 'end' | 'stretch' | 'baseline' }
              })}
            />
          </div>

          <div className={styles.grid2}>
            <Select
              label="Distribution"
              value={layout.distribution}
              options={[
                { label: 'Start', value: 'start' },
                { label: 'Center', value: 'center' },
                { label: 'End', value: 'end' },
                { label: 'Between', value: 'between' }
              ]}
              onChange={(v) => updateElementStyle(pageIndex, element.id, {
                layout: { ...layout, distribution: v as 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly' }
              })}
            />
            <NumberInput
              label="Gap"
              value={layout.gap}
              onChange={(v) => updateElementStyle(pageIndex, element.id, {
                layout: { ...layout, gap: v }
              })}
            />
          </div>

          <Toggle
            label="Wrap Elements"
            checked={layout.wrap}
            onChange={(v) => updateElementStyle(pageIndex, element.id, {
              layout: { ...layout, wrap: v }
            })}
          />
        </>
      )}
    </div>
  );
}
