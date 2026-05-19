'use client';

import React, { useState } from 'react';
import { StakkedElement } from '@/types/element';

/**
 * TabsElement — tabbed content containers.
 * Phase 5.14 spec: customizable tab bar (discography / FAQ / feature lists).
 */
export default function TabsElement({ element }: { element: StakkedElement }) {
  const content = element.content.type === 'tabs' ? element.content : null;
  const tabs = content?.tabs ?? [];
  const [active, setActive] = useState(0);

  if (tabs.length === 0) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255,255,255,0.5)',
          fontSize: 12,
          borderRadius: 'inherit',
        }}
      >
        Add tabs in the properties panel…
      </div>
    );
  }

  const safe = active < tabs.length ? active : 0;
  const accent = element.style.typography?.color ?? '#3b82f6';

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'inherit',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 4,
          borderBottom: '1px solid rgba(255,255,255,0.15)',
          padding: '0 4px',
        }}
      >
        {tabs.map((t, i) => (
          <button
            key={t.label ?? i}
            type="button"
            onClick={() => setActive(i)}
            style={{
              padding: '8px 12px',
              border: 0,
              background: 'transparent',
              color: i === safe ? '#fff' : 'rgba(255,255,255,0.55)',
              borderBottom: i === safe ? `2px solid ${accent}` : '2px solid transparent',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 12,
              fontWeight: 500,
              marginBottom: -1,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div style={{ padding: 12, flex: 1, color: '#fff', fontSize: 13, lineHeight: 1.5 }}>
        {tabs[safe]?.content}
      </div>
    </div>
  );
}
