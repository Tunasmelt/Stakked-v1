'use client';

import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import {
  Plus, Layers, FileText, Image as ImageIcon,
  Type, MousePointer2, Video,
  Minus, Sparkles, Square, Eye, EyeOff, Lock, Unlock, Trash2,
  Search, Box, LayoutGrid, Globe,
  Minus as LineIcon, PenLine, GripVertical,
} from 'lucide-react';
import { useProjectStore } from '@/stores/project-store';
import { useEditorStore } from '@/stores/editor-store';
import { ElementType, StakkedElement, defaultElement } from '@/types/element';
import { AssetPanel } from './AssetPanel';
import { PageList } from './PageList';
import styles from '@/styles/LeftSidebar.module.css';

type SidebarTab = 'elements' | 'layers' | 'pages' | 'assets';

const TAB_META: Record<SidebarTab, { label: string; caption: string; hint?: string }> = {
  elements: { label: '+ Insert', caption: '// tray · drag to canvas', hint: 'tray' },
  layers:   { label: 'Layers',   caption: '// layers · z-index' },
  pages:    { label: 'Pages',    caption: '// pages' },
  assets:   { label: 'Assets',   caption: '// assets · library', hint: 'bundle' },
};

export const LeftSidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SidebarTab>('elements');
  const activePageIndex = useProjectStore((s) => s.activePageIndex);
  const elementCount    = useProjectStore((s) => s.project?.pages[activePageIndex]?.elements.length ?? 0);

  const meta = TAB_META[activeTab];

  return (
    <div className={styles.sidebar}>
      <div className={styles.tabs}>
        <TabButton label="+ Insert" icon={<Plus size={12} />}      active={activeTab === 'elements'} onClick={() => setActiveTab('elements')} />
        <TabButton label="Layers"   icon={<Layers size={12} />}    active={activeTab === 'layers'}   onClick={() => setActiveTab('layers')}   />
        <TabButton label="Pages"    icon={<FileText size={12} />}  active={activeTab === 'pages'}    onClick={() => setActiveTab('pages')}    />
        <TabButton label="Assets"   icon={<ImageIcon size={12} />} active={activeTab === 'assets'}   onClick={() => setActiveTab('assets')}   />
      </div>

      <div className={styles.content}>
        <div className={styles.paneHeader}>
          <span className={styles.paneTitle}>{meta.caption}</span>
          {activeTab === 'layers' && <span className={styles.paneCount}>{elementCount}</span>}
          {meta.hint && activeTab !== 'layers' && <span className={styles.paneCount}>{meta.hint}</span>}
        </div>

        <div className={styles.scrollArea}>
          {activeTab === 'elements' && <ElementTray />}
          {activeTab === 'layers'   && (
            <LayersPanel activePageIndex={activePageIndex} />
          )}
          {activeTab === 'pages'    && (
            <div className={styles.pagesPanel}><PageList /></div>
          )}
          {activeTab === 'assets'   && <AssetPanel />}
        </div>
      </div>
    </div>
  );
};

/* ── TabButton ─────────────────────────────────────────────────────────────── */

function TabButton({ label, icon, active, onClick }: {
  label: string; icon: React.ReactNode; active: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`${styles.tabButton} ${active ? styles.active : ''}`}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

/* ── ElementTray ───────────────────────────────────────────────────────────── */

interface TrayItem {
  type: ElementType;
  icon: React.ReactNode;
  label: string;
  hot: string;
}

const TRAY_GROUPS: { heading: string; items: TrayItem[] }[] = [
  {
    heading: 'Structure',
    items: [
      { type: 'container', icon: <Box size={18} />,          label: 'Container', hot: 'F' },
      { type: 'text',      icon: <Type size={18} />,         label: 'Text',      hot: 'T' },
      { type: 'image',     icon: <ImageIcon size={18} />,    label: 'Image',     hot: 'I' },
      { type: 'shape',     icon: <Square size={18} />,       label: 'Shape',     hot: 'S' },
      { type: 'divider',   icon: <Minus size={18} />,        label: 'Divider',   hot: '—' },
      { type: 'line',      icon: <LineIcon size={18} />,     label: 'Line',      hot: '/' },
      { type: 'drawing',   icon: <PenLine size={18} />,      label: 'Drawing',   hot: 'D' },
    ],
  },
  {
    heading: 'Interactive',
    items: [
      { type: 'button', icon: <MousePointer2 size={18} />, label: 'Button', hot: 'B' },
    ],
  },
  {
    heading: 'Media',
    items: [
      { type: 'video',   icon: <Video size={18} />,      label: 'Video',   hot: 'V' },
      { type: 'gallery', icon: <LayoutGrid size={18} />, label: 'Gallery', hot: 'G' },
    ],
  },
  {
    heading: 'Embed',
    items: [
      { type: 'embed', icon: <Globe size={18} />, label: 'Embed', hot: 'E' },
    ],
  },
  {
    heading: 'Content',
    items: [
      { type: 'icon', icon: <Sparkles size={18} />, label: 'Icon', hot: 'K' },
    ],
  },
];

const ALL_TRAY_ITEMS: TrayItem[] = TRAY_GROUPS.flatMap((g) => g.items);

function ElementTray() {
  const [query, setQuery] = useState('');
  const addElement      = useProjectStore((s) => s.addElement);
  const activePageIndex = useProjectStore((s) => s.activePageIndex);
  const setSelection    = useEditorStore((s) => s.setSelection);
  const zoom            = useEditorStore((s) => s.zoom);
  const pan             = useEditorStore((s) => s.pan);

  const handleDragStart = (e: React.DragEvent, type: ElementType) => {
    e.dataTransfer.setData('stakked/element-type', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  /** Click-to-add: places at artboard center, accounting for zoom and pan.
   *  Canvas renders elements at: screen_x = el.position.x * zoom + pan.x
   *  Inverse: artboard_x = (screen_x - pan.x) / zoom
   */
  const handleClick = useCallback(
    (type: ElementType) => {
      const el = defaultElement(type);
      const artboard = document.querySelector('[data-tour="canvas"]');
      if (artboard) {
        const rect = artboard.getBoundingClientRect();
        // Center of the visible canvas rect in screen space
        const screenCx = rect.left + rect.width / 2;
        const screenCy = rect.top + rect.height / 2;
        // Convert to artboard coordinates (inverse of the canvas transform)
        const ax = Math.max(0, Math.round((screenCx - pan.x) / zoom - 100));
        const ay = Math.max(0, Math.round((screenCy - pan.y) / zoom - 60));
        el.position = { x: ax, y: ay };
        el.style.position.x = ax;
        el.style.position.y = ay;
      } else {
        el.position = { x: 240, y: 160 };
        el.style.position.x = 240;
        el.style.position.y = 160;
      }
      addElement(activePageIndex, el);
      setSelection([el.id]);
    },
    [addElement, activePageIndex, setSelection, zoom, pan],
  );

  const trimmed = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!trimmed) return null; // null = show grouped layout
    return ALL_TRAY_ITEMS.filter(
      (it) => it.label.toLowerCase().includes(trimmed) || it.type.toLowerCase().includes(trimmed),
    );
  }, [trimmed]);

  return (
    <>
      <div className={styles.searchBox}>
        <Search size={12} />
        <input
          type="text"
          placeholder="Search elements…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Escape') setQuery(''); }}
        />
        {query && (
          <button style={{ background: 'none', border: 0, color: 'var(--text-dim)', cursor: 'pointer', padding: 0 }} onClick={() => setQuery('')}>×</button>
        )}
      </div>

      {filtered ? (
        /* Search result: flat grid */
        <div className={styles.elementGrid}>
          {filtered.length === 0 ? (
            <p style={{ gridColumn: '1/-1', fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', textAlign: 'center', padding: '12px 0' }}>
              No results for &ldquo;{query}&rdquo;
            </p>
          ) : filtered.map((item) => (
            <TrayItem key={item.type} item={item} onDragStart={handleDragStart} onClick={handleClick} />
          ))}
        </div>
      ) : (
        /* Default: grouped layout */
        TRAY_GROUPS.map((group) => (
          <div key={group.heading} className={styles.trayGroup}>
            <div className={styles.trayGroupHeading}>{group.heading}</div>
            <div className={styles.elementGrid}>
              {group.items.map((item) => (
                <TrayItem key={item.type} item={item} onDragStart={handleDragStart} onClick={handleClick} />
              ))}
            </div>
          </div>
        ))
      )}
    </>
  );
}

function TrayItem({ item, onDragStart, onClick }: {
  item: TrayItem;
  onDragStart: (e: React.DragEvent, type: ElementType) => void;
  onClick: (type: ElementType) => void;
}) {
  return (
    <div
      className={styles.elementItem}
      draggable
      onDragStart={(e) => onDragStart(e, item.type)}
      onClick={() => onClick(item.type)}
      title={`${item.label} — click to add · drag to position`}
    >
      <span className={styles.hotHint}>{item.hot}</span>
      {item.icon}
      <span>{item.label}</span>
    </div>
  );
}

/* ── Type icons for the layers panel ──────────────────────────────────────── */

const TYPE_ICONS: Record<string, React.ReactNode> = {
  text:      <Type size={11} />,
  image:     <ImageIcon size={11} />,
  button:    <MousePointer2 size={11} />,
  shape:     <Square size={11} />,
  line:      <LineIcon size={11} />,
  container: <Box size={11} />,
  video:     <Video size={11} />,
  embed:     <Globe size={11} />,
  icon:      <Sparkles size={11} />,
  gallery:   <LayoutGrid size={11} />,
  divider:   <Minus size={11} />,
  drawing:   <PenLine size={11} />,
};

/* ── LayersPanel ───────────────────────────────────────────────────────────── */

const EMPTY_ELEMENTS: StakkedElement[] = [];

function LayersPanel({ activePageIndex }: { activePageIndex: number }) {
  // Own the selector so a stable empty array is returned (no new [] reference)
  const elements = useProjectStore(
    (s) => s.project?.pages[activePageIndex]?.elements ?? EMPTY_ELEMENTS,
  );
  // Reactive selectors — no stale closures
  const selectedElementIds      = useEditorStore((s) => s.selectedElementIds);
  const setSelection            = useEditorStore((s) => s.setSelection);
  const toggleElementVisibility = useProjectStore((s) => s.toggleElementVisibility);
  const toggleElementLock       = useProjectStore((s) => s.toggleElementLock);
  const removeElement           = useProjectStore((s) => s.removeElement);
  const renameElement           = useProjectStore((s) => s.renameElement);
  const reorderElements         = useProjectStore((s) => s.reorderElements);
  const commit                  = useProjectStore((s) => s.commit);

  // Drag-to-reorder state
  const dragIdRef   = useRef<string | null>(null);
  const [dropBeforeId, setDropBeforeId] = useState<string | null>(null);

  // Inline rename state
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

  const handleLayerDragStart = (e: React.DragEvent, id: string) => {
    dragIdRef.current = id;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('stakked/layer-id', id);
  };

  const handleLayerDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropBeforeId(id);
  };

  const handleLayerDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDropBeforeId(null);
    const sourceId = dragIdRef.current;
    dragIdRef.current = null;
    if (!sourceId || sourceId === targetId) return;

    // Snapshot history before reorder so Ctrl+Z can undo it
    commit();

    // Build new top-first ordered list, insert source before target
    const ordered = [...elements].sort((a, b) => b.zIndex - a.zIndex);
    const sourceIdx = ordered.findIndex((el) => el.id === sourceId);
    if (sourceIdx === -1) return;
    const [moved] = ordered.splice(sourceIdx, 1);
    const targetIdx = ordered.findIndex((el) => el.id === targetId);
    ordered.splice(targetIdx, 0, moved);
    reorderElements(activePageIndex, ordered.map((el) => el.id));
  };

  /** Handle layer row click with multi-select support */
  const handleRowClick = useCallback(
    (e: React.MouseEvent, id: string) => {
      // navigator.platform is deprecated — prefer userAgentData with userAgent fallback
      const platform = (navigator as { userAgentData?: { platform: string } }).userAgentData?.platform
        ?? navigator.userAgent;
      const isMac = /mac/i.test(platform);
      const cmdCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (e.shiftKey && selectedElementIds.length > 0) {
        // Range select: all rows between last selected and clicked
        const ordered = [...elements].sort((a, b) => b.zIndex - a.zIndex);
        const lastId  = selectedElementIds[selectedElementIds.length - 1];
        const lastIdx = ordered.findIndex((el) => el.id === lastId);
        const clickIdx = ordered.findIndex((el) => el.id === id);
        const [lo, hi] = [Math.min(lastIdx, clickIdx), Math.max(lastIdx, clickIdx)];
        const rangeIds = ordered.slice(lo, hi + 1).map((el) => el.id);
        setSelection([...new Set([...selectedElementIds, ...rangeIds])]);
      } else if (cmdCtrl) {
        // Toggle individual
        if (selectedElementIds.includes(id)) {
          setSelection(selectedElementIds.filter((sid) => sid !== id));
        } else {
          setSelection([...selectedElementIds, id]);
        }
      } else {
        setSelection([id]);
      }
    },
    [elements, selectedElementIds, setSelection],
  );

  const commitRename = () => {
    if (renamingId && renameValue.trim()) {
      renameElement(activePageIndex, renamingId, renameValue.trim());
    }
    setRenamingId(null);
  };

  const orderedElements = useMemo(
    () => [...elements].sort((a, b) => b.zIndex - a.zIndex),
    [elements],
  );

  if (orderedElements.length === 0) {
    return (
      <p className={styles.emptyState}>
        No layers yet.
        <br />
        Drop an element to begin.
      </p>
    );
  }

  return (
    <div
      className={styles.panelList}
      onDragLeave={(e) => {
        // Only clear the indicator when the pointer leaves the panel entirely,
        // not when it moves between child rows (which also fires onDragLeave).
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setDropBeforeId(null);
        }
      }}
      onDragEnd={() => { dragIdRef.current = null; setDropBeforeId(null); }}
    >
      {orderedElements.map((element) => {
        const isSelected   = selectedElementIds.includes(element.id);
        const isDropTarget = dropBeforeId === element.id;
        const isHidden     = !element.visible;
        const isLocked     = element.locked;
        const isRenaming   = renamingId === element.id;

        const rowClass = [
          styles.listItem,
          isSelected   ? styles.selectedItem  : '',
          isDropTarget ? styles.dragTarget    : '',
          isHidden     ? styles.hiddenItem    : '',
          isLocked     ? styles.lockedItem    : '',
        ].filter(Boolean).join(' ');

        return (
          <div
            key={element.id}
            className={rowClass}
            draggable={!isRenaming}
            onDragStart={(e) => handleLayerDragStart(e, element.id)}
            onDragOver={(e) => handleLayerDragOver(e, element.id)}
            onDrop={(e) => handleLayerDrop(e, element.id)}
            onClick={(e) => !isRenaming && handleRowClick(e, element.id)}
          >
            {/* Drag grip */}
            <span className={styles.dragGrip} onMouseDown={(e) => e.stopPropagation()}>
              <GripVertical size={11} />
            </span>

            {/* Type icon */}
            <span className={styles.typeIcon} title={element.type}>
              {TYPE_ICONS[element.type] ?? <Square size={11} />}
            </span>

            {/* Name — double-click to rename */}
            <div className={styles.listItemContent}>
              {isRenaming ? (
                <input
                  ref={renameInputRef}
                  className={styles.renameInput}
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitRename();
                    if (e.key === 'Escape') setRenamingId(null);
                    e.stopPropagation(); // don't let KeyboardManager swallow
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <>
                  <span
                    className={styles.listItemTitle}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setRenamingId(element.id);
                      setRenameValue(element.name);
                    }}
                    title="Double-click to rename"
                  >
                    {element.name}
                  </span>
                  <span className={styles.listItemMeta}>{element.type}</span>
                </>
              )}
            </div>

            {/* Action row — visible on hover / selected */}
            <div className={styles.actionRow}>
              <button
                className={styles.itemButton}
                style={isHidden ? { color: 'var(--text-dim)', opacity: 1 } : {}}
                onClick={(ev) => { ev.stopPropagation(); toggleElementVisibility(activePageIndex, element.id); }}
                title={isHidden ? 'Show layer' : 'Hide layer'}
                aria-label={isHidden ? 'Show layer' : 'Hide layer'}
              >
                {isHidden ? <EyeOff size={12} /> : <Eye size={12} />}
              </button>
              <button
                className={styles.itemButton}
                style={isLocked ? { color: 'var(--accent)', opacity: 1 } : {}}
                onClick={(ev) => { ev.stopPropagation(); toggleElementLock(activePageIndex, element.id); }}
                title={isLocked ? 'Unlock layer' : 'Lock layer'}
                aria-label={isLocked ? 'Unlock layer' : 'Lock layer'}
              >
                {isLocked ? <Lock size={12} /> : <Unlock size={12} />}
              </button>
              <button
                className={`${styles.itemButton} ${styles.deleteBtn}`}
                disabled={isLocked}
                onClick={(ev) => {
                  ev.stopPropagation();
                  if (isLocked) return; // locked elements are protected — unlock first
                  removeElement(activePageIndex, element.id);
                  if (isSelected) setSelection(selectedElementIds.filter((id) => id !== element.id));
                }}
                title={isLocked ? 'Unlock layer before deleting' : 'Delete layer'}
                aria-label={isLocked ? 'Unlock layer before deleting' : 'Delete layer'}
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
