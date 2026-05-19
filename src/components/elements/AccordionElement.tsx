'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { StakkedElement } from '@/types/element';

/**
 * AccordionElement — expandable FAQ sections.
 * Phase 5.13 spec: smooth Framer Motion expand/collapse per section.
 */
export default function AccordionElement({ element }: { element: StakkedElement }) {
  const content = element.content.type === 'accordion' ? element.content : null;
  const sections = content?.sections ?? [];
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflow: 'auto',
        borderRadius: 'inherit',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        padding: 8,
      }}
    >
      {sections.length === 0 ? (
        <span style={{ opacity: 0.5, fontSize: 12 }}>Add accordion sections in the properties panel…</span>
      ) : (
        sections.map((section, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={section.title ?? i}
              style={{
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8,
                overflow: 'hidden',
                background: 'rgba(255,255,255,0.03)',
              }}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 12px',
                  background: 'transparent',
                  border: 0,
                  cursor: 'pointer',
                  color: '#fff',
                  fontFamily: 'inherit',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                <span>{section.title}</span>
                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: 'inline-flex' }}
                >
                  <ChevronDown size={14} />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ padding: '4px 12px 12px', color: 'rgba(255,255,255,0.8)', fontSize: 12, lineHeight: 1.5 }}>
                      {section.content}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })
      )}
    </div>
  );
}
