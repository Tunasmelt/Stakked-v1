'use client';

import React from 'react';
import { StakkedElement, StakkedProgressContent } from '@/types/element';
import styles from '@/styles/Elements.module.css';

export default function ProgressElement({ element }: { element: StakkedElement; isEditing?: boolean }) {
  const content = element.content.type === 'progress'
    ? element.content as StakkedProgressContent
    : null;

  if (!content) return null;

  const { value, label, showValue, barColor, trackColor, rounded, animated, style } = content;
  const clampedValue = Math.min(100, Math.max(0, value));

  const typo = element.style.typography;
  const labelStyle: React.CSSProperties = typo ? {
    fontFamily: typo.fontFamily,
    fontSize: typo.fontSize ?? 14,
    color: typo.color ?? '#ffffff',
    fontWeight: typo.fontWeight ?? 500,
  } : { fontSize: 14, color: '#ffffff', fontWeight: 500 };

  if (style === 'circle') {
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference - (clampedValue / 100) * circumference;

    return (
      <div className={styles.progressWrapper}>
        <div className={styles.progressCircleContainer}>
          <svg width="88" height="88" viewBox="0 0 88 88">
            <circle
              cx="44" cy="44" r={radius}
              fill="none"
              stroke={trackColor}
              strokeWidth="8"
            />
            <circle
              cx="44" cy="44" r={radius}
              fill="none"
              stroke={barColor}
              strokeWidth="8"
              strokeLinecap={rounded ? 'round' : 'butt'}
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{
                transform: 'rotate(-90deg)',
                transformOrigin: 'center',
                transition: animated ? 'stroke-dashoffset 0.6s ease' : 'none',
              }}
            />
          </svg>
          {showValue && (
            <span className={styles.progressCircleValue} style={labelStyle}>
              {clampedValue}%
            </span>
          )}
        </div>
        {label && (
          <span className={styles.progressLabel} style={labelStyle}>{label}</span>
        )}
      </div>
    );
  }

  // Bar style
  return (
    <div className={styles.progressWrapper}>
      {(label || showValue) && (
        <div className={styles.progressLabelRow}>
          {label && <span className={styles.progressLabel} style={labelStyle}>{label}</span>}
          {showValue && <span className={styles.progressValue} style={labelStyle}>{clampedValue}%</span>}
        </div>
      )}
      <div
        className={styles.progressTrack}
        style={{
          background: trackColor,
          borderRadius: rounded ? 999 : 2,
        }}
      >
        <div
          className={styles.progressFill}
          style={{
            width: `${clampedValue}%`,
            background: barColor,
            borderRadius: rounded ? 999 : 2,
            transition: animated ? 'width 0.6s ease' : 'none',
          }}
        />
      </div>
    </div>
  );
}
