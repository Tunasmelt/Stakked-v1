'use client';

import React from 'react';
import { StakkedElement } from '@/types/element';
import { useProjectStore } from '@/stores/project-store';
import { Select, Slider, Toggle } from '@/components/ui/Primitives';
import styles from '@/styles/PropertiesPanel.module.css';

interface Props {
  element: StakkedElement;
  pageIndex: number;
}

/**
 * ScrollSection — controls for parallax movement and per-element scroll-snap.
 *
 * The underlying types live on `style.parallax` and `style.scrollSection`,
 * so this component is a thin editor on top of those fields.
 */
export default function ScrollSection({ element, pageIndex }: Props) {
  const updateElementStyle = useProjectStore((s) => s.updateElementStyle);

  const parallax = element.style.parallax ?? { enabled: false, speed: 0.4, direction: 'vertical' as const };
  const scrollSection = element.style.scrollSection ?? {
    enabled: false,
    snapType: 'none' as const,
    snapAlign: 'none' as const,
  };

  const patchParallax = (patch: Partial<NonNullable<StakkedElement['style']['parallax']>>) => {
    updateElementStyle(pageIndex, element.id, {
      parallax: { ...parallax, ...patch },
    });
  };

  const patchScroll = (patch: Partial<NonNullable<StakkedElement['style']['scrollSection']>>) => {
    updateElementStyle(pageIndex, element.id, {
      scrollSection: { ...scrollSection, ...patch },
    });
  };

  return (
    <div className={styles.sectionInner}>
      {/* Parallax */}
      <div style={{ marginBottom: 16 }}>
        <Toggle
          label="Parallax on scroll"
          checked={parallax.enabled}
          onChange={(v) => patchParallax({ enabled: v })}
        />
        {parallax.enabled && (
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Slider
              label="Speed"
              value={Math.max(0, Math.min(1, parallax.speed))}
              min={0}
              max={1}
              step={0.05}
              onChange={(v) => patchParallax({ speed: v })}
            />
            <Select
              label="Direction"
              value={parallax.direction}
              options={[
                { label: 'Vertical', value: 'vertical' },
                { label: 'Horizontal', value: 'horizontal' },
              ]}
              onChange={(v) => patchParallax({ direction: v as 'vertical' | 'horizontal' })}
            />
            <p style={{ fontSize: 10, color: 'var(--text-mute)', margin: 0 }}>
              Positive speeds move the element at a fraction of the scroll delta.
            </p>
          </div>
        )}
      </div>

      <div style={{ height: 1, background: 'var(--line)', margin: '12px 0' }} />

      {/* Scroll snap */}
      <div>
        <Toggle
          label="Scroll snap zone"
          checked={scrollSection.enabled}
          onChange={(v) => patchScroll({ enabled: v })}
        />
        {scrollSection.enabled && (
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Select
              label="Snap axis"
              value={scrollSection.snapType}
              options={[
                { label: 'None', value: 'none' },
                { label: 'Vertical', value: 'y' },
                { label: 'Horizontal', value: 'x' },
                { label: 'Both', value: 'both' },
              ]}
              onChange={(v) => patchScroll({ snapType: v as 'none' | 'y' | 'x' | 'both' })}
            />
            <Select
              label="Snap alignment"
              value={scrollSection.snapAlign}
              options={[
                { label: 'None', value: 'none' },
                { label: 'Start', value: 'start' },
                { label: 'Center', value: 'center' },
                { label: 'End', value: 'end' },
              ]}
              onChange={(v) => patchScroll({ snapAlign: v as 'none' | 'start' | 'center' | 'end' })}
            />
            <p style={{ fontSize: 10, color: 'var(--text-mute)', margin: 0 }}>
              Activates <code>scroll-snap-align</code> on this element in preview & published output.
            </p>
          </div>
        )}
      </div>

      <div style={{ marginTop: 14, padding: 8, borderRadius: 'var(--r-sm)', background: 'color-mix(in oklab, var(--accent) 10%, transparent)', border: '1px solid color-mix(in oklab, var(--accent) 20%, transparent)', fontSize: 10, color: 'var(--accent)' }}>
        Tip: combine a slow parallax speed with a <strong>whileInView</strong> fade for
        cinematic scroll sections. Entrance animations still run once per view.
      </div>

    </div>
  );
}
