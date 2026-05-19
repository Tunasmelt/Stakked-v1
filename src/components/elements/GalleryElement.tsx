'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { StakkedElement } from '@/types/element';

/**
 * GalleryElement: Multi-layout image gallery for the Stakked canvas.
 * Supports: grid, masonry, bento, carousel, strip.
 */
export default function GalleryElement({ element }: { element: StakkedElement }) {
  const content = element.content.type === 'gallery' ? element.content : null;
  const [carouselIdx, setCarouselIdx] = useState(0);
  const imageCount = content?.images.length ?? 0;
  const [prevImageCount, setPrevImageCount] = useState(imageCount);
  // Clamp index when images are added/removed so we're never out-of-bounds
  if (prevImageCount !== imageCount) {
    setPrevImageCount(imageCount);
    setCarouselIdx(idx => Math.min(idx, Math.max(0, imageCount - 1)));
  }

  const emptyGrid = (
    <div style={{ width: '100%', height: '100%', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', padding: '4px', background: '#18181b', borderRadius: 'inherit', overflow: 'hidden' }}>
      {[1,2,3,4,5,6].map(i => <div key={i} style={{ aspectRatio: '1', background: '#27272a' }} />)}
    </div>
  );

  if (!content || !content.images.length) return emptyGrid;

  const cols = content.columns || 3;
  const layout = content.layout || 'grid';
  const images = content.images;

  // ── Carousel ────────────────────────────────────────────────────────────────
  if (layout === 'carousel') {
    const safe = Math.min(carouselIdx, images.length - 1);
    return (
      <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', borderRadius: 'inherit' }}>
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <Image src={images[safe].src} alt={images[safe].alt || ''} fill unoptimized style={{ objectFit: 'cover' }} />
        </div>
        {/* Prev / Next */}
        <button
          onClick={(e) => { e.stopPropagation(); setCarouselIdx(Math.max(0, safe - 1)); }}
          style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', fontSize: 14 }}
        >‹</button>
        <button
          onClick={(e) => { e.stopPropagation(); setCarouselIdx(Math.min(images.length - 1, safe + 1)); }}
          style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', fontSize: 14 }}
        >›</button>
        {/* Dots */}
        <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 4 }}>
          {images.map((_, i) => (
            <div key={i} onClick={(e) => { e.stopPropagation(); setCarouselIdx(i); }}
              style={{ width: 6, height: 6, borderRadius: '50%', background: i === safe ? '#fff' : 'rgba(255,255,255,0.4)', cursor: 'pointer' }} />
          ))}
        </div>
      </div>
    );
  }

  // ── Strip (horizontal scroll) ────────────────────────────────────────────
  if (layout === 'strip') {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', gap: 6, overflowX: 'auto', borderRadius: 'inherit' }}>
        {images.map((img, i) => (
          <div key={i} style={{ position: 'relative', flexShrink: 0, width: 'auto', height: '100%', aspectRatio: '1' }}>
            <Image src={img.src} alt={img.alt || ''} fill unoptimized style={{ objectFit: 'cover' }} />
          </div>
        ))}
      </div>
    );
  }

  // ── Masonry (CSS columns) ────────────────────────────────────────────────
  if (layout === 'masonry') {
    return (
      <div style={{ width: '100%', height: '100%', columnCount: cols, columnGap: 6, borderRadius: 'inherit', overflow: 'hidden' }}>
        {images.map((img, i) => (
          <div key={i} style={{ breakInside: 'avoid', marginBottom: 6 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.src} alt={img.alt || ''} style={{ width: '100%', display: 'block', objectFit: 'cover' }} />
          </div>
        ))}
      </div>
    );
  }

  // ── Bento (first image large, rest small) ───────────────────────────────
  if (layout === 'bento') {
    return (
      <div style={{ width: '100%', height: '100%', display: 'grid', gridTemplateColumns: '2fr 1fr', gridTemplateRows: '2fr 1fr', gap: 6, borderRadius: 'inherit', overflow: 'hidden' }}>
        {images.map((img, i) => (
          <div key={i} style={{ position: 'relative', gridColumn: i === 0 ? '1 / 2' : undefined, gridRow: i === 0 ? '1 / 3' : undefined }}>
            <Image src={img.src} alt={img.alt || ''} fill unoptimized style={{ objectFit: 'cover' }} />
          </div>
        ))}
      </div>
    );
  }

  // ── Grid (default) ──────────────────────────────────────────────────────
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '6px', width: '100%', height: '100%', borderRadius: 'inherit', overflow: 'hidden' }}>
      {images.map((img, i) => (
        <div key={i} style={{ position: 'relative', width: '100%', aspectRatio: '1' }}>
          <Image src={img.src} alt={img.alt || 'Gallery item'} fill unoptimized style={{ objectFit: 'cover' }} />
        </div>
      ))}
    </div>
  );
}
