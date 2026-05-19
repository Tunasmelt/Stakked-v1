'use client';

import React from 'react';
import { StakkedElement, StakkedLineContent } from '@/types/element';

interface Props {
  element: StakkedElement;
  isSelected: boolean;
  isEditing: boolean;
}

/**
 * LineElement — renders a styled SVG line across the element bounding box.
 * The angle rotates the line within the SVG viewport.
 */
export default function LineElement({ element }: Props) {
  const c = element.content as StakkedLineContent;
  const w = typeof element.size.width === 'number' ? element.size.width : 320;
  const h = Math.max(typeof element.size.height === 'number' ? element.size.height : 2, c.thickness + 2);

  const halfH = h / 2;

  // Stroke dash array for style
  const dashArray =
    c.style === 'dashed' ? `${c.thickness * 4},${c.thickness * 2}` :
    c.style === 'dotted' ? `${c.thickness},${c.thickness * 2}` :
    undefined;

  // Arrow marker IDs — two markers so start and end each point the right way.
  const markerEndId   = `arrow-end-${element.id}`;
  const markerStartId = `arrow-start-${element.id}`;

  // Compute start/end X adjusted for arrow markers
  const arrowPad = c.arrows !== 'none' ? c.thickness * 5 : 0;
  const x1 = c.arrows === 'start' || c.arrows === 'both' ? arrowPad : 0;
  const x2 = c.arrows === 'end' || c.arrows === 'both' ? w - arrowPad : w;

  const arrowPath = `M0,0 L0,${c.thickness * 3} L${c.thickness * 3},${c.thickness * 1.5} z`;

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', overflow: 'visible' }}
    >
      {(c.arrows !== 'none') && (
        <defs>
          {/* End arrow — points in the direction of line travel */}
          <marker
            id={markerEndId}
            markerWidth={c.thickness * 3}
            markerHeight={c.thickness * 3}
            refX={c.thickness * 2}
            refY={c.thickness * 1.5}
            orient="auto"
          >
            <path d={arrowPath} fill={c.color} />
          </marker>
          {/* Start arrow — auto-start-reverse flips it to point backward */}
          <marker
            id={markerStartId}
            markerWidth={c.thickness * 3}
            markerHeight={c.thickness * 3}
            refX={c.thickness * 2}
            refY={c.thickness * 1.5}
            orient="auto-start-reverse"
          >
            <path d={arrowPath} fill={c.color} />
          </marker>
        </defs>
      )}
      <line
        x1={x1}
        y1={halfH}
        x2={x2}
        y2={halfH}
        stroke={c.color}
        strokeWidth={c.thickness}
        strokeDasharray={dashArray}
        strokeLinecap="round"
        markerStart={c.arrows === 'start' || c.arrows === 'both' ? `url(#${markerStartId})` : undefined}
        markerEnd={c.arrows === 'end'   || c.arrows === 'both' ? `url(#${markerEndId})`   : undefined}
        transform={c.angle !== 0 ? `rotate(${c.angle}, ${w / 2}, ${halfH})` : undefined}
      />
    </svg>
  );
}
