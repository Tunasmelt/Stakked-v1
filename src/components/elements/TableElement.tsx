'use client';

import React from 'react';
import { StakkedElement, StakkedTableContent } from '@/types/element';
import styles from '@/styles/Elements.module.css';

export default function TableElement({ element }: { element: StakkedElement; isEditing?: boolean }) {
  const content = element.content.type === 'table'
    ? element.content as StakkedTableContent
    : null;

  if (!content) return null;

  const { headers, data, striped, bordered } = content;

  const headerBg = element.style.fills?.[0]?.value && element.style.fills[0].value !== 'transparent'
    ? element.style.fills[0].value
    : 'rgba(255,255,255,0.08)';

  const typo = element.style.typography;
  const fontStyle: React.CSSProperties = typo ? {
    fontFamily: typo.fontFamily,
    fontSize: Math.max(12, (typo.fontSize ?? 14) * 0.3),
    color: typo.color ?? '#ffffff',
  } : { fontSize: 13, color: '#ffffff' };

  return (
    <div className={styles.tableWrapper}>
      <table
        className={[
          styles.table,
          striped ? styles.tableStriped : '',
          bordered ? styles.tableBordered : '',
        ].filter(Boolean).join(' ')}
        style={{ pointerEvents: 'none', ...fontStyle }}
      >
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                className={styles.th}
                style={{ background: headerBg }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, ri) => (
            <tr key={ri} className={striped && ri % 2 === 1 ? styles.tableRowAlt : ''}>
              {row.map((cell, ci) => (
                <td key={ci} className={styles.td}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
