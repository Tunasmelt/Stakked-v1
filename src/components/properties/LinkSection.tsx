'use client';

import React from 'react';
import { useProjectStore } from '@/stores/project-store';
import { StakkedElement } from '@/types/element';
import { Select } from '@/components/ui/Primitives';
import styles from '@/styles/PropertiesPanel.module.css';

interface LinkSectionProps {
  element: StakkedElement;
  pageIndex: number;
}

export default function LinkSection({ element, pageIndex }: LinkSectionProps) {
  const updateElementStyle = useProjectStore((s) => s.updateElementStyle);
  const link = element.style.link ?? {
    to: '',
    target: '_self' as const,
    type: 'external' as const,
  };

  const onUpdate = (updates: Partial<typeof link>) => {
    updateElementStyle(pageIndex, element.id, {
      link: { ...link, ...updates },
    });
  };

  return (
    <div className={styles.sectionInner}>
      <div className={styles.controlGroup}>
        <label className={styles.label}>Destination</label>
        <input
          className={styles.input}
          type="text"
          value={link.to}
          placeholder="https://example.com"
          onChange={(event) => onUpdate({ to: event.target.value })}
        />
      </div>

      <Select
        label="Type"
        value={link.type}
        options={[
          { label: 'External URL', value: 'external' },
          { label: 'Page', value: 'page' },
          { label: 'Scroll', value: 'scroll' },
          { label: 'Email', value: 'email' },
          { label: 'Phone', value: 'phone' },
        ]}
        onChange={(value) => onUpdate({ type: value as typeof link.type })}
      />

      <Select
        label="Target"
        value={link.target}
        options={[
          { label: 'Same tab', value: '_self' },
          { label: 'New tab', value: '_blank' },
        ]}
        onChange={(value) => onUpdate({ target: value as typeof link.target })}
      />
    </div>
  );
}
