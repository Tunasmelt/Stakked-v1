'use client';

import React from 'react';
import { useProjectStore } from '@/stores/project-store';
import { StakkedElement, ElementContent, StakkedFormContent, StakkedGalleryContent, StakkedSocialContent, StakkedNavContent, StakkedShapeContent, StakkedLineContent, StakkedDrawingContent } from '@/types/element';
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

const SOCIAL_PLATFORMS = [
  'instagram','twitter','tiktok','youtube','spotify','soundcloud',
  'facebook','linkedin','pinterest','snapchat','twitch','discord',
  'github','behance','dribbble','threads',
];

const FORM_FIELD_TYPES = [
  { label: 'Text',         value: 'text' },
  { label: 'Email',        value: 'email' },
  { label: 'Phone',        value: 'tel' },
  { label: 'Number',       value: 'number' },
  { label: 'Textarea',     value: 'textarea' },
  { label: 'Checkbox',     value: 'checkbox' },
  { label: 'Radio Group',  value: 'radio' },
  { label: 'Select (Dropdown)', value: 'select' },
  { label: 'File Upload',  value: 'file' },
  { label: 'Date',         value: 'date' },
  { label: 'Password',     value: 'password' },
];

const GALLERY_LAYOUTS = [
  { label: 'Grid',     value: 'grid' },
  { label: 'Masonry',  value: 'masonry' },
  { label: 'Bento',    value: 'bento' },
  { label: 'Carousel', value: 'carousel' },
  { label: 'Strip',    value: 'strip' },
];

const NAV_STYLES = [
  { label: 'Horizontal',    value: 'horizontal' },
  { label: 'Vertical Left', value: 'vertical-left' },
  { label: 'Vertical Right',value: 'vertical-right' },
  { label: 'Centered',      value: 'centered' },
  { label: 'Split',         value: 'split' },
];

const MUSIC_PLATFORMS = [
  { label: 'Spotify',     value: 'spotify' },
  { label: 'Apple Music', value: 'apple-music' },
  { label: 'SoundCloud',  value: 'soundcloud' },
  { label: 'YouTube',     value: 'youtube' },
  { label: 'Bandcamp',    value: 'bandcamp' },
  { label: 'Tidal',       value: 'tidal' },
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

  // ── Social Link ─────────────────────────────────────────────────────────────
  if (c.type === 'social-link') {
    return (
      <div className={styles.sectionInner}>
        <Select
          label="Platform"
          value={c.platform}
          options={SOCIAL_PLATFORMS.map(p => ({ label: p.charAt(0).toUpperCase() + p.slice(1), value: p }))}
          onChange={v => updateContent({ platform: v })}
        />
        <div className={styles.inputWrapper}>
          <label className={styles.label}>Profile URL</label>
          <div className={styles.numberInput}>
            <input type="url" value={c.url} placeholder="https://instagram.com/you" onChange={e => updateContent({ url: e.target.value })} />
          </div>
        </div>
        <Select
          label="Display Mode"
          value={c.displayMode}
          options={[
            { label: 'Icon + Text', value: 'icon+text' },
            { label: 'Icon Only',   value: 'icon-only' },
            { label: 'Text Only',   value: 'text-only' },
          ]}
          onChange={v => updateContent({ displayMode: v })}
        />
      </div>
    );
  }

  // ── Music Player ─────────────────────────────────────────────────────────────
  if (c.type === 'music-player') {
    return (
      <div className={styles.sectionInner}>
        <Select label="Platform" value={c.platform} options={MUSIC_PLATFORMS} onChange={v => updateContent({ platform: v })} />
        <div className={styles.inputWrapper}>
          <label className={styles.label}>Track / Album URL</label>
          <div className={styles.numberInput}>
            <input type="url" value={c.url} placeholder="https://open.spotify.com/..." onChange={e => updateContent({ url: e.target.value })} />
          </div>
        </div>
        <Select
          label="Display Mode"
          value={c.displayMode}
          options={[
            { label: 'Full Player', value: 'full' },
            { label: 'Compact',     value: 'compact' },
            { label: 'Mini',        value: 'mini' },
          ]}
          onChange={v => updateContent({ displayMode: v })}
        />
        <div className={styles.inputWrapper}>
          <label className={styles.label}>Custom Embed HTML (optional)</label>
          <textarea
            className={styles.input}
            style={{ height: 72, resize: 'none', width: '100%', fontFamily: 'var(--font-mono)', fontSize: 10 }}
            value={c.embedHtml}
            placeholder="<iframe ..."
            onChange={e => updateContent({ embedHtml: e.target.value })}
          />
        </div>
      </div>
    );
  }

  // ── Video ────────────────────────────────────────────────────────────────────
  if (c.type === 'video') {
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
          onChange={v => updateContent({ platform: v })}
        />
        <div className={styles.inputWrapper}>
          <label className={styles.label}>Video URL</label>
          <div className={styles.numberInput}>
            <input type="url" value={c.url} placeholder="https://youtube.com/watch?v=..." onChange={e => updateContent({ url: e.target.value })} />
          </div>
        </div>
        <div className={styles.grid2}>
          <Select
            label="Autoplay"
            value={c.autoplay ? 'yes' : 'no'}
            options={[{ label: 'Yes (Muted)', value: 'yes' }, { label: 'No', value: 'no' }]}
            onChange={v => updateContent({ autoplay: v === 'yes' })}
          />
          <Select
            label="Loop"
            value={c.loop ? 'yes' : 'no'}
            options={[{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }]}
            onChange={v => updateContent({ loop: v === 'yes' })}
          />
        </div>
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

  // ── Navigation ───────────────────────────────────────────────────────────────
  if (c.type === 'navigation') {
    const links = c.links ?? [];
    return (
      <div className={styles.sectionInner}>
        <Select label="Nav Style" value={c.navStyle} options={NAV_STYLES} onChange={v => updateContent({ navStyle: v } as Partial<StakkedNavContent>)} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 4 }}>
          <label className={styles.label} style={{ margin: 0 }}>Links</label>
          <button
            style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'var(--accent)', background: 'none', border: '1px solid var(--accent)', borderRadius: 4, padding: '2px 6px', cursor: 'pointer' }}
            onClick={() => updateContent({ links: [...links, { label: 'Link', href: '#' }] } as Partial<StakkedNavContent>)}
          >
            <Plus size={10} /> Add
          </button>
        </div>
        {links.map((lnk, i) => (
          <div key={`${lnk.href}-${i}`} style={{ display: 'flex', gap: 4, marginBottom: 4, alignItems: 'center' }}>
            <div className={styles.numberInput} style={{ width: 80, flexShrink: 0 }}>
              <input type="text" placeholder="Label" value={lnk.label} onChange={e => {
                const next = [...links]; next[i] = { ...lnk, label: e.target.value };
                updateContent({ links: next } as Partial<StakkedNavContent>);
              }} />
            </div>
            <div className={styles.numberInput} style={{ flex: 1 }}>
              <input type="text" placeholder="/#href" value={lnk.href} onChange={e => {
                const next = [...links]; next[i] = { ...lnk, href: e.target.value };
                updateContent({ links: next } as Partial<StakkedNavContent>);
              }} />
            </div>
            <button onClick={() => updateContent({ links: links.filter((_, j) => j !== i) } as Partial<StakkedNavContent>)} style={{ color: 'var(--danger)', background: 'none', border: 0, cursor: 'pointer', padding: 3 }}>
              <Trash2 size={11} />
            </button>
          </div>
        ))}
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────────
  if (c.type === 'form') {
    const fields = c.fields ?? [];
    return (
      <div className={styles.sectionInner}>
        <div className={styles.inputWrapper}>
          <label className={styles.label}>Submit Action URL</label>
          <div className={styles.numberInput}>
            <input type="url" value={c.action} placeholder="https://api.formspree.io/f/..." onChange={e => updateContent({ action: e.target.value })} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 4 }}>
          <label className={styles.label} style={{ margin: 0 }}>Fields ({fields.length})</label>
          <button
            style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'var(--accent)', background: 'none', border: '1px solid var(--accent)', borderRadius: 4, padding: '2px 6px', cursor: 'pointer' }}
            onClick={() => updateContent({ fields: [...fields, { label: 'Field', fieldType: 'text', required: false }] } as Partial<StakkedFormContent>)}
          >
            <Plus size={10} /> Add Field
          </button>
        </div>
        {fields.map((field, i) => (
          <div key={`${field.label}-${i}`} style={{ border: '1px solid var(--line)', borderRadius: 6, padding: '6px 8px', marginBottom: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <div className={styles.numberInput} style={{ flex: 1, marginRight: 4 }}>
                <input type="text" placeholder="Label" value={field.label} onChange={e => {
                  const next = [...fields]; next[i] = { ...field, label: e.target.value };
                  updateContent({ fields: next } as Partial<StakkedFormContent>);
                }} />
              </div>
              <button onClick={() => updateContent({ fields: fields.filter((_, j) => j !== i) } as Partial<StakkedFormContent>)} style={{ color: 'var(--danger)', background: 'none', border: 0, cursor: 'pointer', padding: 2 }}>
                <Trash2 size={11} />
              </button>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <select
                value={field.fieldType}
                onChange={e => {
                  const next = [...fields]; next[i] = { ...field, fieldType: e.target.value };
                  updateContent({ fields: next } as Partial<StakkedFormContent>);
                }}
                style={{ flex: 1, background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--line)', borderRadius: 4, padding: '2px 4px', fontSize: 10, fontFamily: 'var(--font-mono)' }}
              >
                {FORM_FIELD_TYPES.map(ft => <option key={ft.value} value={ft.value}>{ft.label}</option>)}
              </select>
              <label style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'var(--text-mute)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                <input type="checkbox" checked={field.required} onChange={e => {
                  const next = [...fields]; next[i] = { ...field, required: e.target.checked };
                  updateContent({ fields: next } as Partial<StakkedFormContent>);
                }} />
                Required
              </label>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── Map ───────────────────────────────────────────────────────────────────────
  if (c.type === 'map') {
    return (
      <div className={styles.sectionInner}>
        <div className={styles.grid2}>
          <NumberInput label="Latitude" value={c.lat} step={0.0001} onChange={v => updateContent({ lat: v })} />
          <NumberInput label="Longitude" value={c.lng} step={0.0001} onChange={v => updateContent({ lng: v })} />
        </div>
        <NumberInput label="Zoom" value={c.zoom} min={1} max={20} onChange={v => updateContent({ zoom: v })} />
        <Select
          label="Provider"
          value={c.provider}
          options={[
            { label: 'OpenStreetMap', value: 'openstreetmap' },
            { label: 'Google Maps',   value: 'google' },
            { label: 'Mapbox',        value: 'mapbox' },
          ]}
          onChange={v => updateContent({ provider: v })}
        />
      </div>
    );
  }

  // ── Testimonial ───────────────────────────────────────────────────────────────
  if (c.type === 'testimonial') {
    return (
      <div className={styles.sectionInner}>
        <div className={styles.inputWrapper}>
          <label className={styles.label}>Quote</label>
          <textarea
            className={styles.input}
            style={{ height: 72, resize: 'vertical', width: '100%' }}
            value={c.quote}
            onChange={e => updateContent({ quote: e.target.value })}
          />
        </div>
        <div className={styles.inputWrapper}>
          <label className={styles.label}>Author</label>
          <div className={styles.numberInput}>
            <input type="text" value={c.author} onChange={e => updateContent({ author: e.target.value })} />
          </div>
        </div>
        <div className={styles.inputWrapper}>
          <label className={styles.label}>Role / Title</label>
          <div className={styles.numberInput}>
            <input type="text" value={c.role} onChange={e => updateContent({ role: e.target.value })} />
          </div>
        </div>
        <div className={styles.inputWrapper}>
          <label className={styles.label}>Avatar URL (optional)</label>
          <div className={styles.numberInput}>
            <input type="url" placeholder="https://..." value={c.avatar ?? ''} onChange={e => updateContent({ avatar: e.target.value || undefined })} />
          </div>
        </div>
      </div>
    );
  }

  // ── Marquee ───────────────────────────────────────────────────────────────────
  if (c.type === 'marquee') {
    const items = c.items ?? [];
    return (
      <div className={styles.sectionInner}>
        <div className={styles.grid2}>
          <NumberInput label="Speed (px/s)" value={c.speed} min={1} max={500} onChange={v => updateContent({ speed: v })} />
          <Select
            label="Direction"
            value={c.direction}
            options={[{ label: '← Left', value: 'left' }, { label: 'Right →', value: 'right' }]}
            onChange={v => updateContent({ direction: v as 'left' | 'right' })}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 4 }}>
          <label className={styles.label} style={{ margin: 0 }}>Items</label>
          <button
            style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'var(--accent)', background: 'none', border: '1px solid var(--accent)', borderRadius: 4, padding: '2px 6px', cursor: 'pointer' }}
            onClick={() => updateContent({ items: [...items, 'NEW ITEM'] })}
          >
            <Plus size={10} /> Add
          </button>
        </div>
        {items.map((item, i) => (
          <div key={`${item}-${i}`} style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
            <div className={styles.numberInput} style={{ flex: 1 }}>
              <input type="text" value={item} onChange={e => {
                const next = [...items]; next[i] = e.target.value;
                updateContent({ items: next });
              }} />
            </div>
            <button onClick={() => updateContent({ items: items.filter((_, j) => j !== i) })} style={{ color: 'var(--danger)', background: 'none', border: 0, cursor: 'pointer', padding: 3 }}>
              <Trash2 size={11} />
            </button>
          </div>
        ))}
      </div>
    );
  }

  // ── Countdown ─────────────────────────────────────────────────────────────────
  if (c.type === 'countdown') {
    return (
      <div className={styles.sectionInner}>
        <div className={styles.controlGroup}>
          <label className={styles.label}>Target Date</label>
          <input
            className={styles.input}
            type="datetime-local"
            value={c.targetDate ? c.targetDate.slice(0, 16) : ''}
            onChange={(e) => {
              // Store as full ISO string (UTC) so the countdown works across timezones
              const iso = e.target.value ? new Date(e.target.value).toISOString() : '';
              updateContent({ targetDate: iso });
            }}
          />
        </div>
        <div className={styles.inputWrapper}>
          <label className={styles.label}>End Label</label>
          <div className={styles.numberInput}>
            <input type="text" value={c.label} onChange={e => updateContent({ label: e.target.value })} />
          </div>
        </div>
      </div>
    );
  }

  // ── Accordion / Tabs ──────────────────────────────────────────────────────────
  if (c.type === 'accordion') {
    const sections = c.sections ?? [];
    return (
      <div className={styles.sectionInner}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <label className={styles.label} style={{ margin: 0 }}>Sections</label>
          <button
            style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'var(--accent)', background: 'none', border: '1px solid var(--accent)', borderRadius: 4, padding: '2px 6px', cursor: 'pointer' }}
            onClick={() => updateContent({ sections: [...sections, { title: 'New Section', content: 'Content here…' }] })}
          >
            <Plus size={10} /> Add
          </button>
        </div>
        {sections.map((sec, i) => (
          <div key={`${sec.title}-${i}`} style={{ border: '1px solid var(--line)', borderRadius: 6, padding: '6px 8px', marginBottom: 6 }}>
            <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
              <div className={styles.numberInput} style={{ flex: 1 }}>
                <input type="text" placeholder="Title" value={sec.title} onChange={e => {
                  const next = [...sections]; next[i] = { ...sec, title: e.target.value };
                  updateContent({ sections: next });
                }} />
              </div>
              <button onClick={() => updateContent({ sections: sections.filter((_, j) => j !== i) })} style={{ color: 'var(--danger)', background: 'none', border: 0, cursor: 'pointer', padding: 3 }}>
                <Trash2 size={11} />
              </button>
            </div>
            <textarea
              style={{ width: '100%', height: 48, resize: 'none', background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--line)', borderRadius: 4, padding: '4px 6px', fontSize: 10, fontFamily: 'var(--font-ui)' }}
              value={sec.content}
              onChange={e => {
                const next = [...sections]; next[i] = { ...sec, content: e.target.value };
                updateContent({ sections: next });
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  if (c.type === 'tabs') {
    const tabs = c.tabs ?? [];
    return (
      <div className={styles.sectionInner}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <label className={styles.label} style={{ margin: 0 }}>Tabs</label>
          <button
            style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'var(--accent)', background: 'none', border: '1px solid var(--accent)', borderRadius: 4, padding: '2px 6px', cursor: 'pointer' }}
            onClick={() => updateContent({ tabs: [...tabs, { label: 'Tab', content: 'Content here…' }] })}
          >
            <Plus size={10} /> Add
          </button>
        </div>
        {tabs.map((tab, i) => (
          <div key={`${tab.label}-${i}`} style={{ border: '1px solid var(--line)', borderRadius: 6, padding: '6px 8px', marginBottom: 6 }}>
            <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
              <div className={styles.numberInput} style={{ flex: 1 }}>
                <input type="text" placeholder="Tab label" value={tab.label} onChange={e => {
                  const next = [...tabs]; next[i] = { ...tab, label: e.target.value };
                  updateContent({ tabs: next });
                }} />
              </div>
              <button onClick={() => updateContent({ tabs: tabs.filter((_, j) => j !== i) })} style={{ color: 'var(--danger)', background: 'none', border: 0, cursor: 'pointer', padding: 3 }}>
                <Trash2 size={11} />
              </button>
            </div>
            <textarea
              style={{ width: '100%', height: 48, resize: 'none', background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--line)', borderRadius: 4, padding: '4px 6px', fontSize: 10, fontFamily: 'var(--font-ui)' }}
              value={tab.content}
              onChange={e => {
                const next = [...tabs]; next[i] = { ...tab, content: e.target.value };
                updateContent({ tabs: next });
              }}
            />
          </div>
        ))}
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
