'use client';

import React from 'react';
import { StakkedElement } from '@/types/element';
import styles from '@/styles/Elements.module.css';

export default function ButtonElement({ element }: { element: StakkedElement }) {
  const content = element.content.type === 'button' ? element.content : { label: 'Button', variant: 'filled', url: '#' };
  const typo = element.style.typography;

  // Read fill color from style.fills[0] so the Fill panel drives the button background.
  // Inject as CSS custom properties so the variant CSS classes inherit them.
  const fill = element.style.fills?.[0];
  const fillColor = fill?.type === 'color' && fill.value !== 'transparent' ? fill.value : undefined;

  const inlineVars: React.CSSProperties = {
    ...(fillColor && { '--btn-bg': fillColor } as React.CSSProperties),
    ...(typo?.color && { '--btn-fg': typo.color } as React.CSSProperties),
    ...(fillColor && content.variant === 'outlined' && { '--btn-border': fillColor } as React.CSSProperties),
  };

  return (
    <button
      type="button"
      className={`${styles.button} ${styles[content.variant || 'filled'] ?? styles.filled}`}
      style={{
        width: '100%',
        height: '100%',
        fontFamily:    typo?.fontFamily    || undefined,
        fontSize:      typo?.fontSize      ? `${typo.fontSize}px` : undefined,
        fontWeight:    typo?.fontWeight    || undefined,
        letterSpacing: typo?.letterSpacing != null ? `${typo.letterSpacing}px` : undefined,
        textTransform: typo?.textTransform as React.CSSProperties['textTransform'] || undefined,
        ...inlineVars,
      }}
      // Prevent button click from propagating to the canvas selection handler
      onClick={(e) => e.stopPropagation()}
    >
      {content.label}
    </button>
  );
}
