'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { StakkedElement } from '@/types/element';
import styles from '@/styles/Elements.module.css';

/**
 * ImageElement: High-performance image component for the Stakked canvas.
 * Utilizes Next.js Image with unoptimized flag for dynamic user content.
 */
const Placeholder = () => (
  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#27272a', borderRadius: 'inherit', gap: 6 }}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
    <span style={{ color: '#52525b', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>Image</span>
  </div>
);

export default function ImageElement({ element }: { element: StakkedElement }) {
  const content = element.content.type === 'image' ? element.content : null;
  const [errored, setErrored] = useState(false);

  if (!content || !content.src || errored) {
    return <Placeholder />;
  }

  return (
    <div className={styles.imageWrapper} style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', borderRadius: 'inherit' }}>
      <Image
        src={content.src}
        alt={content.alt || ''}
        fill
        unoptimized
        draggable={false}
        onError={() => setErrored(true)}
        style={{
          objectFit: (content.objectFit as 'cover' | 'contain' | 'fill') || 'cover',
          pointerEvents: 'none',
        }}
        className={styles.image}
      />
    </div>
  );
}
