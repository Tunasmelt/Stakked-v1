'use client';

import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjectStore } from '@/stores/project-store';
import { useEditorStore } from '@/stores/editor-store';
import { StakkedElement } from '@/types/element';
import ContentSection from '@/components/properties/ContentSection';
import LinkSection from '@/components/properties/LinkSection';
import PositionSection from '@/components/properties/PositionSection';
import SizeSection from '@/components/properties/SizeSection';
import TypographySection from '@/components/properties/TypographySection';
import FillSection from '@/components/properties/FillSection';
import BorderSection from '@/components/properties/BorderSection';
import EffectsSection from '@/components/properties/EffectsSection';
import LayoutSection from '@/components/properties/LayoutSection';
import OverlaysSection from '@/components/properties/OverlaysSection';
import TransformsSection from '@/components/properties/TransformsSection';
import LogicSection from '@/components/properties/LogicSection';
import ScrollSection from '@/components/properties/ScrollSection';
import AccessibilitySection from '@/components/properties/AccessibilitySection';
import PageSection from '@/components/properties/PageSection';
import styles from '@/styles/PropertiesPanel.module.css';

const ELEMENT_DISPLAY_NAMES: Record<string, string> = {
  text:         'Text',
  image:        'Image',
  button:       'Button',
  shape:        'Shape',
  line:         'Line',
  container:    'Container',
  section:      'Section',
  video:        'Video',
  embed:        'Embed',
  icon:         'Icon',
  gallery:  'Gallery',
  divider:  'Divider',
  drawing:  'Drawing',
};

/**
 * PropertiesPanel — context-aware editor column.
 * Matches the Claude Design `.props-hd` + `.sect` pattern: mono-cased section
 * headers with a right-facing chevron that rotates 90° when expanded.
 */
export const PropertiesPanel: React.FC = () => {
  const selectedIds = useEditorStore(state => state.selectedElementIds);
  const activePageIndex = useProjectStore(state => state.activePageIndex);
  const pageTitle = useProjectStore(state => state.project?.pages[activePageIndex]?.title);

  // High-performance element selector — returns undefined when nothing / multi-selected
  const element = useProjectStore((state): StakkedElement | undefined => {
    if (selectedIds.length !== 1) return undefined;
    return state.project?.pages[activePageIndex]?.elements.find(e => e.id === selectedIds[0]);
  });

  if (element === undefined) {
    // Multi-selection: show count + quick actions
    if (selectedIds.length > 1) {
      return (
        <div className={styles.panel}>
          <div className={styles.header}>
            <span className={styles.title}>{selectedIds.length} Elements</span>
            <span className={styles.sub}>Multi-select</span>
          </div>
          <div style={{ padding: '16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-mute)', marginBottom: 4 }}>
              {`// ${selectedIds.length} elements selected`}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {[
                { key: 'Cmd+G',      label: 'Group' },
                { key: 'Del',        label: 'Delete' },
                { key: 'Cmd+D',      label: 'Duplicate' },
                { key: 'Cmd+C',      label: 'Copy' },
              ].map((item) => (
                <div key={item.key} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '5px 8px', background: 'var(--surface)', border: '1px solid var(--line)',
                  borderRadius: 'var(--r-sm)',
                }}>
                  <span style={{ fontSize: 10, color: 'var(--text)' }}>{item.label}</span>
                  <kbd style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-mute)',
                    background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 3, padding: '1px 4px' }}>
                    {item.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.panel}>
        <div className={styles.header}>
          <span className={styles.title}>Page: {pageTitle || 'Home'}</span>
          <span className={styles.sub}>Inspector</span>
        </div>

        <CollapsibleSection title="Page Settings" defaultOpen={true}>
          <PageSection />
        </CollapsibleSection>

        <div style={{ padding: '40px 24px', textAlign: 'center' }}>
          <span className={styles.emptyBadge}>{'// selection empty'}</span>
          <p className={styles.emptyHint} style={{ marginTop: 10 }}>
            Select an element to edit styles, or use the page inspector above.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>{ELEMENT_DISPLAY_NAMES[element.type] ?? element.type}</span>
        <span className={styles.sub}>#{element.id.slice(0, 8)}</span>
      </div>

      <CollapsibleSection title="Position & Size">
        <PositionSection element={element} pageIndex={activePageIndex} />
        <SizeSection element={element} pageIndex={activePageIndex} />
      </CollapsibleSection>

      <CollapsibleSection title="Data & Content" defaultOpen={true}>
        <ContentSection element={element} pageIndex={activePageIndex} />
      </CollapsibleSection>

      {element.type === 'container' && (
        <CollapsibleSection title="Layout" defaultOpen={false}>
          <LayoutSection element={element} pageIndex={activePageIndex} />
        </CollapsibleSection>
      )}

      {(['text', 'button'] as string[]).includes(element.type) && (
        <CollapsibleSection title="Typography">
          <TypographySection element={element} pageIndex={activePageIndex} />
        </CollapsibleSection>
      )}

      {!(['line', 'divider'] as string[]).includes(element.type) && (
        <CollapsibleSection title="Link" defaultOpen={false}>
          <LinkSection element={element} pageIndex={activePageIndex} />
        </CollapsibleSection>
      )}

      {!(['line', 'divider', 'shape'] as string[]).includes(element.type) && (
        <CollapsibleSection title="Fill" defaultOpen={false}>
          <FillSection element={element} pageIndex={activePageIndex} />
        </CollapsibleSection>
      )}

      {!(['line', 'divider'] as string[]).includes(element.type) && (
        <CollapsibleSection title="Border" defaultOpen={false}>
          <BorderSection element={element} pageIndex={activePageIndex} />
        </CollapsibleSection>
      )}

      <CollapsibleSection title="Effects" defaultOpen={false}>
        <EffectsSection element={element} pageIndex={activePageIndex} />
      </CollapsibleSection>

      {!(['line', 'divider'] as string[]).includes(element.type) && (
        <CollapsibleSection title="Overlays" defaultOpen={false}>
          <OverlaysSection element={element} pageIndex={activePageIndex} />
        </CollapsibleSection>
      )}

      <CollapsibleSection title="Transformers" defaultOpen={false}>
        <TransformsSection element={element} pageIndex={activePageIndex} />
      </CollapsibleSection>

      <CollapsibleSection title="Logic & Interaction" defaultOpen={false}>
        <LogicSection element={element} pageIndex={activePageIndex} />
      </CollapsibleSection>

      <CollapsibleSection title="Scroll Physics" defaultOpen={false}>
        <ScrollSection element={element} pageIndex={activePageIndex} />
      </CollapsibleSection>

      <CollapsibleSection title="Accessibility" defaultOpen={false}>
        <AccessibilitySection element={element} pageIndex={activePageIndex} />
      </CollapsibleSection>
    </div>
  );
};

function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className={styles.section}>
      <button
        type="button"
        className={styles.sectionHeader}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span>{title}</span>
        <motion.span
          className={styles.chevron}
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.18 }}
        >
          <ChevronRight size={14} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={styles.sectionBody}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
