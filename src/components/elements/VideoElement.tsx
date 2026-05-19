'use client';

import React from 'react';
import { StakkedElement } from '@/types/element';
import styles from '@/styles/Elements.module.css';
import { sanitizeEmbedHtml } from '@/lib/sanitize';

export default function VideoElement({ element }: { element: StakkedElement }) {
  const content = element.content.type === 'video' ? element.content : null;

  return (
    <div className={styles.iframeWrapper}>
      {/* Overlay prevents the video/iframe from swallowing drag/resize/select clicks */}
      <div className={styles.iframeOverlay} />
      {content?.embedHtml ? (
        <div
          className={styles.iframe}
          dangerouslySetInnerHTML={{ __html: sanitizeEmbedHtml(content.embedHtml) }}
        />
      ) : content?.url ? (
        <video
          src={content.url}
          autoPlay={content.autoplay}
          muted={!!content.autoplay}
          loop={content.loop}
          playsInline
          controls={!content.autoplay}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          backgroundColor: '#000',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#52525b',
          fontSize: 11,
          fontFamily: 'var(--font-mono)',
        }}>
          video · paste URL or embed in Content panel
        </div>
      )}
    </div>
  );
}
