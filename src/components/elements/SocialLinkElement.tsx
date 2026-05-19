'use client';

import React from 'react';
import { StakkedElement } from '@/types/element';
import { detectPlatform } from '@/lib/social-detect';
import styles from '@/styles/Elements.module.css';

export default function SocialLinkElement({ element }: { element: StakkedElement }) {
  const content = element.content.type === 'social-link' ? element.content : null;
  const platform = detectPlatform(content?.url || '');
  const displayMode = content?.displayMode ?? 'icon+text';

  const iconNode = (
    <div
      style={{
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        backgroundColor: platform.color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        color: 'white',
        flexShrink: 0,
      }}
    >
      {platform.name[0]}
    </div>
  );

  const textNode = (
    <span>{content?.url ? platform.name : 'Add Link'}</span>
  );

  return (
    <div className={styles.socialLink}>
      {displayMode !== 'text-only' && iconNode}
      {displayMode !== 'icon-only' && textNode}
    </div>
  );
}
