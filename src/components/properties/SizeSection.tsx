'use client';

// SizeSection — width/height + mode selectors
import React from 'react';
import { useProjectStore } from '@/stores/project-store';
import { StakkedElement } from '@/types/element';
import { NumberInput, Select } from '@/components/ui/Primitives';
import { OverrideIndicator } from '@/components/ui/OverrideIndicator';
import styles from '@/styles/PropertiesPanel.module.css';

interface SizeSectionProps {
  element: StakkedElement;
  pageIndex: number;
}

export default function SizeSection({ element, pageIndex }: SizeSectionProps) {
  const updateElement      = useProjectStore((s) => s.updateElement);
  const updateElementStyle = useProjectStore((s) => s.updateElementStyle);
  const sizeStyle = element.style.size;

  const isHeightAuto = sizeStyle.heightMode === 'auto' || element.size.height === 'auto';
  const isWidthAuto  = sizeStyle.widthMode  === 'auto';

  const heightNum = typeof element.size.height === 'number' ? element.size.height : 0;
  const widthNum  = typeof element.size.width  === 'number' ? element.size.width  : 0;

  return (
    <div className={styles.sectionInner}>
      <div className={styles.grid2}>
        {/* Width */}
        <div style={{ position: 'relative' }}>
          <OverrideIndicator element={element} pageIndex={pageIndex} propertyKey="size.width" />
          <NumberInput
            label="W"
            min={1}
            value={widthNum}
            disabled={isWidthAuto}
            placeholder={isWidthAuto ? 'auto' : undefined}
            onChange={(width) => {
              updateElement(pageIndex, element.id, { size: { ...element.size, width } });
            }}
          />
        </div>

        {/* Height */}
        <div style={{ position: 'relative' }}>
          <OverrideIndicator element={element} pageIndex={pageIndex} propertyKey="size.height" />
          <NumberInput
            label="H"
            min={1}
            value={heightNum}
            disabled={isHeightAuto}
            placeholder={isHeightAuto ? 'auto' : undefined}
            onChange={(height) => {
              updateElement(pageIndex, element.id, { size: { ...element.size, height } });
            }}
          />
        </div>
      </div>

      <div className={styles.grid2}>
        {/* Width Mode */}
        <div style={{ position: 'relative' }}>
          <OverrideIndicator element={element} pageIndex={pageIndex} propertyKey="size.widthMode" />
          <Select
            label="W Mode"
            value={sizeStyle.widthMode}
            options={[
              { label: 'px',   value: 'px'   },
              { label: '%',    value: '%'    },
              { label: 'vw',   value: 'vw'   },
              { label: 'auto', value: 'auto' },
            ]}
            onChange={(value) =>
              updateElementStyle(pageIndex, element.id, {
                size: { ...sizeStyle, widthMode: value as typeof sizeStyle.widthMode },
              })
            }
          />
        </div>

        {/* Height Mode */}
        <div style={{ position: 'relative' }}>
          <OverrideIndicator element={element} pageIndex={pageIndex} propertyKey="size.heightMode" />
          <Select
            label="H Mode"
            value={sizeStyle.heightMode}
            options={[
              { label: 'px',   value: 'px'   },
              { label: '%',    value: '%'    },
              { label: 'vh',   value: 'vh'   },
              { label: 'auto', value: 'auto' },
            ]}
            onChange={(value) =>
              updateElementStyle(pageIndex, element.id, {
                size: { ...sizeStyle, heightMode: value as typeof sizeStyle.heightMode },
              })
            }
          />
        </div>
      </div>
    </div>
  );
}
