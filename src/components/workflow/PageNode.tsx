/* src/components/workflow/PageNode.tsx */
'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { FileText, ExternalLink } from 'lucide-react';
import styles from '@/styles/Workflow.module.css';
import { useProjectStore } from '@/stores/project-store';
import { StakkedPage } from '@/types/project';

const EMPTY_PAGES: StakkedPage[] = [];

export const PageNode = memo(({ data, selected }: NodeProps) => {
  const setActivePageIndex = useProjectStore(s => s.setActivePageIndex);
  const pages = useProjectStore(s => s.project?.pages ?? EMPTY_PAGES);
  
  const handleEdit = () => {
    const idx = pages.findIndex(p => p.id === data.pageId);
    if (idx !== -1) setActivePageIndex(idx);
  };

  return (
    <div className={`${styles.pageNode} ${data.isActive ? styles.active : ''} ${selected ? styles.selected : ''}`}>
      <Handle type="target" position={Position.Top} className={styles.handle} />
      
      <div className={styles.nodeHeader}>
        <FileText size={12} className={styles.nodeIcon} />
        <span className={styles.nodeTitle}>{data.label}</span>
      </div>
      
      <div className={styles.nodeBody}>
        <button
          className={styles.nodeAction}
          onClick={(e) => { e.stopPropagation(); handleEdit(); }}
        >
          <ExternalLink size={10} />
          Edit page
        </button>
      </div>

      <Handle type="source" position={Position.Bottom} className={styles.handle} />
    </div>
  );
});

PageNode.displayName = 'PageNode';