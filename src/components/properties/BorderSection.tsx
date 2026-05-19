'use client';

import React from 'react';
import { useProjectStore } from '@/stores/project-store';
import { StakkedElement } from '@/types/element';
import { ColorPicker, NumberInput, Select, Toggle } from '@/components/ui/Primitives';
import styles from '@/styles/PropertiesPanel.module.css';

interface BorderSectionProps {
  element: StakkedElement;
  pageIndex: number;
}

export default function BorderSection({ element, pageIndex }: BorderSectionProps) {
  const updateElementStyle = useProjectStore((s) => s.updateElementStyle);
  const border = element.style.border;
  const radius = element.style.borderRadius;

  const updateBorder = (updates: Partial<typeof border.top>) => {
    const nextSide = { ...border.top, ...updates };
    updateElementStyle(pageIndex, element.id, {
      border: {
        ...border,
        top: nextSide,
        right: border.linked ? nextSide : border.right,
        bottom: border.linked ? nextSide : border.bottom,
        left: border.linked ? nextSide : border.left,
      },
    });
  };

  const updateRadius = (corner: 'topLeft' | 'topRight' | 'bottomRight' | 'bottomLeft', value: number) => {
    updateElementStyle(pageIndex, element.id, {
      borderRadius: radius.linked
        ? { ...radius, topLeft: value, topRight: value, bottomRight: value, bottomLeft: value }
        : { ...radius, [corner]: value },
    });
  };

  return (
    <div className={styles.sectionInner}>
      <div className={styles.grid2}>
        <NumberInput label="Width" min={0} value={border.top.width} onChange={(value) => updateBorder({ width: value })} />
        <NumberInput label="Radius ↖" min={0} value={radius.topLeft} onChange={(v) => updateRadius('topLeft', v)} />
      </div>
      {!radius.linked && (
        <div className={styles.grid2}>
          <NumberInput label="Radius ↗" min={0} value={radius.topRight} onChange={(v) => updateRadius('topRight', v)} />
          <NumberInput label="Radius ↘" min={0} value={radius.bottomRight} onChange={(v) => updateRadius('bottomRight', v)} />
        </div>
      )}
      {!radius.linked && (
        <div className={styles.grid2}>
          <NumberInput label="Radius ↙" min={0} value={radius.bottomLeft} onChange={(v) => updateRadius('bottomLeft', v)} />
          <div />
        </div>
      )}

      <Toggle
        label="Link Corners"
        checked={radius.linked}
        onChange={(linked) => updateElementStyle(pageIndex, element.id, {
          borderRadius: { ...radius, linked },
        })}
      />

      <ColorPicker label="Border Color" value={border.top.color} onChange={(value) => updateBorder({ color: value })} />

      <Select
        label="Border Style"
        value={border.top.style}
        options={[
          { label: 'None', value: 'none' },
          { label: 'Solid', value: 'solid' },
          { label: 'Dashed', value: 'dashed' },
          { label: 'Dotted', value: 'dotted' },
          { label: 'Double', value: 'double' },
        ]}
        onChange={(value) => updateBorder({ style: value as typeof border.top.style })}
      />
    </div>
  );
}
