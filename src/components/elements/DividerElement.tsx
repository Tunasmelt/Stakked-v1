'use client';

import React from 'react';
import { StakkedElement } from '@/types/element';
import styles from '@/styles/Elements.module.css';

/**
 * DividerElement: Visual horizontal divider.
 */
export default function DividerElement({ element }: { element: StakkedElement }) {
  const content = element.content.type === 'divider'
    ? element.content
    : { variant: 'solid', color: '#27272a' };

  const thickness = typeof element.size.height === 'number' ? element.size.height : 1;

  // Gradient-fade renders as a background gradient instead of a border
  if (content.variant === 'gradient-fade') {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
        <div
          className={styles.divider}
          style={{
            width: '100%',
            height: `${thickness}px`,
            background: `linear-gradient(to right, transparent, ${content.color}, transparent)`,
            border: 'none',
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
      <div
        className={styles.divider}
        style={{
          borderTopStyle: (content.variant as React.CSSProperties['borderTopStyle']) || 'solid',
          borderTopColor: content.color,
          borderTopWidth: `${thickness}px`,
          width: '100%',
        }}
      />
    </div>
  );
}
