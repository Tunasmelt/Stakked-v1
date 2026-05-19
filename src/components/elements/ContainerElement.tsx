'use client';

import React from 'react';
import { StakkedElement } from '@/types/element';

/**
 * ContainerElement — the visual background layer of a Container/Frame.
 *
 * Children are rendered by CanvasElement directly inside the container's DOM
 * node (absolute-positioned, container-relative). This component only draws
 * the container surface itself: fill, border-radius, overflow clip, and — when
 * the container is empty — a dashed-outline placeholder label.
 */
export default function ContainerElement({ element }: { element: StakkedElement }) {
  const content = element.content.type === 'container' ? element.content : null;
  const layoutType = content?.layoutType ?? 'free';
  const childCount = content?.children.length ?? 0;

  // When children are present the container background is enough visual context;
  // only show the label for an empty container so authors know what it is.
  if (childCount > 0) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 'inherit',
          // Transparent — fill/border comes from wrapperStyle in CanvasElement
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: 'inherit',
        border: '1px dashed rgba(255, 255, 255, 0.2)',
        background: 'rgba(255, 255, 255, 0.02)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(255, 255, 255, 0.35)',
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: 11,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        userSelect: 'none',
        pointerEvents: 'none',
      }}
    >
      <span>container · {layoutType}</span>
    </div>
  );
}
