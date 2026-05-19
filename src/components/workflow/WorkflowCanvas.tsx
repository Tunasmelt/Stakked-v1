/* src/components/workflow/WorkflowCanvas.tsx
 * Element Interaction Builder — links elements on the active page
 * to create triggers, animations, and CTA actions.
 */
'use client';

import React, { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Connection,
  Edge,
  Node,
  MarkerType,
  EdgeChange,
  NodeChange,
  Panel,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { v4 as uuidv4 } from 'uuid';
import { Zap, X, Trash2, MousePointerClick, ChevronRight } from 'lucide-react';

import { useProjectStore } from '@/stores/project-store';
import { ElementNode } from './ElementNode';
import { InteractionTrigger, InteractionAction, ElementBehavior } from '@/types/element';
import styles from '@/styles/Workflow.module.css';

const nodeTypes = { elementNode: ElementNode };

const TRIGGERS: { value: InteractionTrigger; label: string }[] = [
  { value: 'onClick',        label: 'On Click' },
  { value: 'onMouseEnter',   label: 'On Hover In' },
  { value: 'onMouseLeave',   label: 'On Hover Out' },
  { value: 'onScrollIntoView', label: 'On Scroll Into View' },
  { value: 'onInterval',     label: 'On Interval' },
];

const ACTIONS: { value: InteractionAction; label: string; desc: string }[] = [
  { value: 'animate',      label: 'Animate',        desc: 'Play a CSS animation on the target element' },
  { value: 'showHide',     label: 'Show / Hide',    desc: 'Toggle visibility of the target element' },
  { value: 'navigate',     label: 'Navigate',       desc: 'Jump to another page or URL' },
  { value: 'playPause',    label: 'Play / Pause',   desc: 'Control a media element (video/audio)' },
  { value: 'setGlobalState', label: 'Set Variable', desc: 'Update a global state variable' },
  { value: 'emitEvent',    label: 'Emit Event',     desc: 'Fire a custom event for scripts to listen to' },
];

const ANIMATE_TYPES = ['fadeIn', 'fadeOut', 'slideIn', 'slideOut', 'bounce', 'pulse', 'shake', 'spin', 'flip', 'zoom'];


interface ConfigPanelProps {
  behavior: ElementBehavior;
  sourceLabel: string;
  targetLabel: string;
  onUpdate: (updates: Partial<ElementBehavior>) => void;
  onDelete: () => void;
  onClose: () => void;
}

function ConfigPanel({ behavior, sourceLabel, targetLabel, onUpdate, onDelete, onClose }: ConfigPanelProps) {
  return (
    <div className={styles.configPanel}>
      <div className={styles.configHeader}>
        <div className={styles.configTitle}>
          <Zap size={13} className={styles.configIcon} />
          Interaction
        </div>
        <button className={styles.configClose} onClick={onClose}><X size={13} /></button>
      </div>

      <div className={styles.configFlow}>
        <div className={styles.configNode}>{sourceLabel}</div>
        <ChevronRight size={12} className={styles.configArrow} />
        <div className={styles.configNode}>{targetLabel}</div>
      </div>

      <div className={styles.configBody}>
        {/* Trigger */}
        <div className={styles.configField}>
          <label className={styles.configLabel}>Trigger</label>
          <select
            className={styles.configSelect}
            value={behavior.trigger}
            onChange={e => onUpdate({ trigger: e.target.value as InteractionTrigger })}
          >
            {TRIGGERS.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          {behavior.trigger === 'onInterval' && (
            <input
              className={styles.configInput}
              type="number"
              placeholder="Interval (ms)"
              value={(behavior.params.interval as number) ?? 1000}
              onChange={e => onUpdate({ params: { ...behavior.params, interval: Number(e.target.value) } })}
            />
          )}
        </div>

        {/* Action */}
        <div className={styles.configField}>
          <label className={styles.configLabel}>Action</label>
          <select
            className={styles.configSelect}
            value={behavior.action}
            onChange={e => onUpdate({ action: e.target.value as InteractionAction })}
          >
            {ACTIONS.map(a => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>
          <span className={styles.configDesc}>
            {ACTIONS.find(a => a.value === behavior.action)?.desc}
          </span>
        </div>

        {/* Action-specific params */}
        {behavior.action === 'animate' && (
          <div className={styles.configField}>
            <label className={styles.configLabel}>Animation Type</label>
            <select
              className={styles.configSelect}
              value={(behavior.params.animationType as string) ?? 'fadeIn'}
              onChange={e => onUpdate({ params: { ...behavior.params, animationType: e.target.value } })}
            >
              {ANIMATE_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <label className={styles.configLabel} style={{ marginTop: 8 }}>Duration (ms)</label>
            <input
              className={styles.configInput}
              type="number"
              value={(behavior.params.duration as number) ?? 600}
              onChange={e => onUpdate({ params: { ...behavior.params, duration: Number(e.target.value) } })}
            />
          </div>
        )}

        {behavior.action === 'navigate' && (
          <div className={styles.configField}>
            <label className={styles.configLabel}>URL or Page Slug</label>
            <input
              className={styles.configInput}
              placeholder="/page-2 or https://..."
              value={(behavior.params.url as string) ?? ''}
              onChange={e => onUpdate({ params: { ...behavior.params, url: e.target.value } })}
            />
          </div>
        )}

        {behavior.action === 'setGlobalState' && (
          <div className={styles.configField}>
            <label className={styles.configLabel}>Variable Name</label>
            <input
              className={styles.configInput}
              placeholder="myVar"
              value={(behavior.params.varName as string) ?? ''}
              onChange={e => onUpdate({ params: { ...behavior.params, varName: e.target.value } })}
            />
            <label className={styles.configLabel} style={{ marginTop: 8 }}>New Value</label>
            <input
              className={styles.configInput}
              placeholder="true / 42 / hello"
              value={(behavior.params.varValue as string) ?? ''}
              onChange={e => onUpdate({ params: { ...behavior.params, varValue: e.target.value } })}
            />
          </div>
        )}

        {behavior.action === 'emitEvent' && (
          <div className={styles.configField}>
            <label className={styles.configLabel}>Event Name</label>
            <input
              className={styles.configInput}
              placeholder="my-custom-event"
              value={(behavior.params.eventName as string) ?? ''}
              onChange={e => onUpdate({ params: { ...behavior.params, eventName: e.target.value } })}
            />
          </div>
        )}
      </div>

      <div className={styles.configFooter}>
        <button className={styles.configDelete} onClick={onDelete}>
          <Trash2 size={12} />
          Remove interaction
        </button>
      </div>
    </div>
  );
}

// Inner component that uses ReactFlow hooks
function WorkflowInner() {
  const project = useProjectStore(s => s.project);
  const activePageIndex = useProjectStore(s => s.activePageIndex);
  const updateElement = useProjectStore(s => s.updateElement);

  // Track local node positions (separate from project data)
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});

  // Selected edge for config panel
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  const page = project?.pages[activePageIndex];
  const elements = useMemo(() => page?.elements ?? [], [page]);

  // Build nodes from elements
  const nodes: Node[] = useMemo(() => {
    const cols = Math.max(1, Math.ceil(Math.sqrt(elements.length)));
    return elements.map((el, idx) => {
      const defaultX = (idx % cols) * 220 + 40;
      const defaultY = Math.floor(idx / cols) * 120 + 40;
      return {
        id: el.id,
        type: 'elementNode',
        position: nodePositions[el.id] ?? { x: defaultX, y: defaultY },
        data: {
          label: el.name || el.type,
          elementType: el.type,
          behaviorCount: el.behaviors?.length ?? 0,
          isSource: (el.behaviors?.length ?? 0) > 0,
          isTarget: elements.some(e => e.behaviors?.some(b => b.targetId === el.id)),
        },
      };
    });
  }, [elements, nodePositions]);

  // Build edges from behaviors
  const edges: Edge[] = useMemo(() => {
    const result: Edge[] = [];
    elements.forEach(el => {
      (el.behaviors ?? []).forEach(bh => {
        if (!bh.targetId) return;
        result.push({
          id: `bh-${el.id}-${bh.id}`,
          source: el.id,
          target: bh.targetId,
          label: `${TRIGGERS.find(t => t.value === bh.trigger)?.label ?? bh.trigger} → ${ACTIONS.find(a => a.value === bh.action)?.label ?? bh.action}`,
          animated: bh.action === 'animate',
          style: { stroke: 'var(--accent)', strokeWidth: 1.5 },
          labelStyle: { fill: 'var(--text-mute)', fontSize: 10, fontFamily: 'var(--font-mono)' },
          labelBgStyle: { fill: 'var(--bg-2)', fillOpacity: 0.9 },
          markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--accent)' },
          data: { elementId: el.id, behaviorId: bh.id },
        });
      });
    });
    return result;
  }, [elements]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    changes.forEach(change => {
      if (change.type === 'position' && change.position) {
        setNodePositions(prev => ({
          ...prev,
          [change.id]: change.position!,
        }));
      }
    });
    // Also handle selection etc via applyNodeChanges if needed
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    changes.forEach(change => {
      if (change.type === 'remove') {
        const edge = edges.find(e => e.id === change.id);
        if (edge?.data?.elementId) {
          const { elementId, behaviorId } = edge.data;
          const el = elements.find(e => e.id === elementId);
          if (el) {
            updateElement(activePageIndex, elementId, {
              behaviors: (el.behaviors ?? []).filter(b => b.id !== behaviorId),
            });
          }
          if (selectedEdgeId === change.id) setSelectedEdgeId(null);
        }
      }
    });
  }, [edges, elements, activePageIndex, updateElement, selectedEdgeId]);

  const onConnect = useCallback((params: Connection | Edge) => {
    if (!params.source || !params.target) return;
    if (params.source === params.target) return;

    // Create default behavior immediately
    const newBehavior: ElementBehavior = {
      id: uuidv4(),
      trigger: 'onClick',
      action: 'animate',
      targetId: params.target,
      params: { animationType: 'fadeIn', duration: 600 },
    };

    const el = elements.find(e => e.id === params.source);
    if (!el) return;

    updateElement(activePageIndex, el.id, {
      behaviors: [...(el.behaviors ?? []), newBehavior],
    });

    // Select the new edge
    const newEdgeId = `bh-${params.source}-${newBehavior.id}`;
    setTimeout(() => setSelectedEdgeId(newEdgeId), 50);
  }, [elements, activePageIndex, updateElement]);

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    setSelectedEdgeId(edge.id);
  }, []);

  // Find selected behavior from selected edge
  const selectedEdge = edges.find(e => e.id === selectedEdgeId);
  const selectedEl = selectedEdge ? elements.find(e => e.id === selectedEdge.data?.elementId) : null;
  const selectedBehavior = selectedEl?.behaviors?.find(b => b.id === selectedEdge?.data?.behaviorId) ?? null;
  const targetEl = selectedBehavior?.targetId ? elements.find(e => e.id === selectedBehavior!.targetId) : null;

  const handleBehaviorUpdate = useCallback((updates: Partial<ElementBehavior>) => {
    if (!selectedEl || !selectedBehavior) return;
    updateElement(activePageIndex, selectedEl.id, {
      behaviors: (selectedEl.behaviors ?? []).map(b =>
        b.id === selectedBehavior!.id ? { ...b, ...updates } : b
      ),
    });
  }, [selectedEl, selectedBehavior, activePageIndex, updateElement]);

  const handleBehaviorDelete = useCallback(() => {
    if (!selectedEl || !selectedBehavior) return;
    updateElement(activePageIndex, selectedEl.id, {
      behaviors: (selectedEl.behaviors ?? []).filter(b => b.id !== selectedBehavior!.id),
    });
    setSelectedEdgeId(null);
  }, [selectedEl, selectedBehavior, activePageIndex, updateElement]);

  if (!project || !page) return (
    <div className={styles.emptyWorkflow}>
      <MousePointerClick size={32} />
      <span>Open a project to view interactions</span>
    </div>
  );

  if (elements.length === 0) return (
    <div className={styles.emptyWorkflow}>
      <Zap size={32} />
      <span>Add elements to the canvas to wire up interactions</span>
    </div>
  );

  return (
    <div className={styles.workflowContainer}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeClick={onEdgeClick}
        onPaneClick={() => setSelectedEdgeId(null)}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={{
          animated: false,
          style: { stroke: 'var(--accent)', strokeWidth: 1.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--accent)' },
        }}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        snapToGrid
        snapGrid={[16, 16]}
        minZoom={0.3}
        maxZoom={2}
        deleteKeyCode="Delete"
      >
        <Background color="var(--line)" gap={20} size={1} />
        <Controls className={styles.controls} />

        {/* Top-left info panel */}
        <Panel position="top-left" className={styles.panel}>
          <div className={styles.panelRow}>
            <div className={styles.chip}>Interactions</div>
            <span className={styles.caption}>{elements.length} elements · {edges.length} links</span>
          </div>
          <span className={styles.caption}>
            {'// drag from element handle → drop on another to link'}
          </span>
        </Panel>

        {/* Legend */}
        <Panel position="bottom-left" className={styles.legend}>
          <div className={styles.legendRow}>
            <div className={styles.legendDot} style={{ background: 'var(--accent)' }} />
            <span>Source handle → drag to create trigger</span>
          </div>
          <div className={styles.legendRow}>
            <div className={styles.legendDot} style={{ background: 'var(--line-2)' }} />
            <span>Target handle ← receives the action</span>
          </div>
        </Panel>
      </ReactFlow>

      {/* Right-side config panel for selected edge */}
      {selectedEdge && selectedEl && selectedBehavior && (
        <ConfigPanel
          behavior={selectedBehavior}
          sourceLabel={selectedEl.name || selectedEl.type}
          targetLabel={targetEl?.name || targetEl?.type || 'unknown'}
          onUpdate={handleBehaviorUpdate}
          onDelete={handleBehaviorDelete}
          onClose={() => setSelectedEdgeId(null)}
        />
      )}
    </div>
  );
}

// Exported wrapper that provides the ReactFlow context
export function WorkflowCanvas() {
  return (
    <ReactFlowProvider>
      <WorkflowInner />
    </ReactFlowProvider>
  );
}
