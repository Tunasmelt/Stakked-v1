/* src/components/workflow/LogicNode.tsx */
'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { GitBranch, ShieldCheck } from 'lucide-react';
import { useProjectStore } from '@/stores/project-store';
import styles from '@/styles/Workflow.module.css';

export const LogicNode = memo(({ id, data, selected }: NodeProps) => {
  const project = useProjectStore(s => s.project);
  const updateWorkflowNodes = useProjectStore(s => s.updateWorkflowNodes);

  const variables = project?.settings.variables || {};
  const variableNames = Object.keys(variables);

  const updateNodeData = (updates: Record<string, string | number | boolean>) => {
    if (!project?.workflow) return;
    const newNodes = project.workflow.nodes.map(n => {
      if (n.id === id) {
        return { ...n, data: { ...n.data, ...updates } };
      }
      return n;
    });
    updateWorkflowNodes(newNodes);
  };

  return (
    <div className={`${styles.logicNode} ${selected ? styles.selected : ''}`}>
      <Handle type="target" position={Position.Left} className={styles.handle} />
      
      <div className={styles.nodeHeader}>
        <GitBranch size={12} className={styles.logicIcon} />
        <span className={styles.nodeTitle}>{data.label || 'Logic Gate'}</span>
        <div className={styles.nodeMeta}>IF</div>
      </div>
      
      <div className={styles.logicSettings}>
        <select 
          className={styles.logicSelect} 
          value={data.variable || ''} 
          onChange={(e) => updateNodeData({ variable: e.target.value })}
        >
          <option value="">Select variable...</option>
          {variableNames.map(v => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>

        <div className={styles.logicOperator}>
          <span>==</span>
          <input 
            type="text" 
            placeholder="value" 
            className={styles.logicInput}
            value={data.value || ''}
            onChange={(e) => updateNodeData({ value: e.target.value })}
          />
        </div>
      </div>

      <div className={styles.logicBody}>
        <div className={styles.logicRow}>
          <ShieldCheck size={10} color="var(--ok)" />
          <span>True</span>
          <Handle type="source" position={Position.Right} id="true" className={styles.handle} style={{ top: '35%', background: 'var(--ok)' }} />
        </div>
        <div className={styles.logicRow}>
          <span style={{ color: 'var(--danger)', fontSize: 14, fontStyle: 'normal', lineHeight: 1 }}>×</span>
          <span>False</span>
          <Handle type="source" position={Position.Right} id="false" className={styles.handle} style={{ top: '65%', background: 'var(--danger)' }} />
        </div>
      </div>
    </div>
  );
});

LogicNode.displayName = 'LogicNode';
