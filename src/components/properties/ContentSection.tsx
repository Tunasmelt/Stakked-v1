'use client';

import React from 'react';
import { useProjectStore } from '@/stores/project-store';
import { StakkedElement, ElementContent, StakkedGalleryContent, StakkedShapeContent, StakkedLineContent, StakkedDrawingContent, StakkedVideoContent } from '@/types/element';

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
import { Select, NumberInput } from '@/components/ui/Primitives';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import styles from '@/styles/PropertiesPanel.module.css';

const SHAPE_VARIANTS = [
  { label: 'Rectangle',   value: 'rect' },
  { label: 'Circle',      value: 'circle' },
  { label: 'Ellipse',     value: 'ellipse' },
  { label: 'Triangle',    value: 'triangle' },
  { label: 'Diamond',     value: 'diamond' },
  { label: 'Star',        value: 'star' },
  { label: 'Pentagon',    value: 'pentagon' },
  { label: 'Hexagon',     value: 'hexagon' },
  { label: 'Arrow Right', value: 'arrow-right' },
  { label: 'Arrow Left',  value: 'arrow-left' },
  { label: 'Cross',       value: 'cross' },
  { label: 'Cloud',       value: 'cloud' },
];

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
        <Select
          label="Shape"
          value={c.variant}
          options={SHAPE_VARIANTS}
          onChange={v => updateContent({ variant: v } as Partial<StakkedShapeContent>)}
        />
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
