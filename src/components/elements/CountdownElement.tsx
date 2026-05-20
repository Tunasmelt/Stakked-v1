'use client';

import React, { useState, useEffect } from 'react';
import { StakkedElement, StakkedCountdownContent } from '@/types/element';
import styles from '@/styles/Elements.module.css';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function computeTimeLeft(targetDate: string): TimeLeft {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const totalSecs = Math.floor(diff / 1000);
  const days = Math.floor(totalSecs / 86400);
  const hours = Math.floor((totalSecs % 86400) / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  const seconds = totalSecs % 60;
  return { days, hours, minutes, seconds };
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export default function CountdownElement({ element }: { element: StakkedElement; isEditing?: boolean }) {
  const content = element.content.type === 'countdown'
    ? element.content as StakkedCountdownContent
    : null;

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(
    content ? computeTimeLeft(content.targetDate) : { days: 0, hours: 0, minutes: 0, seconds: 0 }
  );

  useEffect(() => {
    if (!content) return;
    setTimeLeft(computeTimeLeft(content.targetDate));
    const interval = setInterval(() => {
      setTimeLeft(computeTimeLeft(content.targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [content?.targetDate]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!content) return null;

  const { label, showLabels, format } = content;

  const typo = element.style.typography;
  const numberStyle: React.CSSProperties = {
    fontFamily: typo?.fontFamily ?? 'inherit',
    fontSize: typo?.fontSize ?? 40,
    fontWeight: typo?.fontWeight ?? 700,
    color: typo?.color ?? '#ffffff',
    lineHeight: 1,
  };
  const unitLabelStyle: React.CSSProperties = {
    fontFamily: typo?.fontFamily ?? 'inherit',
    fontSize: 11,
    color: typo?.color ? `${typo.color}99` : 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
  };

  const units: { value: string; label: string }[] = [];
  if (format === 'dhms') {
    units.push(
      { value: pad(timeLeft.days), label: 'Days' },
      { value: pad(timeLeft.hours), label: 'Hours' },
      { value: pad(timeLeft.minutes), label: 'Mins' },
      { value: pad(timeLeft.seconds), label: 'Secs' },
    );
  } else if (format === 'hms') {
    units.push(
      { value: pad(timeLeft.hours + timeLeft.days * 24), label: 'Hours' },
      { value: pad(timeLeft.minutes), label: 'Mins' },
      { value: pad(timeLeft.seconds), label: 'Secs' },
    );
  } else {
    units.push(
      { value: pad(timeLeft.minutes + (timeLeft.hours + timeLeft.days * 24) * 60), label: 'Mins' },
      { value: pad(timeLeft.seconds), label: 'Secs' },
    );
  }

  return (
    <div className={styles.countdownWrapper}>
      <div className={styles.countdownUnits}>
        {units.map((unit, i) => (
          <React.Fragment key={unit.label}>
            {i > 0 && (
              <span className={styles.countdownSeparator} style={numberStyle}>:</span>
            )}
            <div className={styles.countdownUnit}>
              <span className={styles.countdownNumber} style={numberStyle}>{unit.value}</span>
              {showLabels && (
                <span className={styles.countdownUnitLabel} style={unitLabelStyle}>{unit.label}</span>
              )}
            </div>
          </React.Fragment>
        ))}
      </div>
      {label && (
        <div className={styles.countdownMainLabel} style={{ ...unitLabelStyle, marginTop: 8, fontSize: 12 }}>
          {label}
        </div>
      )}
    </div>
  );
}
