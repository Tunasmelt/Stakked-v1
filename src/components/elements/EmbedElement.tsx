'use client';

import React from 'react';
import { StakkedElement } from '@/types/element';
import styles from '@/styles/Elements.module.css';

export default function EmbedElement({ element }: { element: StakkedElement }) {
  const content = element.content.type === 'embed' ? element.content : null;

  return (
    <div className={styles.iframeWrapper}>
      <div className={styles.iframeOverlay}></div>
      {content?.html ? (
        <iframe
          srcDoc={content.html}
          className={styles.iframe}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#18181b', color: '#52525b', fontSize: '12px' }}>
          HTML Embed
        </div>
      )}
    </div>
  );
}
