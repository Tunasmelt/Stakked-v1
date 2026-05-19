'use client';

import React from 'react';
import { StakkedElement } from '@/types/element';
import styles from '@/styles/Elements.module.css';

/**
 * MarqueeElement — scrolling text/image strip.
 * Phase 5.12 spec: speed + direction controls.
 * Uses CSS-only animation so it previews identically in the editor and
 * published output.
 */
export default function MarqueeElement({ element }: { element: StakkedElement }) {
  const content = element.content.type === 'marquee' ? element.content : null;
  const items = content?.items ?? [];
  const direction = content?.direction ?? 'left';
  const speed = content?.speed ?? 40;
  const duration = Math.max(6, 60 / Math.max(speed, 1));

  // Double the item list so the infinite scroll never shows a gap.
  const loop = items.length ? [...items, ...items] : ['Your marquee text…'];

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        borderRadius: 'inherit',
      }}
    >
      <div
        className={direction === 'right' ? styles.marqueeTrackRight : styles.marqueeTrack}
        style={{ animationDuration: `${duration}s` }}
      >
        {loop.map((item, i) => (
          <span
            key={i}
            style={{
              fontSize: element.style.typography?.fontSize ?? 16,
              fontWeight: element.style.typography?.fontWeight ?? 500,
              color: element.style.typography?.color ?? '#fff',
              fontFamily: element.style.typography?.fontFamily ?? 'inherit',
            }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
