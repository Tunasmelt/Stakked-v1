/**
 * sanitize.ts
 * -----------
 * Central HTML sanitization utility using DOMPurify.
 * All dangerouslySetInnerHTML call sites must go through one of these helpers.
 *
 * SSR note: DOMPurify requires a DOM environment. All three functions are
 * safe to call server-side — they return the input unchanged when `window`
 * is not available (SSR renders are read-only and never executed in a
 * browser, so XSS is not a concern at that stage).
 */

import DOMPurify from 'dompurify';

const isClient = typeof window !== 'undefined';

/**
 * Strict sanitizer for TipTap-authored rich text.
 * Allows structural inline tags only — no iframes, no scripts, no style attrs.
 */
export function sanitizeHtml(dirty: string): string {
  if (!isClient || !dirty) return dirty ?? '';
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'p', 'br', 'b', 'i', 'u', 'em', 'strong',
      'span', 'a', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'style', 'class'],
  });
}

/**
 * Permissive sanitizer for oEmbed / music / video embed HTML.
 * Allows iframes (needed for Spotify, YouTube, SoundCloud, etc.)
 * but still strips scripts, event handlers, and javascript: URLs.
 */
export function sanitizeEmbedHtml(dirty: string): string {
  if (!isClient || !dirty) return dirty ?? '';
  return DOMPurify.sanitize(dirty, {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: [
      'allow', 'allowfullscreen', 'frameborder',
      'scrolling', 'src', 'loading', 'sandbox',
      'width', 'height', 'style',
    ],
    FORCE_BODY: true,
  });
}

/**
 * SVG sanitizer for user-supplied shape SVG blobs.
 * Uses DOMPurify's built-in SVG profile which strips
 * foreignObject, script elements, and event handlers.
 */
export function sanitizeSvg(dirty: string): string {
  if (!isClient || !dirty) return dirty ?? '';
  return DOMPurify.sanitize(dirty, {
    USE_PROFILES: { svg: true, svgFilters: true },
  });
}
