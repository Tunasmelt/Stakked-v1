'use client';

import React from 'react';
import { useProjectStore } from '@/stores/project-store';
import { StakkedElement, ElementContent, StakkedGalleryContent, StakkedShapeContent, StakkedLineContent, StakkedDrawingContent, StakkedVideoContent, StakkedTableContent, StakkedProgressContent, StakkedCountdownContent, StakkedCodeContent } from '@/types/element';

/** Convert a video page URL + platform into an embed iframe HTML string. */
function urlToEmbedHtml(platform: string, url: string, autoplay: boolean, loop: boolean): string {
  if (!url) return '';
  try {
    const ap = autoplay ? '&autoplay=1&mute=1' : '';
    const lp = loop ? '&loop=1' : '';
    if (platform === 'youtube') {
      const m = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/);
      if (m) return `<iframe src="https://www.youtube.com/embed/${m[1]}?rel=0${ap}${lp}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width:100%;height:100%;display:block;"></iframe>`;
    }
    if (platform === 'vimeo') {
      const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
      if (m) return `<iframe src="https://player.vimeo.com/video/${m[1]}?${autoplay ? 'autoplay=1&muted=1&' : ''}${loop ? 'loop=1&' : ''}" frameborder="0" allowfullscreen style="width:100%;height:100%;display:block;"></iframe>`;
    }
    if (platform === 'loom') {
      const m = url.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/);
      if (m) return `<iframe src="https://www.loom.com/embed/${m[1]}" frameborder="0" allowfullscreen style="width:100%;height:100%;display:block;"></iframe>`;
    }
    if (platform === 'wistia') {
      const m = url.match(/wistia\.com\/(?:medias|embed\/iframe)\/([a-zA-Z0-9]+)/);
      if (m) return `<iframe src="https://fast.wistia.net/embed/iframe/${m[1]}" frameborder="0" allowfullscreen style="width:100%;height:100%;display:block;"></iframe>`;
    }
  } catch { /* ignore */ }
  return '';
}
import { Select, NumberInput, Slider, Toggle, ColorPicker } from '@/components/ui/Primitives';
import { Plus, Trash2 } from 'lucide-react';
import styles from '@/styles/PropertiesPanel.module.css';

const SHAPE_VARIANTS = [
  { id: 'rect',          label: 'Rect' },
  { id: 'circle',        label: 'Circle' },
  { id: 'ellipse',       label: 'Ellipse' },
  { id: 'oval',          label: 'Oval' },
  { id: 'triangle',      label: 'Triangle' },
  { id: 'diamond',       label: 'Diamond' },
  { id: 'rhombus',       label: 'Rhombus' },
  { id: 'trapezoid',     label: 'Trapezoid' },
  { id: 'parallelogram', label: 'Para...' },
  { id: 'pentagon',      label: 'Pentagon' },
  { id: 'hexagon',       label: 'Hexagon' },
  { id: 'octagon',       label: 'Octagon' },
  { id: 'star',          label: 'Star' },
  { id: 'heart',         label: 'Heart' },
  { id: 'cloud',         label: 'Cloud' },
  { id: 'lightning',     label: 'Lightning' },
  { id: 'arrow-right',   label: '→' },
  { id: 'arrow-left',    label: '←' },
  { id: 'arrow-up',      label: '↑' },
  { id: 'arrow-down',    label: '↓' },
  { id: 'cross',         label: 'Cross' },
  { id: 'check',         label: 'Check' },
  { id: 'x-box',         label: 'X-Box' },
  { id: 'badge',         label: 'Badge' },
];

/** Renders a tiny SVG preview for a given shape variant and fill colour. */
function ShapePreview({ variant, fill }: { variant: string; fill: string }) {
  const f = fill;
  const renderInner = () => {
    switch (variant) {
      case 'circle':        return <circle cx="50" cy="50" r="50" fill={f} />;
      case 'triangle':      return <polygon points="50,0 100,100 0,100" fill={f} />;
      case 'diamond':       return <polygon points="50,0 100,50 50,100 0,50" fill={f} />;
      case 'star':          return <polygon points="50,2 61.8,33.8 95.6,35.2 69,56.2 78.2,88.8 50,70 21.8,88.8 31,56.2 4.4,35.2 38.2,33.8" fill={f} />;
      case 'pentagon':      return <polygon points="50,2 95.6,35.2 78.2,88.8 21.8,88.8 4.4,35.2" fill={f} />;
      case 'hexagon':       return <polygon points="50,2 91.6,26 91.6,74 50,98 8.4,74 8.4,26" fill={f} />;
      case 'arrow-right':   return <polygon points="0,25 65,25 65,5 100,50 65,95 65,75 0,75" fill={f} />;
      case 'arrow-left':    return <polygon points="100,25 35,25 35,5 0,50 35,95 35,75 100,75" fill={f} />;
      case 'cross':         return <polygon points="35,0 65,0 65,35 100,35 100,65 65,65 65,100 35,100 35,65 0,65 0,35 35,35" fill={f} />;
      case 'cloud':         return <path d="M 25,80 Q 5,80 5,62 Q 5,48 18,45 Q 15,22 35,20 Q 45,5 62,15 Q 78,8 84,24 Q 98,26 96,45 Q 105,48 100,62 Q 100,80 80,80 Z" fill={f} />;
      case 'ellipse':       return <ellipse cx="50" cy="50" rx="50" ry="30" fill={f} />;
      case 'oval':          return <ellipse cx="50" cy="50" rx="48" ry="30" fill={f} />;
      case 'rhombus':       return <polygon points="50,5 95,50 50,95 5,50" fill={f} />;
      case 'trapezoid':     return <polygon points="20,80 80,80 95,20 5,20" fill={f} />;
      case 'parallelogram': return <polygon points="25,80 100,80 75,20 0,20" fill={f} />;
      case 'arrow-up':      return <polygon points="50,5 95,65 70,65 70,95 30,95 30,65 5,65" fill={f} />;
      case 'arrow-down':    return <polygon points="50,95 5,35 30,35 30,5 70,5 70,35 95,35" fill={f} />;
      case 'octagon':       return <polygon points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30" fill={f} />;
      case 'heart':         return <path d="M50,85 C10,60 0,40 0,28 C0,12 12,2 25,2 C35,2 45,8 50,18 C55,8 65,2 75,2 C88,2 100,12 100,28 C100,40 90,60 50,85 Z" fill={f} />;
      case 'lightning':     return <polygon points="60,2 25,55 48,55 40,98 75,45 52,45" fill={f} />;
      case 'check':         return <path d="M10,50 L35,78 L90,20" fill="none" stroke={f} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />;
      case 'x-box':         return <><rect width="100" height="100" rx="8" fill={f} /><line x1="22" y1="22" x2="78" y2="78" stroke="white" strokeWidth="12" strokeLinecap="round" /><line x1="78" y1="22" x2="22" y2="78" stroke="white" strokeWidth="12" strokeLinecap="round" /></>;
      case 'badge':         return <path d="M10,20 Q10,5 25,5 L75,5 Q90,5 90,20 L90,68 Q90,78 80,83 L55,95 Q50,98 45,95 L20,83 Q10,78 10,68 Z" fill={f} />;
      case 'rect':
      default:              return <rect width="100" height="100" fill={f} />;
    }
  };
  return (
    <svg viewBox="0 0 100 100" style={{ width: 28, height: 28, display: 'block', overflow: 'visible' }}>
      {renderInner()}
    </svg>
  );
}

const GALLERY_LAYOUTS = [
  { label: 'Grid',     value: 'grid' },
  { label: 'Masonry',  value: 'masonry' },
  { label: 'Bento',    value: 'bento' },
  { label: 'Carousel', value: 'carousel' },
  { label: 'Strip',    value: 'strip' },
];


export default function ContentSection({ element, pageIndex }: { element: StakkedElement; pageIndex: number }) {
  const updateElement = useProjectStore((s) => s.updateElement);
  const updateContent = (updates: Partial<ElementContent>) => {
    updateElement(pageIndex, element.id, {
      content: { ...element.content, ...updates } as ElementContent,
    });
  };

  const c = element.content;

  // ── Text ────────────────────────────────────────────────────────────────────
  if (c.type === 'text') {
    return (
      <div className={styles.sectionInner}>
        <p style={{ fontSize: 10, color: 'var(--text-mute)', margin: 0 }}>
          Double-click the element on canvas to edit text directly with the rich-text editor.
        </p>
      </div>
    );
  }

  // ── Image ───────────────────────────────────────────────────────────────────
  if (c.type === 'image') {
    return (
      <div className={styles.sectionInner}>
        <div className={styles.inputWrapper}>
          <label className={styles.label}>Image URL</label>
          <div className={styles.numberInput}>
            <input
              type="url"
              value={c.src}
              placeholder="https://..."
              onChange={e => updateContent({ src: e.target.value })}
            />
          </div>
        </div>
        <div className={styles.inputWrapper}>
          <label className={styles.label}>Alt Text</label>
          <div className={styles.numberInput}>
            <input type="text" value={c.alt} onChange={e => updateContent({ alt: e.target.value })} />
          </div>
        </div>
        <Select
          label="Object Fit"
          value={c.objectFit}
          options={[
            { label: 'Cover', value: 'cover' },
            { label: 'Contain', value: 'contain' },
            { label: 'Fill', value: 'fill' },
            { label: 'None', value: 'none' },
          ]}
          onChange={v => updateContent({ objectFit: v })}
        />
        {c.src && (
          <img
            src={c.src}
            alt="preview"
            style={{ width: '100%', borderRadius: 6, marginTop: 6, objectFit: 'cover', maxHeight: 80 }}
          />
        )}
      </div>
    );
  }

  // ── Button ──────────────────────────────────────────────────────────────────
  if (c.type === 'button') {
    return (
      <div className={styles.sectionInner}>
        <div className={styles.inputWrapper}>
          <label className={styles.label}>Label</label>
          <div className={styles.numberInput}>
            <input type="text" value={c.label} onChange={e => updateContent({ label: e.target.value })} />
          </div>
        </div>
        <div className={styles.inputWrapper}>
          <label className={styles.label}>URL / Href</label>
          <div className={styles.numberInput}>
            <input type="url" value={c.url} placeholder="https://" onChange={e => updateContent({ url: e.target.value })} />
          </div>
        </div>
        <Select
          label="Variant"
          value={c.variant}
          options={[
            { label: 'Filled', value: 'filled' },
            { label: 'Outlined', value: 'outlined' },
            { label: 'Ghost', value: 'ghost' },
            { label: 'Link', value: 'link' },
          ]}
          onChange={v => updateContent({ variant: v })}
        />
      </div>
    );
  }

  // ── Shape ───────────────────────────────────────────────────────────────────
  if (c.type === 'shape') {
    return (
      <div className={styles.sectionInner}>
        <div className={styles.inputWrapper}>
          <label className={styles.label}>Shape</label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 4,
          }}>
            {SHAPE_VARIANTS.map(({ id, label }) => {
              const isActive = c.variant === id;
              return (
                <button
                  key={id}
                  title={label}
                  onClick={() => updateContent({ variant: id } as Partial<StakkedShapeContent>)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 3,
                    width: '100%',
                    aspectRatio: '1',
                    minHeight: 52,
                    background: isActive
                      ? 'color-mix(in oklab, var(--accent) 15%, var(--surface))'
                      : 'var(--surface)',
                    border: isActive
                      ? '2px solid var(--accent)'
                      : '1px solid var(--line)',
                    borderRadius: 6,
                    cursor: 'pointer',
                    padding: 4,
                    transition: 'border-color 120ms, background 120ms',
                  }}
                >
                  <ShapePreview variant={id} fill={isActive ? 'var(--accent)' : 'var(--text-mute)'} />
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 8,
                    color: isActive ? 'var(--accent)' : 'var(--text-mute)',
                    textAlign: 'center',
                    lineHeight: 1.1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '100%',
                  }}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <div className={styles.inputWrapper}>
          <label className={styles.label}>Fill Colour</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="color"
              value={c.fill.startsWith('rgba') ? '#3b82f6' : c.fill}
              onChange={e => updateContent({ fill: e.target.value } as Partial<StakkedShapeContent>)}
              style={{ width: 30, height: 26, border: 0, borderRadius: 4, cursor: 'pointer' }}
            />
            <div className={styles.numberInput} style={{ flex: 1 }}>
              <input type="text" value={c.fill} onChange={e => updateContent({ fill: e.target.value } as Partial<StakkedShapeContent>)} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Line ────────────────────────────────────────────────────────────────────
  if (c.type === 'line') {
    return (
      <div className={styles.sectionInner}>
        <div className={styles.inputWrapper}>
          <label className={styles.label}>Colour</label>
          <div style={{ display: 'flex', gap: 6 }}>
            <input type="color" value={c.color} onChange={e => updateContent({ color: e.target.value } as Partial<StakkedLineContent>)} style={{ width: 30, height: 26, border: 0, borderRadius: 4 }} />
            <div className={styles.numberInput} style={{ flex: 1 }}>
              <input type="text" value={c.color} onChange={e => updateContent({ color: e.target.value } as Partial<StakkedLineContent>)} />
            </div>
          </div>
        </div>
        <NumberInput label="Thickness (px)" value={c.thickness} min={1} max={40} onChange={v => updateContent({ thickness: v } as Partial<StakkedLineContent>)} />
        <NumberInput label="Angle (°)" value={c.angle} min={-180} max={180} onChange={v => updateContent({ angle: v } as Partial<StakkedLineContent>)} />
        <Select
          label="Line Style"
          value={c.style}
          options={[
            { label: 'Solid',  value: 'solid' },
            { label: 'Dashed', value: 'dashed' },
            { label: 'Dotted', value: 'dotted' },
          ]}
          onChange={v => updateContent({ style: v } as Partial<StakkedLineContent>)}
        />
        <Select
          label="Arrows"
          value={c.arrows}
          options={[
            { label: 'None',  value: 'none' },
            { label: 'End →', value: 'end' },
            { label: '← Start', value: 'start' },
            { label: '← Both →', value: 'both' },
          ]}
          onChange={v => updateContent({ arrows: v } as Partial<StakkedLineContent>)}
        />
      </div>
    );
  }

  // ── Drawing ─────────────────────────────────────────────────────────────────
  if (c.type === 'drawing') {
    const paths = c.paths || [];
    return (
      <div className={styles.sectionInner}>
        <p style={{ fontSize: 10, color: 'var(--text-mute)', margin: 0 }}>
          {paths.length === 0
            ? 'Double-click the drawing element on canvas to start drawing.'
            : `${paths.length} path${paths.length !== 1 ? 's' : ''}. Double-click to edit.`}
        </p>
        {paths.length > 0 && (
          <button
            style={{ marginTop: 8, fontSize: 10, color: 'var(--danger)', background: 'none', border: '1px solid var(--danger)', borderRadius: 4, padding: '3px 8px', cursor: 'pointer' }}
            onClick={() => updateContent({ paths: [] } as Partial<StakkedDrawingContent>)}
          >
            Clear all paths
          </button>
        )}
      </div>
    );
  }

  // ── Video ────────────────────────────────────────────────────────────────────
  if (c.type === 'video') {
    const updateVideo = (patch: Partial<StakkedVideoContent>) => {
      const next = { ...c, ...patch };
      // Auto-generate embed HTML whenever platform, url, autoplay, or loop changes
      if (next.platform !== 'direct') {
        const html = urlToEmbedHtml(next.platform, next.url, next.autoplay, next.loop);
        if (html) next.embedHtml = html;
      }
      updateContent(next as Partial<ElementContent>);
    };

    return (
      <div className={styles.sectionInner}>
        <Select
          label="Platform"
          value={c.platform}
          options={[
            { label: 'YouTube',  value: 'youtube' },
            { label: 'Vimeo',    value: 'vimeo' },
            { label: 'Loom',     value: 'loom' },
            { label: 'Wistia',   value: 'wistia' },
            { label: 'Direct',   value: 'direct' },
          ]}
          onChange={v => updateVideo({ platform: v })}
        />
        <div className={styles.inputWrapper}>
          <label className={styles.label}>Video URL</label>
          <div className={styles.numberInput}>
            <input
              type="url"
              value={c.url}
              placeholder={c.platform === 'direct' ? 'https://example.com/video.mp4' : 'https://youtube.com/watch?v=...'}
              onChange={e => updateVideo({ url: e.target.value })}
            />
          </div>
        </div>
        <div className={styles.grid2}>
          <Select
            label="Autoplay"
            value={c.autoplay ? 'yes' : 'no'}
            options={[{ label: 'Yes (Muted)', value: 'yes' }, { label: 'No', value: 'no' }]}
            onChange={v => updateVideo({ autoplay: v === 'yes' })}
          />
          <Select
            label="Loop"
            value={c.loop ? 'yes' : 'no'}
            options={[{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }]}
            onChange={v => updateVideo({ loop: v === 'yes' })}
          />
        </div>
        {c.embedHtml && (
          <p style={{ fontSize: 10, color: 'var(--ok, #22c55e)', margin: '4px 0 0', fontFamily: 'var(--font-mono)' }}>
            ✓ embed ready
          </p>
        )}
        {!c.embedHtml && c.url && c.platform !== 'direct' && (
          <p style={{ fontSize: 10, color: 'var(--warn, #f59e0b)', margin: '4px 0 0', fontFamily: 'var(--font-mono)' }}>
            URL not recognized — check format
          </p>
        )}
      </div>
    );
  }

  // ── Divider ──────────────────────────────────────────────────────────────────
  if (c.type === 'divider') {
    return (
      <div className={styles.sectionInner}>
        <Select
          label="Style"
          value={c.variant}
          options={[
            { label: 'Solid',  value: 'solid' },
            { label: 'Dashed', value: 'dashed' },
            { label: 'Dotted', value: 'dotted' },
            { label: 'Double', value: 'double' },
            { label: 'Gradient Fade', value: 'gradient-fade' },
          ]}
          onChange={v => updateContent({ variant: v })}
        />
        <div className={styles.inputWrapper}>
          <label className={styles.label}>Colour</label>
          <div style={{ display: 'flex', gap: 6 }}>
            <input type="color" value={c.color} onChange={e => updateContent({ color: e.target.value })} style={{ width: 30, height: 26, border: 0, borderRadius: 4 }} />
            <div className={styles.numberInput} style={{ flex: 1 }}>
              <input type="text" value={c.color} onChange={e => updateContent({ color: e.target.value })} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Embed ────────────────────────────────────────────────────────────────────
  if (c.type === 'embed') {
    return (
      <div className={styles.sectionInner}>
        <div className={styles.inputWrapper}>
          <label className={styles.label}>Raw HTML / iframe</label>
          <textarea
            className={styles.input}
            style={{ height: 120, resize: 'vertical', width: '100%', fontFamily: 'var(--font-mono)', fontSize: 10 }}
            value={c.html}
            onChange={e => updateContent({ html: e.target.value })}
          />
        </div>
      </div>
    );
  }

  // ── Gallery ──────────────────────────────────────────────────────────────────
  if (c.type === 'gallery') {
    const images = c.images ?? [];
    return (
      <div className={styles.sectionInner}>
        <div className={styles.grid2}>
          <Select label="Layout" value={c.layout} options={GALLERY_LAYOUTS} onChange={v => updateContent({ layout: v } as Partial<StakkedGalleryContent>)} />
          <NumberInput label="Columns" value={c.columns} min={1} max={6} onChange={v => updateContent({ columns: v } as Partial<StakkedGalleryContent>)} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 4 }}>
          <label className={styles.label} style={{ margin: 0 }}>Images ({images.length})</label>
          <button
            style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'var(--accent)', background: 'none', border: '1px solid var(--accent)', borderRadius: 4, padding: '2px 6px', cursor: 'pointer' }}
            onClick={() => updateContent({ images: [...images, { src: 'https://picsum.photos/seed/' + Date.now() + '/300/300', alt: 'Image' }] } as Partial<StakkedGalleryContent>)}
          >
            <Plus size={10} /> Add
          </button>
        </div>
        {images.map((img, i) => (
          <div key={`${img.src}-${i}`} style={{ display: 'flex', gap: 4, marginBottom: 4, alignItems: 'center' }}>
            <div className={styles.numberInput} style={{ flex: 1 }}>
              <input type="url" placeholder="https://..." value={img.src} onChange={e => {
                const next = [...images]; next[i] = { ...img, src: e.target.value };
                updateContent({ images: next } as Partial<StakkedGalleryContent>);
              }} />
            </div>
            <button onClick={() => updateContent({ images: images.filter((_, j) => j !== i) } as Partial<StakkedGalleryContent>)} style={{ color: 'var(--danger)', background: 'none', border: 0, cursor: 'pointer', padding: 3 }}>
              <Trash2 size={11} />
            </button>
          </div>
        ))}
      </div>
    );
  }

  // ── Icon ─────────────────────────────────────────────────────────────────────
  if (c.type === 'icon') {
    return (
      <div className={styles.sectionInner}>
        <div className={styles.inputWrapper}>
          <label className={styles.label}>Icon Name</label>
          <div className={styles.numberInput}>
            <input type="text" value={c.name} placeholder="Star, Heart, Music..." onChange={e => updateContent({ name: e.target.value })} />
          </div>
        </div>
        <Select
          label="Icon Set"
          value={c.set}
          options={[
            { label: 'Lucide',       value: 'lucide' },
            { label: 'Simple Icons', value: 'simple-icons' },
            { label: 'Material',     value: 'mdi' },
            { label: 'Phosphor',     value: 'ph' },
            { label: 'Tabler',       value: 'tabler' },
          ]}
          onChange={v => updateContent({ set: v })}
        />
        <div className={styles.inputWrapper}>
          <label className={styles.label}>Colour</label>
          <div style={{ display: 'flex', gap: 6 }}>
            <input type="color" value={c.color.startsWith('#') ? c.color : '#ffffff'} onChange={e => updateContent({ color: e.target.value })} style={{ width: 30, height: 26, border: 0, borderRadius: 4 }} />
            <div className={styles.numberInput} style={{ flex: 1 }}>
              <input type="text" value={c.color} onChange={e => updateContent({ color: e.target.value })} />
            </div>
          </div>
        </div>
        <NumberInput label="Size (px)" value={c.size} min={12} max={256} onChange={v => updateContent({ size: v })} />
      </div>
    );
  }

  // ── Table ───────────────────────────────────────────────────────────────────
  if (c.type === 'table') {
    return (
      <div className={styles.sectionInner}>
        <div className={styles.grid2}>
          <NumberInput
            label="Rows"
            value={c.rows}
            min={1}
            max={20}
            onChange={v => {
              const newData = Array.from({ length: v }, (_, ri) =>
                Array.from({ length: c.cols }, (__, ci) => c.data[ri]?.[ci] ?? '')
              );
              updateContent({ rows: v, data: newData } as Partial<StakkedTableContent>);
            }}
          />
          <NumberInput
            label="Cols"
            value={c.cols}
            min={1}
            max={10}
            onChange={v => {
              const newHeaders = Array.from({ length: v }, (_, i) => c.headers[i] ?? `Col ${i + 1}`);
              const newData = c.data.map(row =>
                Array.from({ length: v }, (_, i) => row[i] ?? '')
              );
              updateContent({ cols: v, headers: newHeaders, data: newData } as Partial<StakkedTableContent>);
            }}
          />
        </div>
        <div className={styles.inputWrapper}>
          <label className={styles.label}>Column Headers</label>
          {c.headers.map((h, i) => (
            <div key={i} className={styles.numberInput} style={{ marginBottom: 2 }}>
              <input
                type="text"
                value={h}
                placeholder={`Header ${i + 1}`}
                onChange={e => {
                  const next = [...c.headers];
                  next[i] = e.target.value;
                  updateContent({ headers: next } as Partial<StakkedTableContent>);
                }}
              />
            </div>
          ))}
        </div>
        <div className={styles.grid2}>
          <Toggle
            label="Striped"
            checked={c.striped}
            onChange={v => updateContent({ striped: v } as Partial<StakkedTableContent>)}
          />
          <Toggle
            label="Bordered"
            checked={c.bordered}
            onChange={v => updateContent({ bordered: v } as Partial<StakkedTableContent>)}
          />
        </div>
      </div>
    );
  }

  // ── Progress ─────────────────────────────────────────────────────────────────
  if (c.type === 'progress') {
    return (
      <div className={styles.sectionInner}>
        <Slider
          label="Value"
          value={c.value}
          min={0}
          max={100}
          step={1}
          formatValue={v => `${Math.round(v)}%`}
          onChange={v => updateContent({ value: v } as Partial<StakkedProgressContent>)}
        />
        <div className={styles.inputWrapper}>
          <label className={styles.label}>Label</label>
          <div className={styles.numberInput}>
            <input
              type="text"
              value={c.label}
              placeholder="Progress"
              onChange={e => updateContent({ label: e.target.value } as Partial<StakkedProgressContent>)}
            />
          </div>
        </div>
        <Select
          label="Style"
          value={c.style}
          options={[
            { label: 'Bar',    value: 'bar' },
            { label: 'Circle', value: 'circle' },
          ]}
          onChange={v => updateContent({ style: v as 'bar' | 'circle' } as Partial<StakkedProgressContent>)}
        />
        <ColorPicker
          label="Bar Color"
          value={c.barColor}
          onChange={v => updateContent({ barColor: v } as Partial<StakkedProgressContent>)}
        />
        <ColorPicker
          label="Track Color"
          value={c.trackColor}
          onChange={v => updateContent({ trackColor: v } as Partial<StakkedProgressContent>)}
        />
        <div className={styles.grid2}>
          <Toggle
            label="Show Value"
            checked={c.showValue}
            onChange={v => updateContent({ showValue: v } as Partial<StakkedProgressContent>)}
          />
          <Toggle
            label="Animated"
            checked={c.animated}
            onChange={v => updateContent({ animated: v } as Partial<StakkedProgressContent>)}
          />
        </div>
        <Toggle
          label="Rounded"
          checked={c.rounded}
          onChange={v => updateContent({ rounded: v } as Partial<StakkedProgressContent>)}
        />
      </div>
    );
  }

  // ── Countdown ────────────────────────────────────────────────────────────────
  if (c.type === 'countdown') {
    return (
      <div className={styles.sectionInner}>
        <div className={styles.inputWrapper}>
          <label className={styles.label}>Target Date</label>
          <div className={styles.numberInput}>
            <input
              type="datetime-local"
              value={c.targetDate ? c.targetDate.slice(0, 16) : ''}
              onChange={e => updateContent({ targetDate: new Date(e.target.value).toISOString() } as Partial<StakkedCountdownContent>)}
              style={{ colorScheme: 'dark' }}
            />
          </div>
        </div>
        <div className={styles.inputWrapper}>
          <label className={styles.label}>Label</label>
          <div className={styles.numberInput}>
            <input
              type="text"
              value={c.label}
              placeholder="Until Launch"
              onChange={e => updateContent({ label: e.target.value } as Partial<StakkedCountdownContent>)}
            />
          </div>
        </div>
        <Select
          label="Format"
          value={c.format}
          options={[
            { label: 'Days · Hours · Mins · Secs', value: 'dhms' },
            { label: 'Hours · Mins · Secs',        value: 'hms' },
            { label: 'Mins · Secs',                value: 'ms' },
          ]}
          onChange={v => updateContent({ format: v as 'dhms' | 'hms' | 'ms' } as Partial<StakkedCountdownContent>)}
        />
        <Toggle
          label="Show Labels"
          checked={c.showLabels}
          onChange={v => updateContent({ showLabels: v } as Partial<StakkedCountdownContent>)}
        />
      </div>
    );
  }

  // ── Code ─────────────────────────────────────────────────────────────────────
  if (c.type === 'code') {
    const LANGUAGES = [
      'javascript','typescript','jsx','tsx','html','css','scss',
      'python','rust','go','java','c','cpp','csharp','php','ruby',
      'swift','kotlin','bash','json','yaml','sql','graphql','markdown',
    ];
    return (
      <div className={styles.sectionInner}>
        <div className={styles.inputWrapper}>
          <label className={styles.label}>Code</label>
          <textarea
            className={styles.input}
            style={{ height: 120, resize: 'vertical', width: '100%', fontFamily: 'var(--font-mono)', fontSize: 10 }}
            value={c.code}
            onChange={e => updateContent({ code: e.target.value } as Partial<StakkedCodeContent>)}
            spellCheck={false}
          />
        </div>
        <Select
          label="Language"
          value={c.language}
          options={LANGUAGES.map(l => ({ label: l, value: l }))}
          onChange={v => updateContent({ language: v } as Partial<StakkedCodeContent>)}
        />
        <Select
          label="Theme"
          value={c.theme}
          options={[
            { label: 'Dark',  value: 'dark' },
            { label: 'Light', value: 'light' },
          ]}
          onChange={v => updateContent({ theme: v as 'dark' | 'light' } as Partial<StakkedCodeContent>)}
        />
        <div className={styles.grid2}>
          <Toggle
            label="Line Nums"
            checked={c.showLineNumbers}
            onChange={v => updateContent({ showLineNumbers: v } as Partial<StakkedCodeContent>)}
          />
          <Toggle
            label="Copy Btn"
            checked={c.showCopyButton}
            onChange={v => updateContent({ showCopyButton: v } as Partial<StakkedCodeContent>)}
          />
        </div>
      </div>
    );
  }

  // ── Container / Group ────────────────────────────────────────────────────────
  if (c.type === 'container') {
    return (
      <div className={styles.sectionInner}>
        <Select
          label="Layout"
          value={(c as { layoutType?: string }).layoutType ?? 'free'}
          options={[
            { label: 'Free (Absolute)', value: 'free' },
            { label: 'Stack (Column)', value: 'stack' },
            { label: 'Grid',           value: 'grid' },
          ]}
          onChange={v => updateContent({ layoutType: v } as Partial<ElementContent>)}
        />
        <p style={{ fontSize: 10, color: 'var(--text-mute)', margin: '6px 0 0' }}>
          {((c as { children?: string[] }).children ?? []).length} child element(s). Drag elements onto this container on the canvas to add them.
        </p>
      </div>
    );
  }

  // ── Fallback ──────────────────────────────────────────────────────────────────
  return (
    <div className={styles.sectionInner}>
      <p style={{ fontSize: 11, color: 'var(--text-mute)', margin: 0 }}>
        No additional content options for this element type.
      </p>
    </div>
  );
}
