'use client';
/**
 * CanvasContextMenu — right-click context menu for canvas elements.
 * Triggered by onContextMenu on CanvasElement wrappers and on the canvas background.
 *
 * Features:
 *   - Copy / Paste / Duplicate
 *   - Delete
 *   - Bring Forward / Send Backward / Bring to Front / Send to Back
 *   - Lock / Unlock
 *   - Select All on canvas
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy, Clipboard, Trash2, Lock, Unlock,
  ChevronsUp, ChevronsDown, ChevronUp, ChevronDown,
  Rows3, Group,
} from 'lucide-react';
import { useProjectStore } from '@/stores/project-store';
import { useEditorStore } from '@/stores/editor-store';
import styles from '@/styles/CanvasContextMenu.module.css';

interface ContextMenuState {
  x: number;
  y: number;
  elementId: string | null;
}

interface Props {
  menu: ContextMenuState | null;
  onClose: () => void;
}

export const CanvasContextMenu: React.FC<Props> = ({ menu, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedIds         = useEditorStore((s) => s.selectedElementIds);
  const { setSelection, clearSelection } = useEditorStore.getState();

  const activePageIndex     = useProjectStore((s) => s.activePageIndex);
  const removeElement       = useProjectStore((s) => s.removeElement);
  const duplicateSelection  = useProjectStore((s) => s.duplicateSelection);
  const moveElementForward  = useProjectStore((s) => s.moveElementForward);
  const moveElementBackward = useProjectStore((s) => s.moveElementBackward);
  const moveElementToFront  = useProjectStore((s) => s.moveElementToFront);
  const moveElementToBack   = useProjectStore((s) => s.moveElementToBack);
  const toggleElementLock   = useProjectStore((s) => s.toggleElementLock);
  const groupElements       = useProjectStore((s) => s.groupElements);

  const elements = useProjectStore((s) => s.project?.pages[activePageIndex]?.elements ?? []);
  const targetId = menu?.elementId ?? selectedIds[0];
  const targetEl = elements.find((e) => e.id === targetId);

  // Close on outside click or Escape
  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onDown, { capture: true });
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onDown, { capture: true });
    };
  }, [menu, onClose]);

  // Clamp so menu never overflows viewport
  const clampedX = menu ? Math.min(menu.x, window.innerWidth  - 200) : 0;
  const clampedY = menu ? Math.min(menu.y, window.innerHeight - 300) : 0;

  const run = useCallback((fn: () => void) => {
    fn();
    onClose();
  }, [onClose]);

  if (!menu) return null;

  const hasSelection = selectedIds.length > 0;
  const isLocked = targetEl?.locked ?? false;

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        className={styles.menu}
        style={{ left: clampedX, top: clampedY }}
        initial={{ opacity: 0, scale: 0.9, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -4 }}
        transition={{ duration: 0.12 }}
      >
        {/* Element-specific actions */}
        {hasSelection && (
          <>
            <MenuItem
              label="Duplicate"
              icon={<Copy size={13} />}
              shortcut="⌘D"
              onClick={() => run(() => duplicateSelection(activePageIndex, selectedIds))}
            />
            <Separator />
            <MenuItem
              label="Bring to Front"
              icon={<ChevronsUp size={13} />}
              onClick={() => run(() => moveElementToFront(activePageIndex, targetId!))}
              disabled={!targetEl}
            />
            <MenuItem
              label="Bring Forward"
              icon={<ChevronUp size={13} />}
              onClick={() => run(() => moveElementForward(activePageIndex, targetId!))}
              disabled={!targetEl}
            />
            <MenuItem
              label="Send Backward"
              icon={<ChevronDown size={13} />}
              onClick={() => run(() => moveElementBackward(activePageIndex, targetId!))}
              disabled={!targetEl}
            />
            <MenuItem
              label="Send to Back"
              icon={<ChevronsDown size={13} />}
              onClick={() => run(() => moveElementToBack(activePageIndex, targetId!))}
              disabled={!targetEl}
            />
            <Separator />
            <MenuItem
              label={isLocked ? 'Unlock' : 'Lock'}
              icon={isLocked ? <Unlock size={13} /> : <Lock size={13} />}
              onClick={() => run(() => toggleElementLock(activePageIndex, targetId!))}
              disabled={!targetEl}
            />
            <Separator />
            {selectedIds.length >= 2 && (
              <MenuItem
                label="Group"
                icon={<Group size={13} />}
                shortcut="⌘G"
                onClick={() => run(() => groupElements(activePageIndex, selectedIds))}
              />
            )}
            <MenuItem
              label="Delete"
              icon={<Trash2 size={13} />}
              shortcut="⌫"
              danger
              onClick={() => run(() => {
                selectedIds.forEach((id) => removeElement(activePageIndex, id));
                clearSelection();
              })}
            />
            <Separator />
          </>
        )}

        {/* Canvas-level actions */}
        <MenuItem
          label="Select All"
          icon={<Rows3 size={13} />}
          shortcut="⌘A"
          onClick={() => run(() => setSelection(elements.map((e) => e.id)))}
        />

        {hasSelection && (
          <MenuItem
            label="Deselect"
            icon={<Clipboard size={13} />}
            shortcut="Esc"
            onClick={() => run(() => clearSelection())}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
};

/* -------------------------------------------------------------------------- */

function MenuItem({
  label,
  icon,
  shortcut,
  onClick,
  danger,
  disabled,
}: {
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      className={`${styles.item} ${danger ? styles.danger : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className={styles.itemIcon}>{icon}</span>
      <span className={styles.itemLabel}>{label}</span>
      {shortcut && <span className={styles.shortcut}>{shortcut}</span>}
    </button>
  );
}

function Separator() {
  return <div className={styles.separator} />;
}
