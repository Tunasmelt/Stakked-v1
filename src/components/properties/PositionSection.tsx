'use client';

import React from 'react';
import { useProjectStore } from '@/stores/project-store';
import { StakkedElement } from '@/types/element';
import { NumberInput, Select } from '@/components/ui/Primitives';
import styles from '@/styles/PropertiesPanel.module.css';

export default function PositionSection({ element, pageIndex }: { element: StakkedElement; pageIndex: number }) {
  // Reactive selectors — no stale closures
  const updateElement      = useProjectStore((s) => s.updateElement);
  const updateElementStyle = useProjectStore((s) => s.updateElementStyle);

  return (
    <div className={styles.sectionInner}>
      <Select
        label="Position"
        value={element.style.position.type}
        options={[
          { label: 'Absolute', value: 'absolute' },
          { label: 'Relative', value: 'relative' },
          { label: 'Fixed',    value: 'fixed'    },
          { label: 'Sticky',   value: 'sticky'   },
        ]}
        onChange={(value) =>
          updateElementStyle(pageIndex, element.id, {
            position: { ...element.style.position, type: value as typeof element.style.position.type },
          })
        }
      />

      <div className={styles.grid2}>
        <NumberInput
          label="X"
          value={Math.round(element.position.x)}
          onChange={(x) =>
            updateElement(pageIndex, element.id, { position: { ...element.position, x: Math.round(x) } })
          }
        />
        <NumberInput
          label="Y"
          value={Math.round(element.position.y)}
          onChange={(y) =>
            updateElement(pageIndex, element.id, { position: { ...element.position, y: Math.round(y) } })
          }
        />
      </div>
    </div>
  );
}
