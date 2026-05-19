/**
 * export-image.ts
 * ----------------
 * PNG + JPEG export of the live canvas using a pure-browser pipeline:
 *
 *   1. Snapshot the target DOM node
 *   2. Inline all computed styles onto each cloned element
 *   3. Wrap the clone inside an <svg><foreignObject> …
 *   4. Draw the SVG onto a Canvas at the requested scale
 *   5. Read the canvas out as PNG / JPEG
 *
 * Phase 4.1 / 4.2. No external npm dependency needed — Safari, Chrome, and
 * Firefox all support the foreignObject path. For hardened PDF export and
 * perfect iframe capture, see `src/app/api/export/pdf/route.ts` (Puppeteer).
 */

export interface ExportImageOptions {
  /** 'png' → lossless; 'jpeg' → small file, uses `quality`. Default 'png'. */
  format?: 'png' | 'jpeg';
  /** JPEG quality 0..1, default 0.92. Ignored for PNG. */
  quality?: number;
  /** Scale factor (>=1 for retina). Default = devicePixelRatio. */
  pixelRatio?: number;
  /** Background color painted under the clone before capturing. */
  background?: string;
  /** Called before capture so callers can hide editor chrome. */
  beforeCapture?: () => void | Promise<void>;
  /** Called after capture so callers can restore editor chrome. */
  afterCapture?: () => void | Promise<void>;
}

/**
 * Capture `node` and return an image Blob.
 */
export async function exportNodeAsImage(
  node: HTMLElement,
  options: ExportImageOptions = {},
): Promise<Blob> {
  const {
    format = 'png',
    quality = 0.92,
    pixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
    background = '#0a0a0a',
    beforeCapture,
    afterCapture,
  } = options;

  if (typeof window === 'undefined') {
    throw new Error('exportNodeAsImage can only run in the browser');
  }

  await beforeCapture?.();
  // Ensure all @font-face resources are resolved before we clone, otherwise
  // SVG foreignObject renders with fallback fonts.
  if ('fonts' in document) {
    try {
      await document.fonts.ready;
    } catch {
      /* ignore */
    }
  }

  try {
    const rect = node.getBoundingClientRect();
    const width = Math.ceil(rect.width);
    const height = Math.ceil(rect.height);

    const clone = (await cloneWithStyles(node)) as HTMLElement;
    clone.style.margin = '0';
    clone.style.boxSizing = 'border-box';
    clone.style.background = background;

    const serialized = new XMLSerializer().serializeToString(clone);
    const svgString =
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">` +
      `<foreignObject x="0" y="0" width="100%" height="100%">` +
      `<div xmlns="http://www.w3.org/1999/xhtml" style="width:${width}px;height:${height}px;">${serialized}</div>` +
      `</foreignObject></svg>`;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to rasterize SVG snapshot'));
      img.src = url;
    });

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, width * pixelRatio);
    canvas.height = Math.max(1, height * pixelRatio);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');

    ctx.scale(pixelRatio, pixelRatio);
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, mimeType, format === 'jpeg' ? quality : undefined),
    );
    if (!blob) throw new Error('canvas.toBlob returned null — the canvas may be tainted');
    return blob;
  } finally {
    await afterCapture?.();
  }
}

/**
 * Shorthand — trigger a browser download for the captured image.
 */
export async function downloadNodeAsImage(
  node: HTMLElement,
  filename: string,
  options: ExportImageOptions = {},
): Promise<void> {
  const blob = await exportNodeAsImage(node, options);
  downloadBlob(blob, filename);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Revoke on next tick so Safari finishes the download before the URL dies.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/* ------------------------------------------------------------------ */
/*  Style-inlining clone                                               */
/* ------------------------------------------------------------------ */

/**
 * Deep-clone `node` with all computed styles inlined onto each descendant.
 * This is what makes the cloned DOM self-contained inside the SVG snapshot —
 * no external stylesheets needed.
 */
async function cloneWithStyles(node: HTMLElement): Promise<Node> {
  // Images must be inlined as data URLs so the SVG renderer can actually
  // draw them (cross-origin / same-origin HTTP requests aren't allowed
  // inside an SVG rasterized by <img>.src = data:svg;).
  const images = Array.from(node.querySelectorAll('img'));
  await Promise.all(
    images.map(async (img) => {
      if (img.src && !img.src.startsWith('data:')) {
        try {
          const dataUrl = await toDataURL(img.src);
          img.setAttribute('data-original-src', img.src);
          img.src = dataUrl;
        } catch {
          /* swallow — leave the original src, capture will still work in
             many browsers when the image is already CORS-enabled */
        }
      }
    }),
  );

  const clone = node.cloneNode(true) as HTMLElement;
  walkAndInlineStyles(node, clone);
  return clone;
}

function walkAndInlineStyles(source: Element, target: Element) {
  if (source instanceof HTMLElement && target instanceof HTMLElement) {
    const computed = window.getComputedStyle(source);
    const cssText = Array.from(computed)
      .map((key) => `${key}:${computed.getPropertyValue(key)};`)
      .join('');
    target.setAttribute('style', cssText);
  }
  const sourceChildren = Array.from(source.children);
  const targetChildren = Array.from(target.children);
  for (let i = 0; i < sourceChildren.length; i++) {
    walkAndInlineStyles(sourceChildren[i], targetChildren[i]);
  }
}

async function toDataURL(url: string): Promise<string> {
  // Route external URLs through our CORS proxy so the fetch returns with
  // Access-Control-Allow-Origin:*. Same-origin URLs are fetched directly.
  const isExternal = /^https?:/.test(url) && !url.startsWith(window.location.origin);
  const target = isExternal ? `/api/assets/proxy?url=${encodeURIComponent(url)}` : url;

  const response = await fetch(target);
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
  const blob = await response.blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
