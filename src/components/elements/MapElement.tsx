'use client';

import React from 'react';
import { StakkedElement } from '@/types/element';

/**
 * MapElement — editor-side preview of an embedded map.
 *
 * Providers:
 *   google  — public embed URL, no API key required.
 *   mapbox  — requires NEXT_PUBLIC_MAPBOX_TOKEN; shows a clear placeholder
 *             until the token is configured so users understand why it's blank.
 */

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

const placeholderStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  background: '#111',
  color: 'rgba(255,255,255,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 'inherit',
  fontSize: 11,
  fontFamily: 'var(--font-mono)',
  textAlign: 'center',
  padding: 12,
};

export default function MapElement({ element }: { element: StakkedElement }) {
  const content = element.content.type === 'map' ? element.content : null;

  if (!content) {
    return <div style={placeholderStyle}>Map</div>;
  }

  // Mapbox requires a public token — show a clear message when it's absent
  // rather than an invisible broken iframe.
  if (content.provider === 'mapbox' && !MAPBOX_TOKEN) {
    return (
      <div style={placeholderStyle}>
        Mapbox requires NEXT_PUBLIC_MAPBOX_TOKEN
      </div>
    );
  }

  const src =
    content.provider === 'mapbox'
      ? `https://api.mapbox.com/styles/v1/mapbox/streets-v12.html?access_token=${MAPBOX_TOKEN}#${content.zoom}/${content.lat}/${content.lng}`
      : content.provider === 'openstreetmap'
      ? `https://www.openstreetmap.org/export/embed.html?bbox=${content.lng - 0.05},${content.lat - 0.05},${content.lng + 0.05},${content.lat + 0.05}&layer=mapnik&marker=${content.lat},${content.lng}`
      : `https://maps.google.com/maps?q=${content.lat},${content.lng}&z=${content.zoom}&output=embed`;

  return (
    <iframe
      title="Map preview"
      src={src}
      style={{ width: '100%', height: '100%', border: 0, borderRadius: 'inherit' }}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}
