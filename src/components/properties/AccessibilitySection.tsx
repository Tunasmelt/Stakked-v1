'use client';

import React from 'react';
import { useProjectStore } from '@/stores/project-store';
import { StakkedElement } from '@/types/element';
import { Select, NumberInput } from '@/components/ui/Primitives';
import styles from '@/styles/PropertiesPanel.module.css';

export default function AccessibilitySection({ element, pageIndex }: { element: StakkedElement, pageIndex: number }) {
  const updateElementStyle = useProjectStore((s) => s.updateElementStyle);
  
  const acc = element.style.accessibility || {
    tag: 'div', role: '', ariaLabel: '', tabIndex: 0, alt: ''
  };

  const updateAcc = (updates: Partial<{ tag: string, role: string, ariaLabel: string, tabIndex: number, alt: string }>) => {
    updateElementStyle(pageIndex, element.id, {
      accessibility: { ...acc, ...updates }
    });
  };

  return (
    <div className={styles.sectionInner}>
      <Select
        label="HTML Tag"
        value={acc.tag}
        options={[
          { label: '<div>', value: 'div' },
          { label: '<section>', value: 'section' },
          { label: '<article>', value: 'article' },
          { label: '<header>', value: 'header' },
          { label: '<footer>', value: 'footer' },
          { label: '<nav>', value: 'nav' },
          { label: '<main>', value: 'main' },
          { label: '<h1>', value: 'h1' },
          { label: '<button>', value: 'button' },
          { label: '<a>', value: 'a' }
        ]}
        onChange={(v) => updateAcc({ tag: v })}
      />

      <div className={styles.controlGroup}>
        <label className={styles.label}>ARIA Role</label>
        <input
          className={styles.input}
          type="text"
          value={acc.role || ''}
          placeholder="e.g. complementary"
          onChange={(e) => updateAcc({ role: e.target.value })}
        />
      </div>

      <div className={styles.controlGroup}>
        <label className={styles.label}>ARIA Label</label>
        <input
          className={styles.input}
          type="text"
          value={acc.ariaLabel || ''}
          placeholder="Descriptive label..."
          onChange={(e) => updateAcc({ ariaLabel: e.target.value })}
        />
      </div>

      {element.type === 'image' && (
        <div className={styles.controlGroup}>
          <label className={styles.label}>Alt Text</label>
          <input
            className={styles.input}
            type="text"
            value={acc.alt || ''}
            placeholder="Image description..."
            onChange={(e) => updateAcc({ alt: e.target.value })}
          />
        </div>
      )}

      <NumberInput
        label="Tab Index"
        value={acc.tabIndex || 0}
        onChange={(v) => updateAcc({ tabIndex: v })}
      />
    </div>
  );
}
