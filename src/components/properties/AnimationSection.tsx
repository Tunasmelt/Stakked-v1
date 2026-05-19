'use client';

import React, { useState, useRef } from 'react';
import { StakkedElement } from '@/types/element';
import { Animation } from '@/types/animation';
import { useProjectStore } from '@/stores/project-store';
import { NumberInput, Select, Toggle } from '@/components/ui/Primitives';
import {
  PRESET_LIST,
  getAnimationCSS,
  defaultAnimation,
  AnimationPresetId,
} from '@/lib/animation-engine';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Zap } from 'lucide-react';
import styles from '@/styles/PropertiesPanel.module.css';

interface Props {
  element: StakkedElement;
  pageIndex: number;
}

export default function AnimationSection({ element, pageIndex }: Props) {
  const updateElement = useProjectStore((s) => s.updateElement);
  const anim = element.animations?.[0]; // single-animation editing for MVP
  const testRef = useRef<HTMLDivElement>(null);

  // Cleanup injected test style on unmount
  React.useEffect(() => {
    return () => {
      if (anim) {
        const styleEl = document.getElementById(`anim-test-${anim.id}`);
        styleEl?.remove();
      }
    };
  }, [anim?.id]);

  const setAnim = (patch: Partial<Animation>) => {
    if (!anim) return;
    const next = { ...anim, ...patch };
    updateElement(pageIndex, element.id, { animations: [next] });
  };

  const enableAnimation = () => {
    updateElement(pageIndex, element.id, { animations: [defaultAnimation('fadeIn')] });
  };

  const removeAnimation = () => {
    if (anim) {
      document.getElementById(`anim-test-${anim.id}`)?.remove();
    }
    updateElement(pageIndex, element.id, { animations: [] });
  };

  const handleTest = () => {
    if (!anim || !testRef.current) return;
    const { css, className } = getAnimationCSS(anim);

    const styleId = `anim-test-${anim.id}`;
    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = css;

    const target = testRef.current;
    target.classList.remove(className);
    void target.offsetWidth; // force reflow so the class re-application restarts the animation
    target.classList.add(className);
  };

  if (!anim) {
    return (
      <div className={styles.sectionInner}>
        <button
          onClick={enableAnimation}
          style={{
            padding: '10px 12px',
            width: '100%',
            borderRadius: 'var(--r-md)',
            border: '1px dashed color-mix(in oklab, var(--accent) 30%, transparent)',
            background: 'color-mix(in oklab, var(--accent) 10%, transparent)',
            color: 'var(--accent)',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            cursor: 'pointer',
          }}
        >
          + Add animation
        </button>
      </div>
    );
  }

  const preset = PRESET_LIST.find((p) => p.id === anim.type) ?? PRESET_LIST[0];

  return (
    <div className={styles.sectionInner}>
      <Select
        label="Trigger"
        value={anim.trigger}
        options={[
          { label: 'On Load', value: 'onLoad' },
          { label: 'While In View', value: 'whileInView' },
          { label: 'On Hover', value: 'onHover' },
          { label: 'On Click', value: 'onClick' },
        ]}
        onChange={(v) => setAnim({ trigger: v as Animation['trigger'] })}
      />

      <div style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Zap size={12} color="var(--accent)" />
          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-bright)' }}>Preset</label>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
          {PRESET_LIST.map((p) => (
            <button
              key={p.id}
              onClick={() => setAnim({ type: p.id as AnimationPresetId })}
              className={`${styles.presetBtn} ${anim.type === p.id ? styles.presetActive : ''}`}
              title={p.label}
            >
              <div className={styles.presetDot} />
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {preset.directional && (
        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 10, color: 'var(--text-mute)', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>Direction</label>
          <div style={{ display: 'flex', gap: 4 }}>
            {[
              { id: 'up', icon: <ArrowUp size={12} /> },
              { id: 'down', icon: <ArrowDown size={12} /> },
              { id: 'left', icon: <ArrowLeft size={12} /> },
              { id: 'right', icon: <ArrowRight size={12} /> },
            ].map((dir) => (
              <button
                key={dir.id}
                onClick={() => setAnim({ direction: dir.id as Animation['direction'] })}
                style={{
                  flex: 1,
                  padding: '6px',
                  borderRadius: 'var(--r-sm)',
                  border: '1px solid',
                  borderColor: anim.direction === dir.id ? 'var(--accent)' : 'var(--line)',
                  background: anim.direction === dir.id ? 'color-mix(in oklab, var(--accent) 15%, transparent)' : 'var(--surface)',
                  color: anim.direction === dir.id ? 'var(--accent)' : 'var(--text-mute)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                {dir.icon}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={styles.grid2} style={{ marginTop: 10 }}>
        <NumberInput
          label="Duration (ms)"
          min={50}
          max={20000}
          step={50}
          value={anim.duration}
          onChange={(duration) => setAnim({ duration })}
        />
        <NumberInput
          label="Delay (ms)"
          min={0}
          max={20000}
          step={50}
          value={anim.delay}
          onChange={(delay) => setAnim({ delay })}
        />
      </div>

      <div style={{ marginTop: 10 }}>
        <Select
          label="Easing"
          value={anim.easing}
          options={[
            { label: 'Linear', value: 'linear' },
            { label: 'Ease', value: 'ease' },
            { label: 'Ease In', value: 'ease-in' },
            { label: 'Ease Out', value: 'ease-out' },
            { label: 'Ease In-Out', value: 'ease-in-out' },
            { label: 'Spring', value: 'spring' },
            { label: 'Bounce', value: 'bounce' },
          ]}
          onChange={(v) => setAnim({ easing: v as Animation['easing'] })}
        />
      </div>

      <div className={styles.grid2} style={{ marginTop: 10 }}>
        <NumberInput
          label="Repeat (0 = ∞)"
          min={0}
          max={1000}
          value={anim.repeat}
          onChange={(repeat) => setAnim({ repeat })}
        />
        <NumberInput
          label="Stagger (ms)"
          min={0}
          max={2000}
          value={anim.stagger ?? 0}
          onChange={(stagger) => setAnim({ stagger })}
        />
      </div>

      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <button
          onClick={handleTest}
          style={{
            flex: 1,
            padding: '8px',
            borderRadius: 'var(--r-sm)',
            border: 'none',
            background: 'var(--accent)',
            color: 'var(--accent-ink)',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            cursor: 'pointer',
          }}
        >
          ▶ Test
        </button>
        <button
          onClick={removeAnimation}
          style={{
            flex: 1,
            padding: '8px',
            borderRadius: 'var(--r-sm)',
            border: '1px solid color-mix(in oklab, var(--danger) 40%, transparent)',
            background: 'color-mix(in oklab, var(--danger) 10%, transparent)',
            color: 'var(--danger)',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            cursor: 'pointer',
          }}
        >
          Remove
        </button>
      </div>

      <div
        ref={testRef}
        style={{
          marginTop: 12,
          height: 60,
          borderRadius: 'var(--r-md)',
          border: '1px dashed var(--line)',
          background: 'var(--surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          color: 'var(--text-mute)',
        }}
      >
        {anim.type} preview
      </div>

      {anim.type === 'custom' && <CustomKeyframesEditor anim={anim} setAnim={setAnim} />}
    </div>
  );
}

function CustomKeyframesEditor({
  anim,
  setAnim,
}: {
  anim: Animation;
  setAnim: (p: Partial<Animation>) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const frames = anim.keyframes ?? [];

  const addFrame = () => {
    setAnim({ keyframes: [...frames, { offset: 1, style: {} }] });
  };
  const updateFrame = (i: number, patch: Partial<(typeof frames)[number]>) => {
    setAnim({ keyframes: frames.map((f, idx) => (idx === i ? { ...f, ...patch } : f)) });
  };
  const removeFrame = (i: number) => {
    setAnim({ keyframes: frames.filter((_, idx) => idx !== i) });
  };

  const parseStyleJson = (raw: string): Record<string, string | number> | null => {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, string | number>;
      }
    } catch {
      /* swallow — user is still typing */
    }
    return null;
  };

  return (
    <div style={{ marginTop: 12 }}>
      <Toggle label="Custom Keyframes" checked={expanded} onChange={setExpanded} />
      {expanded && (
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {frames.map((f, i) => (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: '60px 1fr auto',
                gap: 6,
                alignItems: 'flex-start',
                padding: 6,
                border: '1px solid var(--line)',
                borderRadius: 'var(--r-sm)',
                background: 'var(--surface)',
              }}
            >
              <input
                type="number"
                min={0}
                max={1}
                step={0.05}
                value={f.offset}
                onChange={(e) =>
                  updateFrame(i, { offset: Math.min(1, Math.max(0, Number(e.target.value))) })
                }
                style={{
                  padding: '4px 6px',
                  background: 'var(--bg-2)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--r-sm)',
                  color: 'var(--text)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                }}
                aria-label="Keyframe offset (0-1)"
              />
              <textarea
                defaultValue={JSON.stringify(f.style, null, 0)}
                onBlur={(e) => {
                  const parsed = parseStyleJson(e.target.value);
                  if (parsed) updateFrame(i, { style: parsed });
                }}
                placeholder={'{"opacity":1,"transform":"translateY(0)"}'}
                rows={2}
                style={{
                  padding: '4px 6px',
                  background: 'var(--bg-2)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--r-sm)',
                  color: 'var(--text)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  resize: 'vertical',
                }}
                aria-label={`Keyframe ${i + 1} style JSON`}
              />
              <button
                onClick={() => removeFrame(i)}
                title="Remove keyframe"
                style={{
                  padding: '4px 6px',
                  borderRadius: 'var(--r-sm)',
                  border: '1px solid color-mix(in oklab, var(--danger) 40%, transparent)',
                  background: 'transparent',
                  color: 'var(--danger)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={addFrame}
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--r-sm)',
              border: '1px dashed var(--line-2)',
              background: 'transparent',
              color: 'var(--text-mute)',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            + Add keyframe
          </button>
        </div>
      )}
    </div>
  );
}
