'use client';

import React from 'react';
import { StakkedElement } from '@/types/element';
import styles from '@/styles/Elements.module.css';
import { sanitizeEmbedHtml } from '@/lib/sanitize';

export default function MusicPlayerElement({ element, isEditing }: { element: StakkedElement, isEditing: boolean }) {
  const content = element.content.type === 'music-player' ? element.content : null;

  return (
    <div className={styles.iframeWrapper}>
      {/* Overlay always present in editor so Moveable drag/resize/select isn't
          swallowed by the iframe. It is only hidden when actively editing
          (i.e. the user double-clicked to interact with the embed). */}
      {!isEditing && <div className={styles.iframeOverlay} />}
      {content?.embedHtml ? (
        <div dangerouslySetInnerHTML={{ __html: sanitizeEmbedHtml(content.embedHtml) }} />
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#18181b', color: '#52525b' }}>
           Paste valid URL to embed
        </div>
      )}
    </div>
  );
}
