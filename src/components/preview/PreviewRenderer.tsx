'use client';

import React, { CSSProperties, createContext, useContext, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValue } from 'framer-motion';
import { StakkedProject, StakkedPage } from '@/types/project';
import { StakkedElement, StakkedFormContent } from '@/types/element';
import { Animation } from '@/types/animation';
import { getMotionTriggerProps } from '@/lib/animation-engine';
import { sanitizeHtml, sanitizeEmbedHtml, sanitizeSvg } from '@/lib/sanitize';

/**
 * PreviewRenderer
 * ----------------
 * Stand-alone, read-only renderer used by `/preview/[projectId]` and the
 * published output. It wires:
 *   - entry animations (onLoad / whileInView / onHover / onClick)
 *   - parallax offsets driven by window scroll
 *   - scroll-snap zones declared at the element level
 *
 * Intentionally avoids any zustand or editor imports so it can be reused
 * in static page rendering and mobile previews.
 */

/** Carries project identity into deeply nested components (e.g. PreviewForm) */
interface ProjectMeta {
  projectId: string;
  ownerId: string | undefined;
}
const ProjectMetaContext = createContext<ProjectMeta>({ projectId: '', ownerId: undefined });

/** Full element map threaded down so container cases can look up children. */
const ElementMapContext = createContext<Map<string, StakkedElement>>(new Map());

interface Props {
  project: StakkedProject;
  pageIndex?: number;
}

export default function PreviewRenderer({ project, pageIndex = 0 }: Props) {
  const page = project.pages[pageIndex];
  if (!page) {
    return (
      <div style={{ padding: 40, color: '#fca5a5' }}>
        Page {pageIndex} not found in project “{project.title}”.
      </div>
    );
  }

  const hasSnap = page.elements.some((el) => el.style.scrollSection?.enabled);
  const bg = resolveBackground(page);

  // Build a full element map so containers can look up their children by ID.
  const elementMap = new Map(page.elements.map((el) => [el.id, el]));

  // IDs that belong to a container — must not appear at the top-level layer.
  const containerChildIds = new Set<string>();
  for (const el of page.elements) {
    if (el.content.type === 'container') {
      for (const childId of (el.content as { children: string[] }).children) {
        containerChildIds.add(childId);
      }
    }
  }

  return (
    <ProjectMetaContext.Provider value={{ projectId: project.id, ownerId: project.userId }}>
    <ElementMapContext.Provider value={elementMap}>
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: bg,
        scrollSnapType: hasSnap ? 'y mandatory' : undefined,
        overflowY: hasSnap ? 'auto' : undefined,
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: page.canvas.width,
          minHeight: page.canvas.height === 'auto' ? '100vh' : page.canvas.height,
          margin: '0 auto',
        }}
      >
        {page.elements
          .filter((el) => el.visible !== false && !containerChildIds.has(el.id))
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((el) => (
            <PreviewElement key={el.id} element={el} />
          ))}
      </div>
    </div>
    </ElementMapContext.Provider>
    </ProjectMetaContext.Provider>
  );
}

/* ----------------------------- single element ----------------------------- */

function PreviewElement({ element }: { element: StakkedElement }) {
  const { scrollY } = useScroll();
  const staticY = useMotionValue(0);

  const parallaxEnabled = !!element.style.parallax?.enabled;
  const parallaxSpeed = element.style.parallax?.speed ?? 0;
  const parallaxDirection = element.style.parallax?.direction ?? 'vertical';

  // Build two transforms up-front so the hook order stays stable
  const yOffset = useTransform(scrollY, (v) =>
    parallaxEnabled && parallaxDirection === 'vertical' ? -v * parallaxSpeed : 0,
  );
  const xOffset = useTransform(scrollY, (v) =>
    parallaxEnabled && parallaxDirection === 'horizontal' ? -v * parallaxSpeed : 0,
  );

  const anim: Animation | undefined = element.animations?.[0];
  const [animTriggered, setAnimTriggered] = useState(false);

  const snap = element.style.scrollSection?.enabled
    ? {
        scrollSnapAlign:
          element.style.scrollSection.snapAlign !== 'none'
            ? element.style.scrollSection.snapAlign
            : undefined,
        scrollSnapStop: 'always' as const,
      }
    : {};

  // Build full CSS transform string — mirrors CanvasElement.buildWrapperStyle
  const tr = element.style.transform;
  const transformParts: string[] = [`rotate(${element.rotation ?? 0}deg)`];
  if (tr) {
    if ((tr.scaleX ?? 1) !== 1 || (tr.scaleY ?? 1) !== 1)
      transformParts.push(`scale(${tr.scaleX ?? 1}, ${tr.scaleY ?? 1})`);
    if (tr.skewX)      transformParts.push(`skewX(${tr.skewX}deg)`);
    if (tr.skewY)      transformParts.push(`skewY(${tr.skewY}deg)`);
    if (tr.translateX) transformParts.push(`translateX(${tr.translateX}px)`);
    if (tr.translateY) transformParts.push(`translateY(${tr.translateY}px)`);
    if (tr.rotateX)    transformParts.push(`rotateX(${tr.rotateX}deg)`);
    if (tr.rotateY)    transformParts.push(`rotateY(${tr.rotateY}deg)`);
  }

  const szStyle = element.style.size;
  const wMode = szStyle?.widthMode  ?? 'px';
  const hMode = szStyle?.heightMode ?? 'px';
  const rawW  = element.size.width;
  const rawH  = element.size.height;
  const cssW = wMode === 'auto' ? 'auto'
    : typeof rawW === 'number' ? `${rawW}${wMode}` : rawW;
  const cssH = hMode === 'auto' || rawH === 'auto' ? 'auto'
    : typeof rawH === 'number' ? `${rawH}${hMode}` : rawH;

  const baseStyle: CSSProperties = {
    position: 'absolute',
    left: element.position.x,
    top: element.position.y,
    width: cssW,
    height: cssH,
    transform: transformParts.join(' '),
    transformOrigin: tr?.origin ?? 'center',
    ...(tr?.perspective ? { perspective: `${tr.perspective}px` } : {}),
    zIndex: element.zIndex,
    ...snap,
    ...buildStaticStyle(element),
  };

  const motionProps = anim
    ? getMotionTriggerProps(anim, anim.trigger === 'onClick' ? animTriggered : false)
    : {};

  return (
    <motion.div
      style={{
        ...baseStyle,
        y: parallaxEnabled && parallaxDirection === 'vertical' ? yOffset : staticY,
        x: parallaxEnabled && parallaxDirection === 'horizontal' ? xOffset : 0,
      }}
      {...motionProps}
      onClick={anim?.trigger === 'onClick' ? () => setAnimTriggered(v => !v) : undefined}
    >
      <ContentRenderer element={element} />
    </motion.div>
  );
}

/* ------------------------------ content shim ------------------------------ */

function ContentRenderer({ element }: { element: StakkedElement }) {
  const { content } = element;
  // Must be called unconditionally before the switch (Rules of Hooks).
  const elementMap = useContext(ElementMapContext);

  switch (content.type) {
    case 'text':
      return (
        <div
          style={{ width: '100%', height: '100%', ...buildTypographyStyle(element) }}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(content.html) }}
        />
      );
    case 'image':
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={content.src}
          alt={content.alt || ''}
          style={{
            width: '100%',
            height: '100%',
            objectFit: (content.objectFit as React.CSSProperties['objectFit']) ?? 'cover',
            display: 'block',
          }}
        />
      );
    case 'button':
      return (
        <a
          href={content.url}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            textDecoration: 'none',
            color: element.style.typography?.color ?? '#fff',
            fontWeight: element.style.typography?.fontWeight ?? 600,
            fontFamily: element.style.typography?.fontFamily ?? 'inherit',
            fontSize: element.style.typography?.fontSize ?? 16,
          }}
        >
          {content.label}
        </a>
      );
    case 'divider':
      return <hr style={{ width: '100%', borderColor: content.color, margin: 0 }} />;
    case 'embed':
      return <div style={{ width: '100%', height: '100%' }} dangerouslySetInnerHTML={{ __html: sanitizeEmbedHtml(content.html) }} />;
    case 'video': {
      if (content.embedHtml) {
        return <div style={{ width: '100%', height: '100%' }} dangerouslySetInnerHTML={{ __html: sanitizeEmbedHtml(content.embedHtml) }} />;
      }
      if (!content.url) return <Placeholder label="video" />;
      const embedUrl = resolveVideoEmbedUrl(content.url, content.platform, content.autoplay, content.loop);
      if (embedUrl) {
        return (
          <iframe
            src={embedUrl}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
            title="video"
          />
        );
      }
      // Direct / fallback
      return (
        <video
          src={content.url}
          controls
          autoPlay={content.autoplay}
          loop={content.loop}
          muted={!!content.autoplay}
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      );
    }
    case 'music-player':
      return content.embedHtml ? (
        <div style={{ width: '100%', height: '100%' }} dangerouslySetInnerHTML={{ __html: sanitizeEmbedHtml(content.embedHtml) }} />
      ) : (
        <Placeholder label={`${content.platform} player`} />
      );
    case 'icon': {
      // Render via Iconify CDN web component. Cast to any to satisfy TS for custom element attrs.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const IconEl = 'iconify-icon' as any;
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
          <IconEl icon={content.name} style={{ fontSize: content.size ?? 24, color: content.color ?? 'currentColor' }} />
        </div>
      );
    }
    case 'shape':
      return <ShapeRenderer variant={content.variant} fill={content.fill} svg={content.svg} />;
    case 'gallery': {
      const imgs = content.images;
      const layout = content.layout || 'grid';
      const cols = content.columns || 3;
      if (layout === 'carousel') {
        return (
          <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
            <div style={{ display: 'flex', width: `${imgs.length * 100}%`, height: '100%', transition: 'transform .4s ease' }}>
              {imgs.map((img, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={`${img.src}-${i}`} src={img.src} alt={img.alt} style={{ width: `${100 / imgs.length}%`, height: '100%', objectFit: 'cover', flexShrink: 0 }} />
              ))}
            </div>
          </div>
        );
      }
      if (layout === 'strip') {
        return (
          <div style={{ display: 'flex', gap: 4, width: '100%', height: '100%', overflowX: 'auto' }}>
            {imgs.map((img, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={`${img.src}-${i}`} src={img.src} alt={img.alt} style={{ height: '100%', width: 'auto', flexShrink: 0, objectFit: 'cover' }} />
            ))}
          </div>
        );
      }
      if (layout === 'masonry') {
        return (
          <div style={{ columns: cols, gap: 8, width: '100%' }}>
            {imgs.map((img, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={`${img.src}-${i}`} src={img.src} alt={img.alt} style={{ width: '100%', marginBottom: 8, display: 'block' }} />
            ))}
          </div>
        );
      }
      if (layout === 'bento') {
        return (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gridAutoRows: '1fr', gap: 8, width: '100%', height: '100%' }}>
            {imgs.map((img, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={`${img.src}-${i}`} src={img.src} alt={img.alt} style={{ width: '100%', height: '100%', objectFit: 'cover', gridColumn: i === 0 ? 'span 2' : undefined }} />
            ))}
          </div>
        );
      }
      // default: grid
      return (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 8, width: '100%', height: '100%' }}>
          {imgs.map((img, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={`${img.src}-${i}`} src={img.src} alt={img.alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ))}
        </div>
      );
    }
    case 'social-link':
      return (
        <a
          href={content.url}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#fff', textTransform: 'capitalize', textDecoration: 'none' }}
        >
          {content.platform}
        </a>
      );
    case 'marquee':
      return <MarqueeRenderer items={content.items} speed={content.speed} direction={content.direction} />;
    case 'countdown':
      return <CountdownRenderer targetDate={content.targetDate} label={content.label} />;
    case 'testimonial':
      return (
        <blockquote style={{ padding: 16, margin: 0, color: '#fff' }}>
          <p style={{ fontStyle: 'italic', margin: 0 }}>&ldquo;{content.quote}&rdquo;</p>
          <footer style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
            — {content.author}
            {content.role && `, ${content.role}`}
          </footer>
        </blockquote>
      );
    case 'navigation':
      return (
        <nav style={{ display: 'flex', gap: 12, alignItems: 'center', width: '100%', height: '100%' }}>
          {content.links.map((l, i) => (
            <a key={`${l.href}-${i}`} href={l.href} style={{ color: '#fff', textDecoration: 'none' }}>
              {l.label}
            </a>
          ))}
        </nav>
      );
    case 'form':
      return <PreviewForm content={content} elementId={element.id} />;

    case 'map':
      return (
        <iframe
          title="map"
          src={`https://maps.google.com/maps?q=${content.lat},${content.lng}&z=${content.zoom}&output=embed`}
          style={{ width: '100%', height: '100%', border: 0 }}
        />
      );
    case 'accordion':
      return (
        <div style={{ width: '100%', height: '100%' }}>
          {content.sections.map((s, i) => (
            <details key={`${s.title}-${i}`} style={{ padding: 6 }}>
              <summary>{s.title}</summary>
              <div>{s.content}</div>
            </details>
          ))}
        </div>
      );
    case 'tabs':
      return <TabsRenderer tabs={content.tabs} />;
    case 'line': {
      const thickness = content.thickness ?? 2;
      const halfHt = thickness / 2 + 1;
      const w = typeof element.size.width === 'number' ? element.size.width : 320;
      const dashArray =
        content.style === 'dashed' ? `${thickness * 4},${thickness * 2}` :
        content.style === 'dotted' ? `${thickness},${thickness * 2}` : undefined;
      const hasArrows = content.arrows !== 'none';
      const pad = hasArrows ? thickness * 5 : 0;
      const lx1 = content.arrows === 'start' || content.arrows === 'both' ? pad : 0;
      const lx2 = content.arrows === 'end'   || content.arrows === 'both' ? w - pad : w;
      const arrowPath = `M0,0 L0,${thickness * 3} L${thickness * 3},${thickness * 1.5} z`;
      return (
        <svg width={w} height={thickness + 4} viewBox={`0 0 ${w} ${thickness + 4}`} style={{ display: 'block', overflow: 'visible' }}>
          {hasArrows && (
            <defs>
              <marker id={`ae-${element.id}`} markerWidth={thickness * 3} markerHeight={thickness * 3} refX={thickness * 2} refY={thickness * 1.5} orient="auto">
                <path d={arrowPath} fill={content.color} />
              </marker>
              <marker id={`as-${element.id}`} markerWidth={thickness * 3} markerHeight={thickness * 3} refX={thickness * 2} refY={thickness * 1.5} orient="auto-start-reverse">
                <path d={arrowPath} fill={content.color} />
              </marker>
            </defs>
          )}
          <line x1={lx1} y1={halfHt} x2={lx2} y2={halfHt}
            stroke={content.color} strokeWidth={thickness} strokeLinecap="round"
            strokeDasharray={dashArray}
            markerStart={content.arrows === 'start' || content.arrows === 'both' ? `url(#as-${element.id})` : undefined}
            markerEnd={content.arrows === 'end' || content.arrows === 'both' ? `url(#ae-${element.id})` : undefined}
            transform={content.angle !== 0 ? `rotate(${content.angle}, ${w / 2}, ${halfHt})` : undefined}
          />
        </svg>
      );
    }
    case 'drawing': {
      const paths = (content.paths ?? []) as Array<{ d: string; color: string; width: number; opacity: number }>;
      const dw = typeof element.size.width === 'number' ? element.size.width : 400;
      const dh = typeof element.size.height === 'number' ? element.size.height : 300;
      return (
        <svg width="100%" height="100%" viewBox={`0 0 ${dw} ${dh}`} style={{ display: 'block' }}>
          {paths.map((p, i) => (
            <path key={`path-${i}`} d={p.d} stroke={p.color} strokeWidth={p.width}
              strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={p.opacity} />
          ))}
        </svg>
      );
    }
    case 'container': {
      // Children are stored with canvas-absolute positions; convert to
      // container-relative by subtracting the container's own position.
      const containerX = element.position.x;
      const containerY = element.position.y;
      const childIds = (content as { children: string[] }).children;
      const children = childIds
        .map((id) => elementMap.get(id))
        .filter((child): child is StakkedElement => child !== undefined && child.visible !== false)
        .sort((a, b) => a.zIndex - b.zIndex)
        .map((child) => ({
          ...child,
          position: {
            x: child.position.x - containerX,
            y: child.position.y - containerY,
          },
        }));
      return (
        <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
          {children.map((child) => (
            <PreviewElement key={child.id} element={child} />
          ))}
        </div>
      );
    }
    default:
      return <Placeholder label="element" />;
  }
}

/* ---------------------------- helper sub-widgets --------------------------- */

function Placeholder({ label }: { label: string }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 11,
        color: 'rgba(255,255,255,0.5)',
        border: '1px dashed rgba(255,255,255,0.15)',
        borderRadius: 6,
      }}
    >
      {label}
    </div>
  );
}

function ShapeRenderer({ variant, fill, svg }: { variant: string; fill: string; svg?: string }) {
  if (svg) {
    return <div style={{ width: '100%', height: '100%', color: fill }} dangerouslySetInnerHTML={{ __html: sanitizeSvg(svg) }} />;
  }

  const svgStyle: CSSProperties = { width: '100%', height: '100%', display: 'block' };

  const poly = (points: string) => (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={svgStyle}>
      <polygon points={points} fill={fill} />
    </svg>
  );

  switch (variant) {
    case 'circle':
      return <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={svgStyle}><circle cx="50" cy="50" r="50" fill={fill} /></svg>;
    case 'triangle':
      return poly('50,0 100,100 0,100');
    case 'diamond':
      return poly('50,0 100,50 50,100 0,50');
    case 'star':
      return poly('50,2 61.8,33.8 95.6,35.2 69,56.2 78.2,88.8 50,70 21.8,88.8 31,56.2 4.4,35.2 38.2,33.8');
    case 'pentagon':
      return poly('50,2 95.6,35.2 78.2,88.8 21.8,88.8 4.4,35.2');
    case 'hexagon':
      return poly('50,2 91.6,26 91.6,74 50,98 8.4,74 8.4,26');
    case 'arrow-right':
      return poly('0,25 65,25 65,5 100,50 65,95 65,75 0,75');
    case 'arrow-left':
      return poly('100,25 35,25 35,5 0,50 35,95 35,75 100,75');
    case 'cross':
      return poly('35,0 65,0 65,35 100,35 100,65 65,65 65,100 35,100 35,65 0,65 0,35 35,35');
    case 'cloud':
      return (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={svgStyle}>
          <path d="M 25,80 Q 5,80 5,62 Q 5,48 18,45 Q 15,22 35,20 Q 45,5 62,15 Q 78,8 84,24 Q 98,26 96,45 Q 105,48 100,62 Q 100,80 80,80 Z" fill={fill} />
        </svg>
      );
    case 'ellipse':
      return <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={svgStyle}><ellipse cx="50" cy="50" rx="50" ry="30" fill={fill} /></svg>;
    default:
      return <div style={{ width: '100%', height: '100%', background: fill }} />;
  }
}

// Inject marquee keyframes once per document — not once per component instance
let marqueeStyleInjected = false;
function ensureMarqueeStyles() {
  if (marqueeStyleInjected || typeof document === 'undefined') return;
  marqueeStyleInjected = true;
  const el = document.createElement('style');
  el.id = 'stakked-marquee-keyframes';
  el.textContent = `
    @keyframes stakked-marquee-left  { from { transform: translateX(0);    } to { transform: translateX(-50%); } }
    @keyframes stakked-marquee-right { from { transform: translateX(-50%); } to { transform: translateX(0);    } }
  `;
  document.head.appendChild(el);
}

function MarqueeRenderer({ items, speed, direction }: { items: string[]; speed: number; direction: 'left' | 'right' }) {
  useEffect(() => { ensureMarqueeStyles(); }, []);
  const duration = Math.max(6, 60 / Math.max(speed, 1));
  const loop = [...items, ...items];
  return (
    <div style={{ overflow: 'hidden', width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
      <div
        style={{
          display: 'inline-flex',
          gap: 24,
          whiteSpace: 'nowrap',
          animation: `stakked-marquee-${direction} ${duration}s linear infinite`,
        }}
      >
        {loop.map((item, i) => (
          <span key={`${item}-${i}`} style={{ fontSize: 14, color: '#fff' }}>{item}</span>
        ))}
      </div>
    </div>
  );
}

function CountdownRenderer({ targetDate, label }: { targetDate: string; label: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const diff = Math.max(0, new Date(targetDate).getTime() - now);
  const d = Math.floor(diff / 86_400_000);
  const h = Math.floor((diff % 86_400_000) / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#fff' }}>
      <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 4 }}>{label}</div>
      <div style={{ fontVariantNumeric: 'tabular-nums', fontSize: 22, fontWeight: 700 }}>
        {d}d {pad(h)}:{pad(m)}:{pad(s)}
      </div>
    </div>
  );
}

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

function TabsRenderer({ tabs }: { tabs: { label: string; content: string }[] }) {
  const [i, setI] = useState(0);
  const safe = i < tabs.length ? i : 0;
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid rgba(255,255,255,0.15)', marginBottom: 6 }}>
        {tabs.map((t, idx) => (
          <button
            key={`${t.label}-${idx}`}
            onClick={() => setI(idx)}
            style={{
              padding: '6px 10px',
              border: 'none',
              background: 'transparent',
              color: idx === safe ? '#fff' : 'rgba(255,255,255,0.5)',
              borderBottom: idx === safe ? '2px solid #3b82f6' : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div style={{ color: '#fff', fontSize: 12 }}>{tabs[safe]?.content}</div>
    </div>
  );
}

/* ----------------------------- PreviewForm -------------------------------- */

function PreviewForm({ content, elementId }: { content: StakkedFormContent; elementId: string }) {
  const { projectId, ownerId } = useContext(ProjectMetaContext);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(content.fields.map((f) => [f.label, ''])),
  );
  // Re-sync when field definitions change (e.g. project hot-reload in preview)
  useEffect(() => {
    setValues(Object.fromEntries(content.fields.map((f) => [f.label, ''])));
  }, [content.fields]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // If a custom action URL is set, fall back to native browser form POST
    if (content.action && content.action.startsWith('http')) {
      (e.target as HTMLFormElement).submit();
      return;
    }
    setStatus('sending');
    try {
      const { supabase } = await import('@/lib/supabase');
      if (!supabase) throw new Error('Supabase not configured');
      const { error } = await supabase.from('form_submissions').insert({
        element_id: elementId,
        project_id: projectId || null,
        owner_id:   ownerId   || null,
        data: values,
        submitted_at: new Date().toISOString(),
      });
      if (error) throw error;
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#4ade80', fontWeight: 600 }}>
        ✓ Submitted!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', height: '100%', padding: 8, boxSizing: 'border-box' }}>
      {content.fields.map((f, i) => (
        <label key={`${f.label}-${i}`} style={{ display: 'flex', flexDirection: 'column', fontSize: 12, gap: 3 }}>
          <span>
            {f.label}
            {f.required && <span style={{ color: '#f87171', marginLeft: 2 }}>*</span>}
          </span>
          {f.fieldType === 'textarea' ? (
            <textarea
              name={f.label}
              required={f.required}
              rows={3}
              value={values[f.label] ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, [f.label]: e.target.value }))}
              style={{ padding: 6, borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.06)', color: 'inherit', resize: 'vertical' }}
            />
          ) : f.fieldType === 'checkbox' ? (
            <input
              type="checkbox"
              name={f.label}
              required={f.required}
              checked={values[f.label] === 'true'}
              onChange={(e) => setValues((v) => ({ ...v, [f.label]: String(e.target.checked) }))}
            />
          ) : (
            <input
              type={f.fieldType}
              name={f.label}
              required={f.required}
              value={values[f.label] ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, [f.label]: e.target.value }))}
              style={{ padding: 6, borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.06)', color: 'inherit' }}
            />
          )}
        </label>
      ))}
      {status === 'error' && <p style={{ color: '#f87171', fontSize: 11, margin: 0 }}>Submission failed. Please try again.</p>}
      <button
        type="submit"
        disabled={status === 'sending'}
        style={{ marginTop: 'auto', padding: '8px 16px', borderRadius: 8, border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 600, cursor: 'pointer', opacity: status === 'sending' ? 0.6 : 1 }}
      >
        {status === 'sending' ? 'Sending…' : 'Submit'}
      </button>
    </form>
  );
}

/* ---------------------- video embed URL resolver --------------------------- */

/**
 * Convert a share/watch URL for YouTube, Vimeo, or Loom into the
 * appropriate embed URL. Returns null for direct-file URLs.
 */
function resolveVideoEmbedUrl(
  url: string,
  platform: string,
  autoplay?: boolean,
  loop?: boolean,
): string | null {
  const auto = autoplay ? 1 : 0;
  const lp   = loop ? 1 : 0;

  if (platform === 'youtube' || /youtube\.com|youtu\.be/.test(url)) {
    // Extract video ID from various YouTube URL forms
    const m = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
    if (!m) return null;
    const vid = m[1];
    return `https://www.youtube.com/embed/${vid}?autoplay=${auto}&loop=${lp}&playlist=${vid}&mute=${auto}`;
  }

  if (platform === 'vimeo' || /vimeo\.com/.test(url)) {
    const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (!m) return null;
    return `https://player.vimeo.com/video/${m[1]}?autoplay=${auto}&loop=${lp}&muted=${auto}`;
  }

  if (platform === 'loom' || /loom\.com/.test(url)) {
    const m = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
    if (!m) return null;
    return `https://www.loom.com/embed/${m[1]}?autoplay=${auto}`;
  }

  if (platform === 'wistia' || /wistia\.com/.test(url)) {
    const m = url.match(/wistia\.com\/medias\/([a-zA-Z0-9]+)/);
    if (!m) return null;
    return `https://fast.wistia.net/embed/iframe/${m[1]}?autoPlay=${auto}&loop=${lp}`;
  }

  return null; // 'direct' platform or unrecognised — use <video> tag
}

/* ---------------------------- style resolvers ----------------------------- */

function buildStaticStyle(element: StakkedElement): CSSProperties {
  const s = element.style;
  const style: CSSProperties = {
    opacity: s.effects?.opacity ?? 1,
    overflow: (s.effects?.overflow as CSSProperties['overflow']) ?? 'visible',
    cursor: (s.effects?.cursor as CSSProperties['cursor']) ?? 'default',
  };

  // Border radius — include unit
  if (s.borderRadius) {
    const u = s.borderRadius.unit ?? 'px';
    style.borderTopLeftRadius = `${s.borderRadius.topLeft}${u}`;
    style.borderTopRightRadius = `${s.borderRadius.topRight}${u}`;
    style.borderBottomRightRadius = `${s.borderRadius.bottomRight}${u}`;
    style.borderBottomLeftRadius = `${s.borderRadius.bottomLeft}${u}`;
  }

  // Fill
  const fill = s.fills?.[0];
  if (fill) {
    if (fill.type === 'color') {
      style.backgroundColor = fill.value;
    } else if (fill.type === 'gradient') {
      style.backgroundImage = fill.value;
    } else if (fill.type === 'pattern') {
      style.background = fill.value;
    } else if (fill.type === 'image' && fill.value) {
      style.backgroundImage = `url(${fill.value})`;
      style.backgroundSize = (fill as { fit?: string }).fit ?? 'cover';
      style.backgroundPosition = 'center';
      style.backgroundRepeat = 'no-repeat';
    }
  }

  // Box shadows
  if (s.effects?.shadows?.length) {
    style.boxShadow = s.effects.shadows
      .map((sh) => `${sh.type === 'inner' ? 'inset ' : ''}${sh.x}px ${sh.y}px ${sh.blur}px ${sh.spread}px ${sh.color}`)
      .join(', ');
  }

  // Backdrop filter
  if (s.effects?.backdropFilter) {
    style.backdropFilter = s.effects.backdropFilter;
    (style as Record<string, unknown>).WebkitBackdropFilter = s.effects.backdropFilter;
  }

  // Borders
  const border = s.border;
  if (border) {
    if (border.linked) {
      const b = border.top;
      if (b.width > 0 && b.style !== 'none') {
        style.border = `${b.width}px ${b.style} ${b.color}`;
      }
    } else {
      const mk = (b: typeof border.top) =>
        b.width > 0 && b.style !== 'none' ? `${b.width}px ${b.style} ${b.color}` : undefined;
      const bt = mk(border.top);
      const br2 = mk(border.right);
      const bb = mk(border.bottom);
      const bl = mk(border.left);
      if (bt) style.borderTop = bt;
      if (br2) style.borderRight = br2;
      if (bb) style.borderBottom = bb;
      if (bl) style.borderLeft = bl;
    }
  }

  return style;
}

function buildTypographyStyle(element: StakkedElement): CSSProperties {
  const t = element.style.typography;
  if (!t) return {};
  return {
    ...(t.fontFamily && { fontFamily: t.fontFamily }),
    ...(t.fontSize != null && { fontSize: `${t.fontSize}px` }),
    ...(t.fontWeight && { fontWeight: t.fontWeight }),
    ...(t.fontStyle && { fontStyle: t.fontStyle }),
    ...(t.color && { color: t.color }),
    ...(t.textAlign && { textAlign: t.textAlign as CSSProperties['textAlign'] }),
    ...(t.textDecoration && { textDecoration: t.textDecoration }),
    ...(t.textTransform && { textTransform: t.textTransform as CSSProperties['textTransform'] }),
    ...(t.lineHeight != null && { lineHeight: t.lineHeight }),
    ...(t.letterSpacing != null && { letterSpacing: `${t.letterSpacing}px` }),
    ...(t.wordSpacing != null && { wordSpacing: `${t.wordSpacing}px` }),
  };
}

function resolveBackground(page: StakkedPage): string {
  const bg = page.canvas.background;
  if (!bg) return '#0a0a0a';
  switch (bg.type) {
    case 'color': return bg.value;
    case 'gradient': return bg.value;
    case 'image': return `url(${bg.value}) center/${bg.fit} no-repeat`;
    case 'pattern': return bg.value;
    default: return '#0a0a0a';
  }
}
