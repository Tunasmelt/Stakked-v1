'use client';

import React, { useState } from 'react';
import { StakkedElement } from '@/types/element';

/**
 * NavigationElement — WYSIWYG preview of a Navigation/Menu element.
 *
 * Supports:
 *  - Sticky header (position: sticky, top: 0) via element.style.position.type
 *  - Mobile hamburger toggle for screens narrower than 768 px (matched in preview via CSS)
 *  - Link strip is rendered so positioning + typography is WYSIWYG in the editor
 */
export default function NavigationElement({ element }: { element: StakkedElement }) {
  const content = element.content.type === 'navigation' ? element.content : null;
  const links = content?.links ?? [];
  const navStyle = content?.navStyle ?? 'horizontal';

  // Is the navigation configured as sticky?
  const isSticky = element.style.position?.type === 'sticky';

  // Mobile hamburger state — only functional in preview; in editor it's a visual cue
  const [menuOpen, setMenuOpen] = useState(false);
  const [prevElementId, setPrevElementId] = useState(element.id);
  // Close menu when the element identity changes (e.g. selection switches)
  if (prevElementId !== element.id) {
    setPrevElementId(element.id);
    setMenuOpen(false);
  }

  const textColor = element.style.typography?.color ?? '#ffffff';
  const bgColor =
    element.style.fills?.[0]?.type === 'color'
      ? element.style.fills[0].value
      : 'rgba(0,0,0,0.7)';
  const fontSize = element.style.typography?.fontSize ?? 14;
  const fontFamily = element.style.typography?.fontFamily ?? 'inherit';

  return (
    <nav
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'inherit',
        overflow: 'hidden',
        fontFamily,
        fontSize,
        color: textColor,
        backgroundColor: bgColor,
        backdropFilter: 'blur(8px)',
        // Sticky — only applies meaningfully inside the real exported page wrapper
        position: isSticky ? 'sticky' : 'relative',
        top: isSticky ? 0 : undefined,
        zIndex: isSticky ? 100 : undefined,
        boxShadow: isSticky ? '0 2px 12px rgba(0,0,0,0.18)' : undefined,
      }}
    >
      {/* ── Desktop link strip + hamburger button ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: navStyle === 'centered' ? 'center' : 'flex-start',
          gap: 20,
          padding: '0 16px',
          height: '100%',
          minHeight: 44,
          flexWrap: 'wrap',
        }}
      >
        {/* Links — hidden on tiny editor thumbnails via opacity when menu is open on mobile */}
        {links.length === 0 ? (
          <span style={{ opacity: 0.4, fontSize: 12 }}>
            Add navigation links in the properties panel…
          </span>
        ) : (
          links.map((l, i) => (
            <a
              key={`${l.href}-${i}`}
              href={l.href}
              style={{
                color: 'inherit',
                textDecoration: 'none',
                padding: '4px 0',
                borderBottom: '1px solid transparent',
                transition: 'border-color 150ms',
                whiteSpace: 'nowrap',
              }}
              onClick={(e) => e.preventDefault()}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.borderBottomColor = textColor)
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.borderBottomColor = 'transparent')
              }
            >
              {l.label}
            </a>
          ))
        )}

        {/* Hamburger menu button — appears right-aligned */}
        <button
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
          style={{
            marginLeft: 'auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 4,
            width: 28,
            height: 28,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 2,
            flexShrink: 0,
            opacity: 0.8,
          }}
        >
          <span
            style={{
              display: 'block',
              width: '100%',
              height: 2,
              background: textColor,
              borderRadius: 1,
              transformOrigin: '50% 50%',
              transform: menuOpen ? 'rotate(45deg) translate(0, 6px)' : 'none',
              transition: 'transform 200ms',
            }}
          />
          <span
            style={{
              display: 'block',
              width: '100%',
              height: 2,
              background: textColor,
              borderRadius: 1,
              opacity: menuOpen ? 0 : 1,
              transition: 'opacity 150ms',
            }}
          />
          <span
            style={{
              display: 'block',
              width: '100%',
              height: 2,
              background: textColor,
              borderRadius: 1,
              transformOrigin: '50% 50%',
              transform: menuOpen ? 'rotate(-45deg) translate(0, -6px)' : 'none',
              transition: 'transform 200ms',
            }}
          />
        </button>
      </div>

      {/* ── Mobile dropdown ── */}
      {menuOpen && links.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            background: bgColor,
            padding: '8px 16px 12px',
            gap: 4,
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {links.map((l, i) => (
            <a
              key={`mob-${l.href}-${i}`}
              href={l.href}
              style={{
                color: 'inherit',
                textDecoration: 'none',
                padding: '8px 0',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
              }}
              onClick={(e) => e.preventDefault()}
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
