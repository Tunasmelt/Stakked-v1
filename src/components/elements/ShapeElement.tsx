'use client';

import React from 'react';
import { StakkedElement } from '@/types/element';

export default function ShapeElement({ element }: { element: StakkedElement }) {
  const content = element.content.type === 'shape' ? element.content : { variant: 'rect', fill: '#3b82f6' };

  const renderShape = () => {
    const f = content.fill;
    switch (content.variant) {
      case 'circle':
        return <circle cx="50" cy="50" r="50" fill={f} />;
      case 'triangle':
        return <polygon points="50,0 100,100 0,100" fill={f} />;
      case 'diamond':
        return <polygon points="50,0 100,50 50,100 0,50" fill={f} />;
      case 'star':
        return <polygon points="50,2 61.8,33.8 95.6,35.2 69,56.2 78.2,88.8 50,70 21.8,88.8 31,56.2 4.4,35.2 38.2,33.8" fill={f} />;
      case 'pentagon':
        return <polygon points="50,2 95.6,35.2 78.2,88.8 21.8,88.8 4.4,35.2" fill={f} />;
      case 'hexagon':
        return <polygon points="50,2 91.6,26 91.6,74 50,98 8.4,74 8.4,26" fill={f} />;
      case 'arrow-right':
        return <polygon points="0,25 65,25 65,5 100,50 65,95 65,75 0,75" fill={f} />;
      case 'arrow-left':
        return <polygon points="100,25 35,25 35,5 0,50 35,95 35,75 100,75" fill={f} />;
      case 'cross':
        return <polygon points="35,0 65,0 65,35 100,35 100,65 65,65 65,100 35,100 35,65 0,65 0,35 35,35" fill={f} />;
      case 'cloud':
        return (
          <path
            d="M 25,80 Q 5,80 5,62 Q 5,48 18,45 Q 15,22 35,20 Q 45,5 62,15 Q 78,8 84,24 Q 98,26 96,45 Q 105,48 100,62 Q 100,80 80,80 Z"
            fill={f}
          />
        );
      case 'ellipse':
        return <ellipse cx="50" cy="50" rx="50" ry="30" fill={f} />;
      // ── New variants ────────────────────────────────────────────────────────
      case 'oval':
        return <ellipse cx="50" cy="50" rx="48" ry="30" fill={f} />;
      case 'rhombus':
        return <polygon points="50,5 95,50 50,95 5,50" fill={f} />;
      case 'trapezoid':
        return <polygon points="20,80 80,80 95,20 5,20" fill={f} />;
      case 'parallelogram':
        return <polygon points="25,80 100,80 75,20 0,20" fill={f} />;
      case 'arrow-up':
        return <polygon points="50,5 95,65 70,65 70,95 30,95 30,65 5,65" fill={f} />;
      case 'arrow-down':
        return <polygon points="50,95 5,35 30,35 30,5 70,5 70,35 95,35" fill={f} />;
      case 'octagon':
        return <polygon points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30" fill={f} />;
      case 'heart':
        return (
          <path
            d="M50,85 C10,60 0,40 0,28 C0,12 12,2 25,2 C35,2 45,8 50,18 C55,8 65,2 75,2 C88,2 100,12 100,28 C100,40 90,60 50,85 Z"
            fill={f}
          />
        );
      case 'lightning':
        return <polygon points="60,2 25,55 48,55 40,98 75,45 52,45" fill={f} />;
      case 'check':
        return (
          <path
            d="M10,50 L35,78 L90,20"
            fill="none"
            stroke={f}
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      case 'x-box':
        return (
          <>
            <rect width="100" height="100" rx="8" fill={f} />
            <line x1="22" y1="22" x2="78" y2="78" stroke="white" strokeWidth="12" strokeLinecap="round" />
            <line x1="78" y1="22" x2="22" y2="78" stroke="white" strokeWidth="12" strokeLinecap="round" />
          </>
        );
      case 'badge':
        return (
          <path
            d="M10,20 Q10,5 25,5 L75,5 Q90,5 90,20 L90,68 Q90,78 80,83 L55,95 Q50,98 45,95 L20,83 Q10,78 10,68 Z"
            fill={f}
          />
        );
      case 'rect':
      default:
        return <rect width="100" height="100" fill={f} />;
    }
  };

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      {renderShape()}
    </svg>
  );
}
