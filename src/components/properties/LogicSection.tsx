/* src/components/properties/LogicSection.tsx */
'use client';

import React from 'react';
import { Plus, Trash2, Zap } from 'lucide-react';
import { useProjectStore } from '@/stores/project-store';
import {
  StakkedElement,
  InteractionTrigger,
  InteractionAction,
  ElementBehavior,
} from '@/types/element';
import { v4 as uuidv4 } from 'uuid';
import styles from '@/styles/PropertiesPanel.module.css';

interface Props {
  element: StakkedElement;
  pageIndex: number;
}

const TRIGGER_OPTIONS: { value: InteractionTrigger; label: string }[] = [
  { value: 'onClick',          label: 'On Click' },
  { value: 'onMouseEnter',     label: 'On Hover In' },
  { value: 'onMouseLeave',     label: 'On Hover Out' },
  { value: 'onScrollIntoView', label: 'On Scroll Into View' },
  { value: 'onInterval',       label: 'On Interval' },
];

const ACTION_OPTIONS: { value: InteractionAction; label: string }[] = [
  { value: 'navigate',       label: 'Navigate' },
  { value: 'setGlobalState', label: 'Set Variable' },
  { value: 'showHide',       label: 'Show / Hide element' },
  { value: 'playPause',      label: 'Play / Pause media' },
  { value: 'animate',        label: 'Trigger animation' },
  { value: 'emitEvent',      label: 'Emit custom event' },
];

export default function LogicSection({ element, pageIndex }: Props) {
  const updateElement = useProjectStore((s) => s.updateElement);
  // Read all pages so we can show a page-name picker instead of raw UUIDs
  const pages = useProjectStore((s) => s.project?.pages ?? []);
  // All elements on the current page — used for the showHide target picker
  const pageElements = useProjectStore((s) => s.project?.pages[pageIndex]?.elements ?? []);
  const behaviors = element.behaviors || [];

  const handleAddBehavior = () => {
    const newBehavior: ElementBehavior = {
      id: uuidv4(),
      trigger: 'onClick',
      action: 'navigate',
      params: {},
    };
    updateElement(pageIndex, element.id, { behaviors: [...behaviors, newBehavior] });
  };

  const handleUpdateBehavior = (id: string, updates: Partial<ElementBehavior>) => {
    const next = behaviors.map((b) => (b.id === id ? { ...b, ...updates } : b));
    updateElement(pageIndex, element.id, { behaviors: next });
  };

  const handleRemoveBehavior = (id: string) => {
    updateElement(pageIndex, element.id, {
      behaviors: behaviors.filter((b) => b.id !== id),
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {behaviors.length === 0 && (
        <p style={{ fontSize: 11, color: 'var(--text-mute)', margin: 0, fontStyle: 'italic' }}>
          No behaviors yet — click + Add Behavior below.
        </p>
      )}

      <div className={styles.behaviorsList}>
        {behaviors.map((behavior) => (
          <div key={behavior.id} className={styles.behaviorRow}>
            {/* ── Row header: trigger → action + delete ── */}
            <div className={styles.behaviorHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Zap size={10} color="var(--accent, #3b82f6)" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-mute)' }}>
                  {behavior.trigger}
                </span>
                <span className={styles.arrow} style={{ fontSize: 10, opacity: 0.4 }}>→</span>
                <span className={styles.actionTag}>{behavior.action}</span>
              </div>
              <button
                className={styles.iconBtn}
                onClick={() => handleRemoveBehavior(behavior.id)}
                title="Remove behavior"
                style={{ color: 'var(--text-mute)' }}
              >
                <Trash2 size={11} />
              </button>
            </div>

            {/* ── Trigger + Action selects ── */}
            <div className={styles.grid2}>
              <div className={styles.field}>
                <label className={styles.label}>Trigger</label>
                <select
                  className={styles.select}
                  value={behavior.trigger}
                  onChange={(e) =>
                    handleUpdateBehavior(behavior.id, {
                      trigger: e.target.value as InteractionTrigger,
                    })
                  }
                >
                  {TRIGGER_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Action</label>
                <select
                  className={styles.select}
                  value={behavior.action}
                  onChange={(e) =>
                    // Clear old params when switching action type
                    handleUpdateBehavior(behavior.id, {
                      action: e.target.value as InteractionAction,
                      params: {},
                      targetId: undefined,
                    })
                  }
                >
                  {ACTION_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* ── navigate: page picker + optional external URL ── */}
            {behavior.action === 'navigate' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div className={styles.field}>
                  <label className={styles.label}>Destination</label>
                  <select
                    className={styles.select}
                    value={
                      typeof behavior.params.targetId === 'string'
                        ? behavior.params.targetId
                        : ''
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      handleUpdateBehavior(behavior.id, {
                        params: {
                          ...behavior.params,
                          // '__url__' is a sentinel — don't store it as targetId
                          // because useInteractivity routes on targetId first.
                          // Leaving targetId undefined forces the url branch.
                          targetId: val === '__url__' ? undefined : (val || undefined),
                          url: val === '__url__' ? (behavior.params.url ?? '') : undefined,
                        },
                      });
                    }}
                  >
                    <option value="">— choose page —</option>
                    {pages.map((p) => (
                      <option key={p.id} value={`page-${p.id}`}>
                        {p.title}
                      </option>
                    ))}
                    <option value="__url__">External URL…</option>
                  </select>
                </div>

                {behavior.params.url !== undefined && (
                  <div className={styles.field}>
                    <label className={styles.label}>URL</label>
                    <input
                      className={styles.input}
                      type="text"
                      value={String(behavior.params.url ?? '')}
                      placeholder="https://…"
                      onChange={(e) =>
                        handleUpdateBehavior(behavior.id, {
                          params: { ...behavior.params, url: e.target.value },
                        })
                      }
                    />
                  </div>
                )}
              </div>
            )}

            {/* ── showHide: target element picker ── */}
            {behavior.action === 'showHide' && (
              <div className={styles.field}>
                <label className={styles.label}>Target element</label>
                <select
                  className={styles.select}
                  value={behavior.targetId ?? ''}
                  onChange={(e) =>
                    handleUpdateBehavior(behavior.id, { targetId: e.target.value || undefined })
                  }
                >
                  <option value="">— choose element —</option>
                  {pageElements
                    .filter((el) => el.id !== element.id) // can't toggle yourself
                    .map((el) => (
                      <option key={el.id} value={el.id}>
                        {el.type} · {el.id.slice(0, 8)}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {/* ── setGlobalState: variable key + value ── */}
            {behavior.action === 'setGlobalState' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div className={styles.grid2}>
                  <div className={styles.field}>
                    <label className={styles.label}>Variable</label>
                    <input
                      className={styles.input}
                      type="text"
                      value={String(behavior.params.key ?? '')}
                      placeholder="isMenuOpen"
                      onChange={(e) =>
                        handleUpdateBehavior(behavior.id, {
                          params: { ...behavior.params, key: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Value</label>
                    <input
                      className={styles.input}
                      type="text"
                      value={String(behavior.params.value ?? '')}
                      placeholder="true"
                      onChange={(e) =>
                        handleUpdateBehavior(behavior.id, {
                          params: { ...behavior.params, value: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>
                <p style={{ fontSize: 10, color: 'var(--text-mute)', margin: 0 }}>
                  Use this variable in a Workflow Logic node to branch pages.
                </p>
              </div>
            )}

            {/* ── emitEvent: event name + optional JSON detail ── */}
            {behavior.action === 'emitEvent' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div className={styles.field}>
                  <label className={styles.label}>Event name</label>
                  <input
                    className={styles.input}
                    type="text"
                    value={String(behavior.params.eventName ?? '')}
                    placeholder="stakked:open-modal"
                    onChange={(e) =>
                      handleUpdateBehavior(behavior.id, {
                        params: { ...behavior.params, eventName: e.target.value },
                      })
                    }
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Detail (JSON, optional)</label>
                  <input
                    className={styles.input}
                    type="text"
                    value={String(behavior.params.detail ?? '')}
                    placeholder='{"key":"value"}'
                    onChange={(e) =>
                      handleUpdateBehavior(behavior.id, {
                        params: { ...behavior.params, detail: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
            )}

            {/* ── animate: informational only ── */}
            {behavior.action === 'animate' && (
              <p style={{ fontSize: 10, color: 'var(--text-mute)', margin: 0 }}>
                Re-plays this element&apos;s first animation on trigger.
              </p>
            )}

            {/* ── playPause: informational only ── */}
            {behavior.action === 'playPause' && (
              <p style={{ fontSize: 10, color: 'var(--text-mute)', margin: 0 }}>
                Toggles play/pause on the video or audio inside this element.
              </p>
            )}
          </div>
        ))}
      </div>

      <button className={styles.addBtn} onClick={handleAddBehavior}>
        <Plus size={13} /> Add Behavior
      </button>
    </div>
  );
}
