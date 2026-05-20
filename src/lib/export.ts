/**
 * export.ts
 * ----------
 * Static HTML compiler for Stakked projects. Phase 4.5.
 *
 * Takes a StakkedProject + page index and emits a single self-contained
 * HTML document. All styles are inlined; optional small images can be
 * base64-embedded by the caller. The output renders identically to
 * PreviewRenderer under the same page canvas dimensions.
 *
 * Call tree:
 *   compileProjectToHtml(project, pageIndex)
 *     └─ renderPage(page, settings)
 *          └─ renderElement(el)     ← per-element HTML
 *          └─ renderAnimations(els) ← emits <style> with @keyframes
 */

import { StakkedProject, StakkedPage, Background } from '@/types/project';
import { StakkedElement } from '@/types/element';


export interface CompileOptions {
  /** Page to render. Default 0. */
  pageIndex?: number;
  /** Optional custom <title>. Defaults to project.title. */
  title?: string;
  /** Add <link rel="canonical" href="…"> when set. */
  canonicalUrl?: string;
  /** Inline Google Fonts (Inter, Space Grotesk, Outfit) by default. */
  embedGoogleFonts?: boolean;
  /**
   * Map of page ID → relative HTML filename for the same publication bundle.
   * When provided, window.__stakkedNavigate can resolve navigate actions to
   * the correct sibling page file (e.g. 'page-1.html').
   * Key format: 'page-<pageId>'  Value: relative filename, e.g. 'page-1.html'
   */
  pageUrlMap?: Record<string, string>;
}

/**
 * Main entry point. Compile a project into a standalone HTML string.
 */
export function compileProjectToHtml(
  project: StakkedProject,
  options: CompileOptions = {},
): string {
  const { pageIndex = 0, title = project.title, canonicalUrl, embedGoogleFonts = true, pageUrlMap } = options;
  const page = project.pages[pageIndex];
  if (!page) {
    return minimalErrorHtml(`Page ${pageIndex} not found in project "${project.title}".`);
  }

  const body = renderPage(page);
  const pageCss = collectPageCss(page);
  const fontLink = embedGoogleFonts
    ? `<!-- Google Fonts: requires internet access. For offline use, self-host the WOFF2 files. -->\n` +
      `<link rel="preconnect" href="https://fonts.googleapis.com">\n` +
      `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n` +
      `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap">`
    : '';

  const canonical = canonicalUrl ? `<link rel="canonical" href="${escapeAttr(canonicalUrl)}">` : '';
  const resolvedTitle = project.settings?.metaTitle || title;
  const metaDesc = project.settings?.metaDesc
    ? `<meta name="description" content="${escapeAttr(project.settings.metaDesc)}">\n<meta property="og:description" content="${escapeAttr(project.settings.metaDesc)}">`
    : '';
  const robots = project.settings?.robots
    ? `<meta name="robots" content="${escapeAttr(project.settings.robots)}">`
    : '';
  const ogImage = project.settings?.ogImage
    ? `<meta property="og:image" content="${escapeAttr(project.settings.ogImage)}">`
    : '';
  const favicon = project.settings?.favicon
    ? `<link rel="icon" href="${escapeAttr(project.settings.favicon)}">`
    : '';
  const lang = project.settings?.language || 'en';
  // Strip </style> to prevent CSS injection breaking out of the <style> block.
  const customCss   = project.settings?.customCss
    ? `<style>${project.settings.customCss.replace(/<\/style>/gi, '')}</style>`
    : '';
  const headCode    = project.settings?.headCode    ?? '';
  const bodyCode    = project.settings?.bodyCode    ?? '';
  const analyticsId = project.settings?.analyticsId
    ? `<!-- Google Analytics -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=${escapeAttr(project.settings.analyticsId)}"></script>\n<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${escapeAttr(project.settings.analyticsId)}');</script>`
    : '';
  const plausible = project.settings?.plausible
    ? `<script defer data-domain="${escapeAttr(project.settings.plausible)}" src="https://plausible.io/js/script.js"></script>`
    : '';

  return `<!DOCTYPE html>
<html lang="${escapeAttr(lang)}">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(resolvedTitle)}</title>
${metaDesc}
${robots}
<meta property="og:title" content="${escapeAttr(resolvedTitle)}">
<meta property="og:type" content="website">
${ogImage}
${canonical}
${favicon}
${analyticsId}
${plausible}
${fontLink}
<style>
  *,*:before,*:after { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  html,body { margin: 0; padding: 0; }
  body { font-family: Inter, system-ui, -apple-system, sans-serif; }
  a { color: inherit; }
${pageCss}
</style>
${customCss}
${headCode}
</head>
<body>
${body}
${runtimeScripts(pageUrlMap)}
${bodyCode}
</body>
</html>`;
}

/* --------------------------------------------------------------- */
/*  Runtime scripts injected once per exported page                  */
/* --------------------------------------------------------------- */

function runtimeScripts(pageUrlMap?: Record<string, string>): string {
  // Serialise the page map so the navigate runtime can find sibling pages.
  // Falls back to an empty object — navigate will be a no-op for single-page exports.
  const pageMapJson = JSON.stringify(pageUrlMap ?? {});

  return `<script>
(function(){
  /* ── Cross-page navigation ───────────────────────────────────── */
  var PAGE_MAP=${pageMapJson};
  window.__stakkedNavigate=function(target){
    if(!target)return;
    // 'page-<id>' → look up the relative filename in the map
    if(target.indexOf('page-')===0){
      var file=PAGE_MAP[target];
      if(file){window.location.href=file;return;}
    }
    // external URL or fallback
    if(target.indexOf('http')===0||target.indexOf('/')===0){
      window.location.href=target;
    }
  };

  /* Wire data-stakked-navigate click handlers */
  document.addEventListener('click',function(e){
    var el=e.target&&e.target.closest('[data-stakked-navigate]');
    if(el)window.__stakkedNavigate(el.getAttribute('data-stakked-navigate'));
  });
})();
</script>`;
}

/* --------------------------------------------------------------- */
/*  Page + element rendering                                         */
/* --------------------------------------------------------------- */

function renderPage(page: StakkedPage): string {
  const bg = resolveBackgroundCss(page.canvas.background);
  const height = page.canvas.height === 'auto' ? '100vh' : `${page.canvas.height}px`;

  // Build a lookup map so containers can resolve child IDs
  const elementMap = new Map<string, StakkedElement>(page.elements.map((e) => [e.id, e]));

  // Only render top-level elements (not children already claimed by a container)
  const containerChildIds = new Set<string>(
    page.elements
      .filter((e) => e.content.type === 'container')
      .flatMap((e) => (e.content as { children: string[] }).children),
  );

  const elements = page.elements
    .filter((el) => el.visible !== false && !containerChildIds.has(el.id))
    .sort((a, b) => a.zIndex - b.zIndex)
    .map((el) => renderElement(el, elementMap))
    .join('\n');

  return `<div class="stakked-page" style="min-height:100vh;background:${bg};overflow-x:hidden;">
  <div style="position:relative;width:${page.canvas.width}px;min-height:${height};margin:0 auto;">
${elements}
  </div>
</div>`;
}

function renderElement(el: StakkedElement, elementMap: Map<string, StakkedElement>): string {
  const a11y = el.style.accessibility;
  const semanticTag = a11y?.tag || 'div';
  const outerStyle = [
    'position:absolute',
    `left:${el.position.x}px`,
    `top:${el.position.y}px`,
    `width:${el.size.width}px`,
    `height:${el.size.height === 'auto' ? 'auto' : `${el.size.height}px`}`,
    `z-index:${el.zIndex}`,
    (() => {
      const tr = el.style.transform;
      const parts: string[] = [];
      if (el.rotation) parts.push(`rotate(${el.rotation}deg)`);
      if (tr) {
        if (tr.scaleX !== 1 || tr.scaleY !== 1) parts.push(`scale(${tr.scaleX},${tr.scaleY})`);
        if (tr.skewX) parts.push(`skewX(${tr.skewX}deg)`);
        if (tr.skewY) parts.push(`skewY(${tr.skewY}deg)`);
        if (tr.translateX) parts.push(`translateX(${tr.translateX}px)`);
        if (tr.translateY) parts.push(`translateY(${tr.translateY}px)`);
      }
      return parts.length ? `transform:${parts.join(' ')}` : '';
    })(),
    buildBoxStyleInline(el),
  ]
    .filter(Boolean)
    .join(';');

  const roleAttr = a11y?.role ? ` role="${escapeAttr(a11y.role)}"` : '';
  const ariaAttr = a11y?.ariaLabel ? ` aria-label="${escapeAttr(a11y.ariaLabel)}"` : '';
  const tabAttr = a11y?.tabIndex != null ? ` tabindex="${a11y.tabIndex}"` : '';

  // Every element gets an id so it can be a scroll-anchor target
  const idAttr = ` id="el-${escapeAttr(el.id)}"`;

  // Wrap inner content in a link if the element has a style-level link
  const innerHtml = wrapWithLink(renderContent(el, elementMap), el);

  return `  <${semanticTag}${idAttr}${roleAttr}${ariaAttr}${tabAttr} style="${outerStyle}">${innerHtml}</${semanticTag}>`;
}

/** Wraps element inner HTML in an <a> if the element has a style.link defined. */
function wrapWithLink(inner: string, el: StakkedElement): string {
  const link = el.style.link;
  if (!link || !link.to) return inner;

  let href = '';
  switch (link.type) {
    case 'external':
      href = link.to;
      break;
    case 'page':
      href = `/${link.to}`;
      break;
    case 'scroll':
      href = `#el-${link.to}`;
      break;
    case 'email':
      href = `mailto:${link.to}`;
      break;
    case 'phone':
      href = `tel:${link.to}`;
      break;
    default:
      href = link.to;
  }

  const targetAttr = link.target ? ` target="${escapeAttr(link.target)}"` : '';
  const relAttr = link.target === '_blank' ? ' rel="noopener noreferrer"' : '';

  return `<a href="${escapeAttr(href)}"${targetAttr}${relAttr} style="display:contents;text-decoration:none;color:inherit;">${inner}</a>`;
}

function renderContent(el: StakkedElement, elementMap: Map<string, StakkedElement> = new Map()): string {
  const { content } = el;
  switch (content.type) {
    case 'text':
      return `<div style="width:100%;height:100%;${buildTypographyInline(el)}">${scrubHtml(content.html)}</div>`;
    case 'image':
      return `<img src="${escapeAttr(content.src)}" alt="${escapeAttr(content.alt || '')}" loading="lazy" style="width:100%;height:100%;display:block;object-fit:${escapeAttr(content.objectFit || 'cover')};">`;
    case 'button':
      return `<a href="${escapeAttr(content.url)}" style="display:inline-flex;align-items:center;justify-content:center;width:100%;height:100%;text-decoration:none;${buildTypographyInline(el)}">${escapeHtml(content.label)}</a>`;
    case 'divider':
      return `<hr style="width:100%;border:0;border-top:2px solid ${escapeAttr(content.color || '#27272a')};margin:0;">`;
    case 'embed':
      return `<div style="width:100%;height:100%;">${content.html}</div>`;
    case 'video':
      if (content.embedHtml) return `<div style="width:100%;height:100%;">${content.embedHtml}</div>`;
      return content.url
        ? `<video src="${escapeAttr(content.url)}"${content.autoplay ? ' autoplay muted playsinline' : ''}${content.loop ? ' loop' : ''} controls style="width:100%;height:100%;object-fit:cover;"></video>`
        : `<div style="width:100%;height:100%;background:#111;"></div>`;
    case 'icon': {
      // Resolve icon set: default to 'lucide' when set is generic/undefined
      const iconSet = content.set && content.set !== 'lucide' ? content.set : 'lucide';
      // Iconify CDN serves SVG with colour injection via ?color query param
      const iconSrc = `https://api.iconify.design/${iconSet}/${content.name.toLowerCase()}.svg?color=${encodeURIComponent(content.color || '#ffffff')}`;
      return `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;">` +
        `<img src="${escapeAttr(iconSrc)}" alt="${escapeAttr(content.name)}" width="${content.size}" height="${content.size}" style="display:block;">` +
        `</div>`;
    }
    case 'shape':
      if (content.svg) return `<div style="width:100%;height:100%;color:${escapeAttr(content.fill)};">${content.svg}</div>`;
      if (content.variant === 'circle')
        return `<div style="width:100%;height:100%;background:${escapeAttr(content.fill)};border-radius:50%;"></div>`;
      return `<div style="width:100%;height:100%;background:${escapeAttr(content.fill)};"></div>`;
    case 'gallery': {
      const gLayout = content.layout || 'grid';
      const gCols = content.columns || 3;
      const gImgs = content.images.map((img: { src: string; alt?: string }) =>
        `<img src="${escapeAttr(img.src)}" alt="${escapeAttr(img.alt || '')}" loading="lazy" style="width:100%;height:100%;object-fit:cover;flex-shrink:0;">`
      ).join('');
      if (gLayout === 'carousel') {
        return `<div style="width:100%;height:100%;overflow:hidden;position:relative;"><div style="display:flex;height:100%;">${gImgs}</div></div>`;
      }
      if (gLayout === 'strip') {
        return `<div style="display:flex;gap:4px;width:100%;height:100%;overflow-x:auto;">${content.images.map((img: { src: string; alt?: string }) =>
          `<img src="${escapeAttr(img.src)}" alt="${escapeAttr(img.alt || '')}" loading="lazy" style="height:100%;width:auto;flex-shrink:0;object-fit:cover;">`).join('')}</div>`;
      }
      if (gLayout === 'masonry') {
        return `<div style="columns:${gCols};gap:8px;width:100%;">${content.images.map((img: { src: string; alt?: string }) =>
          `<img src="${escapeAttr(img.src)}" alt="${escapeAttr(img.alt || '')}" loading="lazy" style="width:100%;margin-bottom:8px;display:block;">`).join('')}</div>`;
      }
      return `<div style="display:grid;grid-template-columns:repeat(${gCols}, 1fr);gap:8px;width:100%;height:100%;">${gImgs}</div>`;
    }
    case 'line': {
      const t = content.thickness ?? 2;
      const halfH2 = t / 2 + 1;
      const dashArr =
        content.style === 'dashed' ? `stroke-dasharray="${t * 4} ${t * 2}"` :
        content.style === 'dotted' ? `stroke-dasharray="${t} ${t * 2}"` : '';
      const arrowEndId   = `ae-${el.id}`;
      const arrowStartId = `as-${el.id}`;
      const hasArrows = content.arrows !== 'none';
      const pad = hasArrows ? t * 5 : 0;
      const x1v = content.arrows === 'start' || content.arrows === 'both' ? pad : 0;
      const x2v = content.arrows === 'end'   || content.arrows === 'both' ? (el.size.width as number) - pad : el.size.width as number;
      const defs = hasArrows
        ? `<defs>
            <marker id="${arrowEndId}" markerWidth="${t * 3}" markerHeight="${t * 3}" refX="${t * 2}" refY="${t * 1.5}" orient="auto"><path d="M0,0 L0,${t * 3} L${t * 3},${t * 1.5} z" fill="${escapeAttr(content.color)}"/></marker>
            <marker id="${arrowStartId}" markerWidth="${t * 3}" markerHeight="${t * 3}" refX="${t * 2}" refY="${t * 1.5}" orient="auto-start-reverse"><path d="M0,0 L0,${t * 3} L${t * 3},${t * 1.5} z" fill="${escapeAttr(content.color)}"/></marker>
           </defs>` : '';
      const mStart = content.arrows === 'start' || content.arrows === 'both' ? `marker-start="url(#${arrowStartId})"` : '';
      const mEnd   = content.arrows === 'end'   || content.arrows === 'both' ? `marker-end="url(#${arrowEndId})"` : '';
      const rotate = content.angle !== 0 ? `transform="rotate(${content.angle} ${(el.size.width as number) / 2} ${halfH2})"` : '';
      return `<svg width="${el.size.width}" height="${t + 4}" viewBox="0 0 ${el.size.width} ${t + 4}" style="display:block;overflow:visible;">
        ${defs}
        <line x1="${x1v}" y1="${halfH2}" x2="${x2v}" y2="${halfH2}" stroke="${escapeAttr(content.color)}" stroke-width="${t}" stroke-linecap="round" ${dashArr} ${mStart} ${mEnd} ${rotate}/>
      </svg>`;
    }
    case 'drawing': {
      const paths = (content.paths ?? []) as Array<{ d: string; color: string; width: number; opacity: number }>;
      const pathHtml = paths.map((p) =>
        `<path d="${escapeAttr(p.d)}" stroke="${escapeAttr(p.color)}" stroke-width="${p.width}" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="${p.opacity}"/>`
      ).join('');
      // Coerce 'auto' height to a numeric fallback so the SVG viewBox is always valid
      const vbH = typeof el.size.height === 'number' ? el.size.height : 300;
      return `<svg width="100%" height="100%" viewBox="0 0 ${el.size.width} ${vbH}" xmlns="http://www.w3.org/2000/svg" style="display:block;">${pathHtml}</svg>`;
    }
    case 'container': {
      const layoutCss =
        content.layoutType === 'stack'
          ? 'display:flex;flex-direction:column;gap:8px;'
          : content.layoutType === 'grid'
          ? 'display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px;'
          : ''; // free — children are absolutely positioned relative to container
      const isAbsolute = content.layoutType === 'free';
      const children = content.children
        .map((childId) => elementMap.get(childId))
        .filter((child): child is StakkedElement => child !== undefined && child.visible !== false)
        .sort((a, b) => a.zIndex - b.zIndex)
        .map((child) => {
          if (isAbsolute) {
            // Re-render with position relative to container origin
            return renderElement(child, elementMap);
          }
          // For stack/grid, render without absolute positioning
          const innerStyle = buildBoxStyleInline(child);
          return `<div style="${innerStyle}">${renderContent(child, elementMap)}</div>`;
        })
        .join('');
      return `<div style="width:100%;height:100%;position:${isAbsolute ? 'relative' : 'static'};${layoutCss}overflow:hidden;">${children}</div>`;
    }
    default:
      return '';
  }
}

/* --------------------------------------------------------------- */
/*  Style helpers                                                    */
/* --------------------------------------------------------------- */

function buildBoxStyleInline(el: StakkedElement): string {
  const s = el.style;
  const parts: string[] = [];

  if (s.effects?.opacity != null && s.effects.opacity !== 1) parts.push(`opacity:${s.effects.opacity}`);
  if (s.effects?.overflow) parts.push(`overflow:${s.effects.overflow}`);
  if (s.effects?.cursor) parts.push(`cursor:${s.effects.cursor}`);
  if (s.effects?.backdropFilter) {
    parts.push(`backdrop-filter:${s.effects.backdropFilter}`);
    parts.push(`-webkit-backdrop-filter:${s.effects.backdropFilter}`);
  }

  const r = s.borderRadius;
  if (r && (r.topLeft || r.topRight || r.bottomRight || r.bottomLeft)) {
    parts.push(
      `border-radius:${r.topLeft}${r.unit} ${r.topRight}${r.unit} ${r.bottomRight}${r.unit} ${r.bottomLeft}${r.unit}`,
    );
  }

  // Border
  const b = s.border;
  if (b) {
    if (b.linked && b.top.width > 0 && b.top.style !== 'none') {
      parts.push(`border:${b.top.width}px ${b.top.style} ${b.top.color}`);
    } else if (!b.linked) {
      const sides = [
        ['top', b.top], ['right', b.right], ['bottom', b.bottom], ['left', b.left],
      ] as const;
      for (const [side, style] of sides) {
        if (style.width > 0 && style.style !== 'none') {
          parts.push(`border-${side}:${style.width}px ${style.style} ${style.color}`);
        }
      }
    }
  }

  const fill = s.fills?.[0];
  if (fill) {
    if (fill.type === 'color') parts.push(`background:${fill.value}`);
    else if (fill.type === 'gradient' || fill.type === 'pattern') parts.push(`background:${fill.value}`);
    else if (fill.type === 'image' && fill.value) {
      parts.push(`background:url(${fill.value}) center/${fill.fit ?? 'cover'} no-repeat`);
    }
  }

  if (s.effects?.shadows?.length) {
    parts.push(
      `box-shadow:${s.effects.shadows
        .map((sh) => `${sh.type === 'inner' ? 'inset ' : ''}${sh.x}px ${sh.y}px ${sh.blur}px ${sh.spread}px ${sh.color}`)
        .join(', ')}`,
    );
  }

  return parts.join(';');
}

function buildTypographyInline(el: StakkedElement): string {
  const t = el.style.typography;
  if (!t) return '';
  const parts: string[] = [];
  if (t.fontFamily)     parts.push(`font-family:${t.fontFamily}`);
  if (t.fontSize)       parts.push(`font-size:${t.fontSize}px`);
  if (t.fontWeight)     parts.push(`font-weight:${t.fontWeight}`);
  if (t.fontStyle && t.fontStyle !== 'normal') parts.push(`font-style:${t.fontStyle}`);
  if (t.color)          parts.push(`color:${t.color}`);
  if (t.textAlign)      parts.push(`text-align:${t.textAlign}`);
  if (t.textDecoration && t.textDecoration !== 'none') parts.push(`text-decoration:${t.textDecoration}`);
  if (t.textTransform && t.textTransform !== 'none')   parts.push(`text-transform:${t.textTransform}`);
  if (t.lineHeight)     parts.push(`line-height:${t.lineHeight}`);
  if (t.letterSpacing)  parts.push(`letter-spacing:${t.letterSpacing}px`);
  if (t.wordSpacing)    parts.push(`word-spacing:${t.wordSpacing}px`);
  return parts.join(';');
}

function resolveBackgroundCss(bg?: Background): string {
  if (!bg) return '#0a0a0a';
  switch (bg.type) {
    case 'color':
      return bg.value;
    case 'gradient':
      return bg.value;
    case 'image':
      return `url(${bg.value}) center/${bg.fit} no-repeat`;
    case 'pattern':
      return bg.value;
    default:
      return '#0a0a0a';
  }
}

/**
 * Emit one CSS block per element that has an animation, plus the shared
 * marquee keyframes.
 */
function collectPageCss(_page: StakkedPage): string {
  return ''; // Animation system removed
}

/* --------------------------------------------------------------- */
/*  Server-side HTML scrubbing                                       */
/* --------------------------------------------------------------- */

/**
 * Lightweight server-safe HTML scrubber used for user-authored rich text
 * in the static export pipeline. DOMPurify is unavailable on the server
 * (it requires a DOM), so this regex-based fallback strips the most dangerous
 * vectors: script elements, javascript: URLs, and on* event handlers.
 *
 * This is intentionally minimal — it protects the published HTML output from
 * XSS injected via crafted project JSON (e.g. a malicious publish API call).
 * The live preview (PreviewRenderer) uses the full DOMPurify sanitiser.
 */
function scrubHtml(html: string): string {
  return html
    // Remove <script>…</script> blocks (case-insensitive, across newlines)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove on* event handler attributes (e.g. onclick="…")
    .replace(/(<[^>]+?)\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '$1')
    // Remove javascript: URLs
    .replace(/href\s*=\s*["']?\s*javascript:[^"'\s>]*/gi, 'href="#"');
}

/* --------------------------------------------------------------- */
/*  Escaping                                                         */
/* --------------------------------------------------------------- */

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeAttr(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function minimalErrorHtml(message: string): string {
  return `<!DOCTYPE html><html><body><pre>${escapeHtml(message)}</pre></body></html>`;
}
