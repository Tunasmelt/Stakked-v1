'use client';

import React from 'react';
import * as LucideIcons from 'lucide-react';
import { StakkedElement } from '@/types/element';

/**
 * IconElement: Multi-set icon renderer.
 *
 * - set === 'lucide'  → Lucide React component (bundled)
 * - any other set     → Iconify web-component via CDN (simple-icons, mdi, ph, tabler, etc.)
 *   Icon names must follow Iconify format: "mdi:home", "ph:heart", "tabler:star"
 *   For lucide names without a prefix, we auto-prefix with "lucide:" when forwarding to Iconify.
 */
export default function IconElement({ element }: { element: StakkedElement }) {
  const content = element.content.type === 'icon'
    ? element.content
    : { name: 'Star', color: 'white', size: 24, set: 'lucide' };

  const set = (content as { set?: string }).set ?? 'lucide';
  const color = content.color ?? 'white';
  const size = content.size ?? 24;

  // ── Lucide set: use bundled React components ──────────────────────────────
  if (set === 'lucide') {
    // PascalCase lookup: "arrow-right" → "ArrowRight"
    const key = content.name
      .split(/[-_\s]+/)
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join('');
    const IconComponent =
      (LucideIcons as unknown as Record<string, LucideIcons.LucideIcon>)[key] ||
      (LucideIcons as unknown as Record<string, LucideIcons.LucideIcon>)[content.name] ||
      LucideIcons.HelpCircle;

    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
        <IconComponent color={color} size="100%" strokeWidth={1.5} />
      </div>
    );
  }

  // ── Iconify sets (simple-icons, mdi, ph, tabler, etc.) ───────────────────
  // If the name already contains a colon prefix (e.g. "mdi:home") use as-is.
  // Otherwise auto-prefix with the selected set.
  const iconifyName = content.name.includes(':')
    ? content.name
    : `${set}:${content.name}`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconEl = 'iconify-icon' as any;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
      <IconEl icon={iconifyName} style={{ fontSize: size, color, width: '100%', height: '100%' }} />
    </div>
  );
}
