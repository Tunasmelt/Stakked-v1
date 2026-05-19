'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { StakkedElement, StakkedTextContent } from '@/types/element';
import { useProjectStore } from '@/stores/project-store';
import { useEditorStore } from '@/stores/editor-store';
import { getEffectiveStyle } from '@/lib/style-utils';
import styles from '@/styles/Elements.module.css';
import { sanitizeHtml } from '@/lib/sanitize';

// Dynamically import the editor component to keep initial bundle light
const TipTapEditor = dynamic(() => import('./TipTapEditor'), { 
  ssr: false,
  loading: () => <div className={styles.textWrapper}>Loading Editor...</div>
});

interface ElementProps {
  element: StakkedElement;
  isEditing: boolean;
  isSelected?: boolean;
}

/**
 * TextElement: Reactive text component with inline TipTap editing support.
 */
export default function TextElement({ element, isEditing }: ElementProps) {
  // Reactive selectors — avoids stale page index on page switches mid-edit
  const updateElement   = useProjectStore(state => state.updateElement);
  const activePageIndex = useProjectStore(state => state.activePageIndex);
  const breakpoint      = useEditorStore(state => state.breakpoint);
  const canvasSize      = useEditorStore(state => state.canvasSize);
  const setEditingText  = useEditorStore(state => state.setEditingText);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingText(true);
  };

  const content = element.content.type === 'text' ? element.content.html : '';

  // Use effectiveStyle so breakpoint-specific typography overrides take effect
  const effectiveStyle = getEffectiveStyle(element.style, breakpoint, canvasSize.width);
  const typo = effectiveStyle.typography;
  const typographyStyle: React.CSSProperties = typo ? {
    fontFamily:     typo.fontFamily    || undefined,
    fontSize:       typo.fontSize      ? `${typo.fontSize}px` : undefined,
    fontWeight:     typo.fontWeight    || undefined,
    fontStyle:      typo.fontStyle     || undefined,
    color:          typo.color         || undefined,
    textAlign:      typo.textAlign     as React.CSSProperties['textAlign'] || undefined,
    textDecoration: typo.textDecoration || undefined,
    textTransform:  typo.textTransform  as React.CSSProperties['textTransform'] || undefined,
    lineHeight:     typo.lineHeight    || undefined,
    letterSpacing:  typo.letterSpacing != null ? `${typo.letterSpacing}px` : undefined,
    wordSpacing:    typo.wordSpacing   != null ? `${typo.wordSpacing}px`   : undefined,
  } : {};

  if (isEditing) {
    return (
      // Wrap in the same styled container so typography remains visible in edit mode
      <div className={styles.textWrapper} style={typographyStyle}>
        <TipTapEditor
          content={content}
          onUpdate={(html) => {
            const textContent: StakkedTextContent = {
              type: 'text',
              html,
              plainText: html.replace(/<[^>]*>?/gm, ''),
            };
            updateElement(activePageIndex, element.id, { content: textContent });
          }}
          onBlur={() => setEditingText(false)}
        />
      </div>
    );
  }

  return (
    <div
      className={styles.textWrapper}
      style={typographyStyle}
      onDoubleClick={handleDoubleClick}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) || '<em style="opacity:0.4;font-style:normal">Double-click to edit</em>' }}
    />
  );
}
