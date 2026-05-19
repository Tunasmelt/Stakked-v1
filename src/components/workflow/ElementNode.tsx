/* src/components/workflow/ElementNode.tsx */
'use client';

import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import {
  Type, Image, MousePointerClick, Music2, Video, Minus, Code2, Grid3X3,
  Timer, Star, Square, Box, Menu, FormInput, Map, MessageSquare, Repeat,
  ChevronDown, Layers, Pencil, PenLine, Link2
} from 'lucide-react';
import { ElementType } from '@/types/element';
import styles from '@/styles/Workflow.module.css';

const ICON_MAP: Record<ElementType, React.ReactNode> = {
  text:        <Type size={12} />,
  image:       <Image size={12} />,
  button:      <MousePointerClick size={12} />,
  'social-link': <Link2 size={12} />,
  'music-player': <Music2 size={12} />,
  video:       <Video size={12} />,
  divider:     <Minus size={12} />,
  embed:       <Code2 size={12} />,
  gallery:     <Grid3X3 size={12} />,
  countdown:   <Timer size={12} />,
  icon:        <Star size={12} />,
  shape:       <Square size={12} />,
  container:   <Box size={12} />,
  navigation:  <Menu size={12} />,
  form:        <FormInput size={12} />,
  map:         <Map size={12} />,
  testimonial: <MessageSquare size={12} />,
  marquee:     <Repeat size={12} />,
  accordion:   <ChevronDown size={12} />,
  tabs:        <Layers size={12} />,
  line:        <PenLine size={12} />,
  drawing:     <Pencil size={12} />,
};

const TYPE_COLOR: Record<string, string> = {
  text: '#60a5fa',
  image: '#a78bfa',
  button: '#34d399',
  'social-link': '#f472b6',
  'music-player': '#fb923c',
  video: '#facc15',
  shape: '#94a3b8',
  container: '#6b7280',
  form: '#22d3ee',
  navigation: '#f87171',
};

interface ElementNodeProps {
  data: {
    label: string;
    elementType: ElementType;
    behaviorCount: number;
    isSource: boolean;
    isTarget: boolean;
  };
  selected?: boolean;
}

export const ElementNode = memo(({ data, selected }: ElementNodeProps) => {
  const color = TYPE_COLOR[data.elementType] ?? 'var(--text-mute)';
  const icon = ICON_MAP[data.elementType] ?? <Square size={12} />;

  return (
    <div className={`${styles.elementNode} ${selected ? styles.selected : ''}`}>
      {/* Source handle — right side (for triggering actions) */}
      <Handle
        type="source"
        position={Position.Right}
        className={styles.handle}
        style={{ background: color }}
      />

      {/* Target handle — left side (for receiving actions) */}
      <Handle
        type="target"
        position={Position.Left}
        className={styles.handle}
        style={{ background: color }}
      />

      {/* Node header */}
      <div className={styles.elementNodeHeader} style={{ borderLeftColor: color }}>
        <span className={styles.elementNodeIcon} style={{ color }}>
          {icon}
        </span>
        <div className={styles.elementNodeInfo}>
          <div className={styles.elementNodeName}>{data.label}</div>
          <div className={styles.elementNodeType}>{data.elementType}</div>
        </div>
        {data.behaviorCount > 0 && (
          <div className={styles.behaviorBadge}>{data.behaviorCount}</div>
        )}
      </div>
    </div>
  );
});

ElementNode.displayName = 'ElementNode';
