'use client';

import React from 'react';
import { useEditorStore } from '@/stores/editor-store';
import { useProjectStore } from '@/stores/project-store';
import { StakkedElement } from '@/types/element';
import { StakkedElementStyleBase } from '@/types/style';
import styles from './OverrideIndicator.module.css';

interface OverrideIndicatorProps {
  element: StakkedElement;
  /** Dotted property path, e.g. "size.width" or "fills" */
  propertyKey: string;
  /** Page index — needed to clear the override in the store */
  pageIndex: number;
}

type OverrideRecord = Partial<StakkedElementStyleBase> | Record<string, unknown>;

function hasOverride(overrides: OverrideRecord | undefined, path: string): boolean {
  if (!overrides) return false;
  const segments = path.split('.');
  let cursor: unknown = overrides;
  for (const segment of segments) {
    if (cursor && typeof cursor === 'object' && segment in (cursor as Record<string, unknown>)) {
      cursor = (cursor as Record<string, unknown>)[segment];
    } else {
      return false;
    }
  }
  return cursor !== undefined;
}

/**
 * OverrideIndicator: Shows a purple dot when the given property has a
 * responsive override on the currently-active breakpoint. Clicking the dot
 * reveals a "Revert to desktop" button that removes the override.
 */
export const OverrideIndicator: React.FC<OverrideIndicatorProps> = ({
  element,
  propertyKey,
  pageIndex,
}) => {
  const breakpoint = useEditorStore((s) => s.breakpoint);
  const canvasWidth = useEditorStore((s) => s.canvasSize.width);
  const clearElementResponsiveOverride = useProjectStore(
    (s) => s.clearElementResponsiveOverride,
  );
  const [open, setOpen] = React.useState(false);

  if (breakpoint === 'desktop') return null;

  const overrides: OverrideRecord | undefined =
    breakpoint === 'custom'
      ? element.style.responsive.custom?.[canvasWidth.toString()]
      : element.style.responsive[breakpoint];

  if (!hasOverride(overrides, propertyKey)) return null;

  const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    clearElementResponsiveOverride(
      pageIndex,
      element.id,
      breakpoint,
      propertyKey,
      breakpoint === 'custom' ? canvasWidth : undefined,
    );
    setOpen(false);
  };

  return (
    <span className={styles.wrapper}>
      <button
        type="button"
        className={styles.indicator}
        title={`Overridden on ${breakpoint} — click to revert`}
        aria-label={`Clear ${propertyKey} override on ${breakpoint}`}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      />
      {open && (
        <button
          type="button"
          className={styles.clearButton}
          onClick={handleClear}
        >
          Revert to desktop
        </button>
      )}
    </span>
  );
};
