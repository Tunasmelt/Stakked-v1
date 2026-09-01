'use client';

import React, { useEffect, useCallback } from 'react';
import { useProjectStore } from '@/stores/project-store';
import { useEditorStore } from '@/stores/editor-store';
import { useTutorialStore } from '@/stores/tutorial-store';

/**
 * KeyboardManager: Global shortcut handler for Stakked.
 * Ensures that shortcuts don't interfere with TipTap or other inputs.
 */
export const KeyboardManager: React.FC = () => {
  // Fine-grained selectors — avoids re-binding keydown listener on every store change
  const undo                  = useProjectStore(s => s.undo);
  const redo                  = useProjectStore(s => s.redo);
  const activePageIndex       = useProjectStore(s => s.activePageIndex);
  const project               = useProjectStore(s => s.project);
  const removeElement            = useProjectStore(s => s.removeElement);
  const duplicateSelection       = useProjectStore(s => s.duplicateSelection);
  const pasteElements            = useProjectStore(s => s.pasteElements);
  const nudgeElements            = useProjectStore(s => s.nudgeElements);
  const groupElements            = useProjectStore(s => s.groupElements);
  const ungroupElements          = useProjectStore(s => s.ungroupElements);
  const toggleElementLock        = useProjectStore(s => s.toggleElementLock);
  const toggleElementVisibility  = useProjectStore(s => s.toggleElementVisibility);
  const moveElementForward    = useProjectStore(s => s.moveElementForward);
  const moveElementBackward   = useProjectStore(s => s.moveElementBackward);
  const moveElementToFront    = useProjectStore(s => s.moveElementToFront);
  const moveElementToBack     = useProjectStore(s => s.moveElementToBack);

  const selectedElementIds    = useEditorStore(s => s.selectedElementIds);
  const isEditingText         = useEditorStore(s => s.isEditingText);
  const setTool               = useEditorStore(s => s.setTool);
  const clearSelection        = useEditorStore(s => s.clearSelection);
  const copySelection         = useEditorStore(s => s.copySelection);
  const clipboard             = useEditorStore(s => s.clipboard);
  const setSelection          = useEditorStore(s => s.setSelection);

  const { startTour } = useTutorialStore();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // 1. Critical: Pass through if user is editing text in TipTap
    if (isEditingText && e.key !== 'Escape') return;

    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const cmdCtrl = isMac ? e.metaKey : e.ctrlKey;
    const shift = e.shiftKey;

    // Shortcuts
    switch (e.key.toLowerCase()) {
      // Undo / Redo
      case 'z':
        if (cmdCtrl) {
          e.preventDefault();
          if (shift) redo();
          else undo();
        }
        break;

      // Duplicate
      case 'd':
        if (cmdCtrl) {
          e.preventDefault();
          const newIds = duplicateSelection(activePageIndex, selectedElementIds);
          if (newIds.length > 0) {
            setSelection(newIds);
          }
        }
        break;

      // Copy / Paste (Internal)
      case 'c':
        if (cmdCtrl) {
          e.preventDefault();
          const page = project?.pages[activePageIndex];
          const selectedElements = page?.elements.filter(el => selectedElementIds.includes(el.id)) || [];
          copySelection(selectedElements);
        }
        break;
      
      case 'v':
        if (cmdCtrl) {
          if (clipboard.length > 0) {
            e.preventDefault();
            const newIds = pasteElements(activePageIndex, clipboard);
            if (newIds.length > 0) {
              setSelection(newIds);
            }
          }
        } else {
          setTool('select');
        }
        break;

      // Delete
      case 'backspace':
      case 'delete':
        if (selectedElementIds.length > 0) {
          e.preventDefault();
          selectedElementIds.forEach(id => removeElement(activePageIndex, id));
          clearSelection();
        }
        break;

      // Group / Ungroup
      case 'g':
        if (cmdCtrl) {
          e.preventDefault();
          if (shift) {
            // Ctrl+Shift+G — ungroup selected container
            if (selectedElementIds.length === 1) {
              ungroupElements(activePageIndex, selectedElementIds[0]);
            }
          } else {
            // Ctrl+G — group selected elements
            if (selectedElementIds.length >= 2) {
              groupElements(activePageIndex, selectedElementIds);
            }
          }
        }
        break;

      // Layer ordering
      case ']':
        if (cmdCtrl && selectedElementIds.length === 1) {
          e.preventDefault();
          if (shift) moveElementToFront(activePageIndex, selectedElementIds[0]);
          else moveElementForward(activePageIndex, selectedElementIds[0]);
        }
        break;
      case '[':
        if (cmdCtrl && selectedElementIds.length === 1) {
          e.preventDefault();
          if (shift) moveElementToBack(activePageIndex, selectedElementIds[0]);
          else moveElementBackward(activePageIndex, selectedElementIds[0]);
        }
        break;

      // Zoom shortcuts (Shift+1 → 100%, Shift+2 → 50%)
      case '1':
        if (!cmdCtrl && shift) {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('stakked-zoom-to', { detail: { zoom: 1 } }));
        }
        break;

      // Zoom to 50% (Shift+2) or zoom to selection (Ctrl/Cmd+Shift+2)
      case '2':
        if (!cmdCtrl && shift) {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('stakked-zoom-to', { detail: { zoom: 0.5 } }));
        } else if (cmdCtrl && shift && selectedElementIds.length > 0) {
          e.preventDefault();
          const page = project?.pages[activePageIndex];
          if (page) {
            const targets = page.elements.filter(el => selectedElementIds.includes(el.id));
            if (targets.length > 0) {
              const minX = Math.min(...targets.map(el => el.position.x));
              const minY = Math.min(...targets.map(el => el.position.y));
              const maxX = Math.max(...targets.map(el => el.position.x + (typeof el.size.width === 'number' ? el.size.width : 200)));
              const maxY = Math.max(...targets.map(el => el.position.y + (typeof el.size.height === 'number' ? el.size.height : 100)));
              const selW = maxX - minX;
              const selH = maxY - minY;
              const wrapper = document.querySelector('[data-tour="canvas"]') as HTMLElement;
              if (wrapper) {
                const margin = 80;
                const z = Math.min((wrapper.clientWidth - margin) / selW, (wrapper.clientHeight - margin) / selH, 4);
                window.dispatchEvent(new CustomEvent('stakked-zoom-to', { detail: { zoom: z, centerX: (minX + maxX) / 2, centerY: (minY + maxY) / 2 } }));
              }
            }
          }
        }
        break;

      // Lock / Unlock selected elements
      case 'l': {
        const tag = document.activeElement?.tagName.toLowerCase();
        if (!cmdCtrl && tag !== 'input' && tag !== 'textarea') {
          e.preventDefault();
          selectedElementIds.forEach(id => toggleElementLock(activePageIndex, id));
        }
        break;
      }

      // Tool Switching (hand) / Hide-show (Ctrl+Shift+H)
      case 'h': {
        if (cmdCtrl && shift) {
          // Ctrl/Cmd+Shift+H — hide/show selected elements
          e.preventDefault();
          selectedElementIds.forEach(id => toggleElementVisibility(activePageIndex, id));
        } else if (!cmdCtrl) {
          const tag = document.activeElement?.tagName.toLowerCase();
          if (tag !== 'input' && tag !== 'textarea') {
            setTool('hand');
          }
        }
        break;
      }

      // Help / Tutorial
      case '?':
      case '/':
        if (!cmdCtrl && !isEditingText) {
          e.preventDefault();
          startTour('editor');
        }
        break;

      // Navigation / Zoom — Ctrl+0 or Shift+0 → fit to page
      case '0':
        if (cmdCtrl || shift) {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('stakked-fit-page'));
        }
        break;

      // Selection
      case 'a':
        if (cmdCtrl) {
          e.preventDefault();
          const page = project?.pages[activePageIndex];
          if (page) {
            setSelection(page.elements.filter(el => !el.locked).map(el => el.id));
          }
        }
        break;

      case 'escape':
        e.preventDefault();
        clearSelection();
        useEditorStore.getState().setEditingText(false);
        break;

      // Nudging
      case 'arrowleft':
        if (selectedElementIds.length === 0) break;
        e.preventDefault();
        nudgeElements(activePageIndex, selectedElementIds, { x: -(shift ? 10 : 1), y: 0 });
        break;
      case 'arrowright':
        if (selectedElementIds.length === 0) break;
        e.preventDefault();
        nudgeElements(activePageIndex, selectedElementIds, { x: shift ? 10 : 1, y: 0 });
        break;
      case 'arrowup':
        if (selectedElementIds.length === 0) break;
        e.preventDefault();
        nudgeElements(activePageIndex, selectedElementIds, { x: 0, y: -(shift ? 10 : 1) });
        break;
      case 'arrowdown':
        if (selectedElementIds.length === 0) break;
        e.preventDefault();
        nudgeElements(activePageIndex, selectedElementIds, { x: 0, y: shift ? 10 : 1 });
        break;
    }
  }, [
    project,
    activePageIndex,
    selectedElementIds,
    isEditingText,
    clipboard,
    undo,
    redo,
    duplicateSelection,
    pasteElements,
    nudgeElements,
    removeElement,
    copySelection,
    setSelection,
    setTool,
    clearSelection,
    startTour,
    moveElementForward,
    moveElementBackward,
    moveElementToFront,
    moveElementToBack,
    groupElements,
    ungroupElements,
    toggleElementLock,
    toggleElementVisibility,
  ]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return null;
};
