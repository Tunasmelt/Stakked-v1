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
