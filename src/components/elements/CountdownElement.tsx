'use client';

import React, { useState, useEffect } from 'react';
import { StakkedElement } from '@/types/element';
import styles from '@/styles/Elements.module.css';

function calcTimeLeft(targetDate: string): { d: number; h: number; m: number; s: number } | null {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    d: Math.floor(diff / (1000 * 60 * 60 * 24)),
    h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    s: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

export default function CountdownElement({ element }: { element: StakkedElement }) {
  const content = element.content.type === 'countdown' ? element.content : null;

  // Initialise synchronously so there's no 1-second blank flash on first render.
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(
    () => (content?.targetDate ? calcTimeLeft(content.targetDate) : null),
  );

  useEffect(() => {
    if (!content?.targetDate) return;

    const timer = setInterval(() => {
      const next = calcTimeLeft(content.targetDate);
      setTimeLeft(next);
      if (!next) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [content?.targetDate]);

  if (!content) return null;

  return (
    <div className={styles.countdown}>
      {timeLeft ? (
        <>
          <Unit value={timeLeft.d} label="Days" />
          <Unit value={timeLeft.h} label="Hours" />
          <Unit value={timeLeft.m} label="Mins" />
          <Unit value={timeLeft.s} label="Secs" />
        </>
      ) : (
        <div style={{ fontWeight: 'bold' }}>EXPIRED</div>
      )}
    </div>
  );
}

function Unit({ value, label }: { value: number, label: string }) {
  return (
    <div className={styles.countdownUnit}>
      <span className={styles.countdownValue}>{value.toString().padStart(2, '0')}</span>
      <span className={styles.countdownLabel}>{label}</span>
    </div>
  );
}
