'use client';

import React from 'react';
import { StakkedElement } from '@/types/element';
import styles from '@/styles/Elements.module.css';

export default function ButtonElement({ element }: { element: StakkedElement }) {
  const content = element.content.type === 'button' ? element.content : { label: 'Button', variant: 'filled' };

  const typo = element.style.typography;

  return (
    <button
      type="button"
      className={`${styles.button} ${styles[content.variant || 'filled']}`}
      style={{
        width: '100%',
        height: '100%',
        fontFamily:    typo?.fontFamily    || undefined,
        fontSize:      typo?.fontSize      ? `${typo.fontSize}px` : undefined,
        fontWeight:    typo?.fontWeight    || undefined,
        color:         typo?.color         || undefined,
        letterSpacing: typo?.letterSpacing != null ? `${typo.letterSpacing}px` : undefined,
        textTransform: typo?.textTransform as React.CSSProperties['textTransform'] || undefined,
      }}
      // Prevent button click from propagating to the canvas selection handler
      onClick={(e) => e.stopPropagation()}
    >
      {content.label}
    </button>
  );
}
