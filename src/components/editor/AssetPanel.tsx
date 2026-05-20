'use client';

import React, { useState, useEffect } from 'react';
import {
  Search, X, ImageIcon, Palette,
  Wind, Type, Hash, Shapes as ShapesIcon, Grid3x3, Zap
} from 'lucide-react';
import { searchAssets, AssetTab } from '@/lib/asset-resolver';
import { AssetSearchResult } from '@/types/assets';
import { useProjectStore } from '@/stores/project-store';
import { useEditorStore } from '@/stores/editor-store';
import { defaultElement, ElementType } from '@/types/element';
import { v4 as uuidv4 } from 'uuid';
import styles from '@/styles/AssetPanel.module.css';

interface TabProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

const Tab: React.FC<TabProps> = ({ icon, active, onClick, label }) => (
  <button
    className={`${styles.tab} ${active ? styles.active : ''}`}
    onClick={onClick}
    title={label}
    aria-label={label}
  >
    {icon}
  </button>
);

/** Tabs that REQUIRE a selected element because they apply styles. */
const STYLE_APPLY_TABS: AssetTab[] = ['colors', 'gradients', 'patterns', 'fonts'];

export const AssetPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AssetTab>('images');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AssetSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [toast, setToast] = useState<{ kind: 'info' | 'success' | 'warn'; msg: string } | null>(null);

  const addElement      = useProjectStore(s => s.addElement);
  const activePageIndex = useProjectStore(s => s.activePageIndex);

  // Auto-dismiss toast after 2.2s.
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(id);
  }, [toast]);

  // Reset page when tab or query changes
  useEffect(() => {
    setPage(1);
    setResults([]);
    setHasMore(false);
  }, [activeTab, query]);

  useEffect(() => {
    const fetchAssets = async () => {
      // Images need a query string; other tabs load on mount
      if (!query && activeTab === 'images') {
        setResults([]);
        setHasMore(false);
        return;
      }

      setLoading(true);
      try {
        const data = await searchAssets(activeTab, query, page);
        // Append for pagination, replace for fresh queries
        setResults((prev) => page === 1 ? data : [...prev, ...data]);
        // External sources return 24 items per page; fewer = no more pages
        setHasMore(['images', 'icons'].includes(activeTab) && data.length >= 24);
      } catch (err) {
        console.error('Asset search failed', err);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchAssets, 400);
    return () => clearTimeout(timeout);
  }, [query, activeTab, page]);

  const handleSelect = (asset: AssetSearchResult) => {
    switch (activeTab) {
      case 'images': {
        if (!asset.url) {
          setToast({ kind: 'warn', msg: 'This image has no source URL.' });
          return;
        }
        const el = defaultElement('image');
        if (el.content.type === 'image') {
          el.content.src = asset.url;
        }
        el.name = asset.alt || 'Image';
        addElement(activePageIndex, el);
        setToast({ kind: 'success', msg: 'Image added to canvas' });
        break;
      }
      case 'icons': {
        const el = defaultElement('icon');
        if (el.content.type === 'icon' && asset.metadata) {
          el.content.name = (asset.metadata.name as string) || 'star';
          el.content.set = (asset.metadata.prefix as string) || 'lucide';
        }
        el.name = `Icon: ${asset.metadata?.name ?? 'New'}`;
        addElement(activePageIndex, el);
        setToast({ kind: 'success', msg: 'Icon added to canvas' });
        break;
      }
      case 'colors': {
        const selectedIds = useEditorStore.getState().selectedElementIds;
        if (selectedIds.length === 0) {
          setToast({ kind: 'info', msg: 'Select an element first, then click a palette to apply.' });
          return;
        }
        if (asset.metadata?.colors) {
          const colors = asset.metadata.colors as string[];
          const firstColor = colors[0];
          if (firstColor) {
            const el = useProjectStore.getState().project?.pages[activePageIndex]?.elements.find(e => e.id === selectedIds[0]);
            const existingFills = el?.style.fills ?? [];
            // Replace the primary fill, keep secondary fills intact
            const newFill = { id: uuidv4(), type: 'color' as const, value: firstColor, opacity: 1, blendMode: 'normal' as const };
            const updatedFills = existingFills.length > 0
              ? [newFill, ...existingFills.slice(1)]
              : [newFill];
            useProjectStore.getState().updateElementStyle(activePageIndex, selectedIds[0], {
              fills: updatedFills,
            });
            setToast({ kind: 'success', msg: `Applied ${asset.alt || 'color'}` });
          }
        }
        break;
      }
      case 'gradients': {
        const selectedIds = useEditorStore.getState().selectedElementIds;
        if (selectedIds.length === 0) {
          setToast({ kind: 'info', msg: 'Select an element first, then click a gradient to apply.' });
          return;
        }
        if (asset.metadata?.value) {
          const el = useProjectStore.getState().project?.pages[activePageIndex]?.elements.find(e => e.id === selectedIds[0]);
          const existingFills = el?.style.fills ?? [];
          const newFill = {
            id: uuidv4(),
            type: 'gradient' as const,
            value: asset.metadata.value as string,
            opacity: 1,
            blendMode: 'normal' as const,
          };
          const updatedFills = existingFills.length > 0
            ? [newFill, ...existingFills.slice(1)]
            : [newFill];
          useProjectStore.getState().updateElementStyle(activePageIndex, selectedIds[0], {
            fills: updatedFills,
          });
          setToast({ kind: 'success', msg: `Applied ${asset.alt || 'gradient'}` });
        }
        break;
      }
      case 'patterns': {
        const selectedIds = useEditorStore.getState().selectedElementIds;
        if (selectedIds.length === 0) {
          setToast({ kind: 'info', msg: 'Select an element first, then click a pattern to apply.' });
          return;
        }
        if (asset.metadata?.value) {
          const el = useProjectStore.getState().project?.pages[activePageIndex]?.elements.find(e => e.id === selectedIds[0]);
          const existingFills = el?.style.fills ?? [];
          const newFill = {
            id: uuidv4(),
            type: 'pattern' as const,
            value: asset.metadata.value as string,
            opacity: 1,
            blendMode: 'normal' as const,
          };
          const updatedFills = existingFills.length > 0
            ? [newFill, ...existingFills.slice(1)]
            : [newFill];
          useProjectStore.getState().updateElementStyle(activePageIndex, selectedIds[0], {
            fills: updatedFills,
          });
          setToast({ kind: 'success', msg: `Applied ${asset.alt || 'pattern'}` });
        }
        break;
      }
      case 'shapes': {
        const el = defaultElement('shape');
        if (el.content.type === 'shape' && asset.metadata?.name) {
          el.content.variant = asset.metadata.name as string;
        }
        el.name = `Shape: ${asset.alt}`;
        addElement(activePageIndex, el);
        setToast({ kind: 'success', msg: 'Shape added to canvas' });
        break;
      }
      case 'fonts': {
        const selectedIds = useEditorStore.getState().selectedElementIds;
        if (selectedIds.length === 0) {
          setToast({ kind: 'info', msg: 'Select a text element first, then click a font pairing.' });
          return;
        }
        if (asset.metadata) {
          const heading = asset.metadata.heading as { family: string; weight: number } | undefined;
          if (heading) {
            const el = useProjectStore.getState().project?.pages[activePageIndex]?.elements.find(e => e.id === selectedIds[0]);
            const existing = el?.style.typography;
            // Merge: only update font family and weight, preserve the rest
            useProjectStore.getState().updateElementStyle(activePageIndex, selectedIds[0], {
              typography: {
                fontFamily: heading.family,  // override
                fontSize: existing?.fontSize ?? 16,
                fontWeight: heading.weight,
                fontStyle: existing?.fontStyle ?? 'normal',
                color: existing?.color ?? '#ffffff',
                textAlign: existing?.textAlign ?? 'left',
                textDecoration: existing?.textDecoration ?? 'none',
                textTransform: existing?.textTransform ?? 'none',
                lineHeight: existing?.lineHeight ?? 1.4,
                letterSpacing: existing?.letterSpacing ?? 0,
                wordSpacing: existing?.wordSpacing ?? 0,
                textShadow: existing?.textShadow ?? 'none',
                truncate: existing?.truncate ?? false,
                maxLines: existing?.maxLines ?? 0,
              },
            });
            setToast({ kind: 'success', msg: `Applied ${heading.family}` });
          }
        }
        break;
      }
      case 'gfx': {
        const metadata = asset.metadata as { name: string; baseType?: ElementType } | undefined;
        const id = metadata?.name;
        const baseType = metadata?.baseType || 'container';
        const el = defaultElement(baseType);
        el.name = `FX: ${asset.alt}`;

        // Apply specialized GFX styles
        const solidBorder = (color: string) => ({
          top:    { width: 1, color, style: 'solid' as const },
          right:  { width: 1, color, style: 'solid' as const },
          bottom: { width: 1, color, style: 'solid' as const },
          left:   { width: 1, color, style: 'solid' as const },
          linked: true,
        });

        if (id === 'glass-card') {
          el.size = { width: 320, height: 240 };
          el.style.size.width = 320;
          el.style.size.height = 240;
          el.style.fills = [{ id: uuidv4(), type: 'color', value: 'rgba(255,255,255,0.05)', opacity: 1, blendMode: 'normal' }];
          el.style.effects.backdropFilter = 'blur(20px) saturate(180%)';
          el.style.border = solidBorder('rgba(255,255,255,0.12)');
          el.style.borderRadius = { topLeft: 20, topRight: 20, bottomRight: 20, bottomLeft: 20, unit: 'px', linked: true };
        } else if (id === 'glow-pulse') {
          el.size = { width: 120, height: 120 };
          el.style.size.width = 120;
          el.style.size.height = 120;
          el.style.fills = [{ id: uuidv4(), type: 'color', value: '#3b82f6', opacity: 1, blendMode: 'normal' }];
          el.style.borderRadius = { topLeft: 999, topRight: 999, bottomRight: 999, bottomLeft: 999, unit: 'px', linked: true };
          el.style.effects.shadows = [{ id: uuidv4(), type: 'drop', x: 0, y: 0, blur: 40, spread: 8, color: '#3b82f6' }];
        } else if (id === 'floating-img') {
          el.size = { width: 280, height: 200 };
          el.style.size.width = 280;
          el.style.size.height = 200;
          el.style.borderRadius = { topLeft: 16, topRight: 16, bottomRight: 16, bottomLeft: 16, unit: 'px', linked: true };
          el.style.effects.shadows = [{ id: uuidv4(), type: 'drop', x: 0, y: 24, blur: 48, spread: -8, color: 'rgba(0,0,0,0.5)' }];
        } else if (id === 'glass-btn') {
          el.size = { width: 180, height: 52 };
          el.style.size.width = 180;
          el.style.size.height = 52;
          el.style.fills = [{ id: uuidv4(), type: 'color', value: 'rgba(255,255,255,0.08)', opacity: 1, blendMode: 'normal' }];
          el.style.effects.backdropFilter = 'blur(12px)';
          el.style.border = solidBorder('rgba(255,255,255,0.18)');
          el.style.borderRadius = { topLeft: 999, topRight: 999, bottomRight: 999, bottomLeft: 999, unit: 'px', linked: true };
          if (el.content.type === 'button') {
            el.content.label = 'Glass Button';
            el.content.variant = 'ghost';
          }
        } else if (id === 'spotlight') {
          el.size = { width: 480, height: 480 };
          el.style.size.width = 480;
          el.style.size.height = 480;
          el.style.fills = [{ id: uuidv4(), type: 'gradient', value: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 70%)', opacity: 1, blendMode: 'normal' }];
          el.style.borderRadius = { topLeft: 999, topRight: 999, bottomRight: 999, bottomLeft: 999, unit: 'px', linked: true };
          el.style.effects.overflow = 'hidden';
        }

        addElement(activePageIndex, el);
        setToast({ kind: 'success', msg: `${asset.alt} added` });
        break;
      }
    }
  };

  const selectedCount = useEditorStore((s) => s.selectedElementIds.length);
  const needsSelection = STYLE_APPLY_TABS.includes(activeTab) && selectedCount === 0;

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        <Tab icon={<ImageIcon size={16} />} active={activeTab === 'images'} onClick={() => setActiveTab('images')} label="Images" />
        <Tab icon={<Hash size={16} />} active={activeTab === 'icons'} onClick={() => setActiveTab('icons')} label="Icons" />
        <Tab icon={<Palette size={16} />} active={activeTab === 'colors'} onClick={() => setActiveTab('colors')} label="Colors" />
        <Tab icon={<Wind size={16} />} active={activeTab === 'gradients'} onClick={() => setActiveTab('gradients')} label="Gradients" />
        <Tab icon={<Grid3x3 size={16} />} active={activeTab === 'patterns'} onClick={() => setActiveTab('patterns')} label="Patterns" />
        <Tab icon={<ShapesIcon size={16} />} active={activeTab === 'shapes'} onClick={() => setActiveTab('shapes')} label="Shapes" />
        <Tab icon={<Type size={16} />} active={activeTab === 'fonts'} onClick={() => setActiveTab('fonts')} label="Fonts" />
        <Tab icon={<Zap size={16} />} active={activeTab === 'gfx'} onClick={() => setActiveTab('gfx')} label="Special FX" />
      </div>

      <div className={styles.searchWrapper}>
        <Search className={styles.searchIcon} size={14} />
        <input
          className={styles.searchInput}
          placeholder={`Search ${activeTab}...`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && <X className={styles.clearIcon} size={14} onClick={() => setQuery('')} />}
      </div>

      {needsSelection && (
        <div className={styles.hintBanner}>
          Select an element on the canvas to apply {activeTab}.
        </div>
      )}

      <div className={styles.resultsGrid}>
        {loading ? (
          <div className={styles.loading}>Searching...</div>
        ) : results.length > 0 ? (
          results.map((asset) => (
            <div
              key={asset.id}
              className={styles.assetCard}
              onClick={() => handleSelect(asset)}
              title={asset.alt}
            >
              {activeTab === 'images' && asset.thumb && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={asset.thumb}
                  alt={asset.alt}
                  className={styles.imageThumb}
                  draggable
                  onDragStart={(e) => {
                    e.stopPropagation();
                    e.dataTransfer.setData('stakked/asset-url', asset.url ?? '');
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                />
              )}
              {activeTab === 'icons' && asset.metadata?.prefix && asset.metadata?.name && (
                <div className={styles.iconPreview}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://api.iconify.design/${asset.metadata.prefix}/${asset.metadata.name}.svg`}
                    alt=""
                  />
                </div>
              )}
              {activeTab === 'colors' && (
                <div className={styles.palettePreview}>
                  {asset.metadata?.colors?.map((c: string) => (
                    <div key={c} style={{ backgroundColor: c }} className={styles.colorStrip} />
                  ))}
                </div>
              )}
              {activeTab === 'gradients' && (
                <div
                  className={styles.gradientPreview}
                  style={{ background: asset.metadata?.value as string }}
                />
              )}
              {activeTab === 'patterns' && (
                <div
                  className={styles.gradientPreview}
                  style={{ background: asset.metadata?.value as string, backgroundColor: '#f5f5f5' }}
                />
              )}
              {activeTab === 'shapes' && (
                <div className={styles.iconPreview}>
                  <ShapeGlyph name={(asset.metadata?.name as string) ?? 'rect'} />
                </div>
              )}
              {activeTab === 'fonts' && (
                <div
                  className={styles.iconPreview}
                  style={{
                    fontFamily: (asset.metadata?.heading as { family: string } | undefined)?.family,
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  Aa
                </div>
              )}
              {activeTab === 'gfx' && (
                <div className={styles.iconPreview} style={{ color: '#3b82f6' }}>
                  <Zap size={20} />
                </div>
              )}
              <div className={styles.assetLabel}>{asset.alt}</div>
            </div>
          ))
        ) : (
          <div className={styles.empty}>
            {query ? `No ${activeTab} match "${query}"` : `No ${activeTab} yet.`}
          </div>
        )}
      </div>

      {/* Load more — images & icons only */}
      {hasMore && (
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={loading}
          style={{
            display: 'block',
            width: 'calc(100% - 24px)',
            margin: '8px 12px',
            padding: '8px',
            borderRadius: 'var(--r-sm)',
            border: '1px dashed var(--line)',
            background: 'transparent',
            color: loading ? 'var(--text-dim)' : 'var(--accent)',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            cursor: loading ? 'wait' : 'pointer',
            transition: 'background 120ms',
          }}
        >
          {loading ? 'Loading…' : '+ Load more'}
        </button>
      )}

      {toast && (
        <div className={`${styles.toast} ${styles[`toast${toast.kind.charAt(0).toUpperCase() + toast.kind.slice(1)}`] ?? ''}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function ShapeGlyph({ name }: { name: string }) {
  const sz = 22;
  const stroke = 'currentColor';
  switch (name) {
    case 'circle':
      return (
        <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={2}>
          <circle cx={12} cy={12} r={9} />
        </svg>
      );
    case 'triangle':
      return (
        <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={2}>
          <polygon points="12,3 22,21 2,21" />
        </svg>
      );
    case 'star':
      return (
        <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={2}>
          <polygon points="12,2 15,9 22,9.5 16.5,14 18,22 12,18 6,22 7.5,14 2,9.5 9,9" />
        </svg>
      );
    case 'diamond':
      return (
        <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={2}>
          <polygon points="12,2 22,12 12,22 2,12" />
        </svg>
      );
    case 'hexagon':
      return (
        <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={2}>
          <polygon points="6,3 18,3 22,12 18,21 6,21 2,12" />
        </svg>
      );
    case 'arrow':
      return (
        <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={2}>
          <path d="M4 12h14M14 6l6 6-6 6" />
        </svg>
      );
    case 'line':
      return (
        <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={2}>
          <line x1={3} y1={12} x2={21} y2={12} />
        </svg>
      );
    case 'rect':
    default:
      return (
        <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={2}>
          <rect x={3} y={5} width={18} height={14} rx={2} />
        </svg>
      );
  }
}
