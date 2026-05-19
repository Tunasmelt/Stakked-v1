'use client';

import React from 'react';
import { StakkedElement } from '@/types/element';

/**
 * TestimonialElement — styled quote block with avatar, author, role.
 * Phase 5.11 spec.
 */
export default function TestimonialElement({ element }: { element: StakkedElement }) {
  const content = element.content.type === 'testimonial' ? element.content : null;

  if (!content) return null;

  return (
    <blockquote
      style={{
        width: '100%',
        height: '100%',
        margin: 0,
        padding: 16,
        borderRadius: 'inherit',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 8,
        color: element.style.typography?.color ?? '#fff',
        fontFamily: element.style.typography?.fontFamily ?? 'inherit',
      }}
    >
      <p style={{ margin: 0, fontStyle: 'italic', fontSize: element.style.typography?.fontSize ?? 16, lineHeight: 1.4 }}>
        &ldquo;{content.quote}&rdquo;
      </p>
      <footer style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
        {content.avatar && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={content.avatar}
            alt={content.author}
            style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
          />
        )}
        <span style={{ fontSize: 12, opacity: 0.8 }}>
          — {content.author}
          {content.role && <span style={{ opacity: 0.6 }}>, {content.role}</span>}
        </span>
      </footer>
    </blockquote>
  );
}
