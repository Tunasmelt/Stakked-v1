'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Sparkles, X, Loader2, RotateCw, Check } from 'lucide-react';
import { useProjectStore } from '@/stores/project-store';
import { validateAILayoutResponse } from '@/lib/ai-validation';
import { StakkedElement } from '@/types/element';
import { defaultElement, ElementType } from '@/types/element';

type ProviderId = 'gemini' | 'groq';

interface ProvidersResponse {
  providers: ProviderId[];
  default: ProviderId | null;
  labels: Record<ProviderId, string>;
}

interface LayoutResponse {
  provider: ProviderId;
  model: string;
  elements: Array<Partial<StakkedElement> & { type: ElementType; name?: string; position: { x: number; y: number }; size: { width: number; height: number | 'auto' }; content: StakkedElement['content'] }>;
  theme?: string;
  reasoning?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  'music artist',
  'visual artist',
  'photographer',
  'designer',
  'creator portfolio',
  'landing page',
] as const;

/**
 * AIGenerateModal
 * ---------------
 * Opens a natural-language modal, POSTs to /api/ai/layout, validates the
 * response, then merges the generated elements onto the active page behind
 * an Accept / Regenerate / Cancel confirmation step.
 */
export default function AIGenerateModal({ open, onClose }: Props) {
  const activePageIndex  = useProjectStore((s) => s.activePageIndex);
  const project          = useProjectStore((s) => s.project);
  const batchAddElements = useProjectStore((s) => s.batchAddElements);

  const [providers, setProviders] = useState<ProvidersResponse | null>(null);
  const [provider, setProvider] = useState<ProviderId | ''>('');
  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState<string>('music artist');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<LayoutResponse | null>(null);
  const [stagedIds, setStagedIds] = useState<string[]>([]);

  // Load available providers on first open
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/ai/providers');
        if (!res.ok) throw new Error(`Providers discovery failed: ${res.status}`);
        const data = (await res.json()) as ProvidersResponse;
        if (cancelled) return;
        setProviders(data);
        if (data.default) setProvider(data.default);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to list providers');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  // Reset transient state when the dialog is closed
  useEffect(() => {
    if (!open) {
      setPrompt('');
      setError(null);
      setPreview(null);
      setStagedIds([]);
      setLoading(false);
    }
  }, [open]);

  const hasProviders = useMemo(() => (providers?.providers?.length ?? 0) > 0, [providers]);

  const applyPreviewToCanvas = (data: LayoutResponse) => {
    if (project == null) return [];

    // Build all elements first, then add them in a single commit so the entire
    // AI generation is one undo step (not N steps — one per element).
    const mergedElements: StakkedElement[] = data.elements.map((el) => {
      const scaffold = defaultElement(el.type);
      const pos = { x: el.position.x, y: el.position.y };
      const sz  = { width: el.size.width, height: el.size.height };
      return {
        ...scaffold,
        name: el.name ?? scaffold.name,
        position: pos,
        size: sz,
        // Keep style fields in sync for CSS export and responsive system
        style: {
          ...scaffold.style,
          position: { ...scaffold.style.position, ...pos },
          size: { ...scaffold.style.size, ...sz },
        },
        rotation: typeof el.rotation === 'number' ? el.rotation : 0,
        zIndex: typeof el.zIndex === 'number' ? el.zIndex : 1,
        visible: el.visible ?? true,
        locked: el.locked ?? false,
        content: el.content,
      } as StakkedElement;
    });

    return batchAddElements(activePageIndex, mergedElements);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Describe the page you want to generate.');
      return;
    }
    if (!hasProviders) {
      setError('No AI provider configured. Add GEMINI_API_KEY or GROQ_API_KEY to .env.local.');
      return;
    }

    setLoading(true);
    setError(null);
    setPreview(null);

    // Roll back previous preview if user is regenerating.
    // Remove all staged elements in a single Immer mutation so the rollback
    // lands as one undo entry, not N (one per removeElement call).
    if (stagedIds.length) {
      const ids = new Set(stagedIds);
      useProjectStore.getState().commit();
      useProjectStore.setState((s) => {
        const page = s.project?.pages[activePageIndex];
        if (page) page.elements = page.elements.filter((el) => !ids.has(el.id));
      });
      setStagedIds([]);
    }

    try {
      const res = await fetch('/api/ai/layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          category,
          provider: provider || undefined,
        }),
      });

      const body = await res.json();

      if (!res.ok) {
        setError(body?.error ?? `Request failed (${res.status})`);
        return;
      }

      const result = body as LayoutResponse;

      // Defensive client-side validation — mirrors the server-side Zod check
      const validation = validateAILayoutResponse(result);
      if (!validation.success) {
        setError(`AI generated an invalid layout: ${validation.error}`);
        return;
      }

      const ids = applyPreviewToCanvas(result);
      setStagedIds(ids);
      setPreview(result);
    } catch (err) {
      setError(
        `Generation failed: ${err instanceof Error ? err.message : 'Unknown error'}. ` +
        `Press Ctrl+Z / Cmd+Z to restore the previous canvas state.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = useCallback(() => {
    // Elements already live on the canvas; just clear the "staged" marker.
    setStagedIds([]);
    setPreview(null);
    onClose();
  }, [onClose]);

  const handleCancel = useCallback(() => {
    // Roll back all staged elements in a single Immer mutation — one undo entry,
    // not N separate ones (which is what calling removeElement() N times would do).
    if (stagedIds.length) {
      const ids = new Set(stagedIds);
      useProjectStore.getState().commit();
      useProjectStore.setState((s) => {
        const page = s.project?.pages[activePageIndex];
        if (page) page.elements = page.elements.filter((el) => !ids.has(el.id));
      });
    }
    setStagedIds([]);
    setPreview(null);
    onClose();
  }, [stagedIds, activePageIndex, onClose]);

  // Escape closes the modal (ARIA requirement for role="dialog")
  // NOTE: Must be called before the conditional return below — Rules of Hooks
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleCancel(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, handleCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-generate-title"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(6px)',
      }}
      onClick={handleCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 560,
          maxWidth: '94vw',
          background: 'var(--bg)',
          border: '1px solid var(--line)',
          borderRadius: 12,
          padding: 20,
          color: 'var(--text)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.55)',
        }}
      >
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <h2
            id="ai-generate-title"
            style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 600, margin: 0 }}
          >
            <Sparkles size={18} color="#a855f7" /> Generate with AI
          </h2>
          <button
            onClick={handleCancel}
            aria-label="Close"
            style={{ background: 'transparent', border: 'none', color: 'var(--text-mute)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </header>

        {/* Provider chips */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 11, color: 'var(--text-mute)', display: 'block', marginBottom: 6 }}>
            Provider (free tiers)
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {providers?.providers.length ? (
              providers.providers.map((p) => (
                <button
                  key={p}
                  onClick={() => setProvider(p)}
                  style={{
                    padding: '6px 10px',
                    fontSize: 11,
                    borderRadius: 999,
                    border: '1px solid',
                    borderColor: provider === p ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                    background: provider === p ? 'rgba(59,130,246,0.18)' : 'rgba(255,255,255,0.03)',
                    color: provider === p ? 'var(--accent)' : 'var(--text)',
                    cursor: 'pointer',
                  }}
                >
                  {providers.labels[p] ?? p}
                </button>
              ))
            ) : (
              <div style={{ fontSize: 11, color: 'var(--text-mute)' }}>
                No providers configured. Add <code>GEMINI_API_KEY</code> or <code>GROQ_API_KEY</code> to <code>.env.local</code>.
              </div>
            )}
          </div>
        </div>

        {/* Category */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 11, color: 'var(--text-mute)', display: 'block', marginBottom: 6 }}>
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              width: '100%',
              padding: 8,
              fontSize: 12,
              borderRadius: 6,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--line)',
              color: 'white',
            }}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c} style={{ background: '#18181b' }}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Prompt */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 11, color: 'var(--text-mute)', display: 'block', marginBottom: 6 }}>
            Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Cyberpunk DJ portfolio with neon palette, a bio section, and upcoming-shows grid"
            rows={4}
            disabled={loading}
            style={{
              width: '100%',
              padding: 10,
              fontSize: 12,
              lineHeight: 1.5,
              borderRadius: 6,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--line)',
              color: 'white',
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Skeleton */}
        {loading && (
          <div
            style={{
              marginBottom: 12,
              padding: 12,
              borderRadius: 8,
              background: 'rgba(255,255,255,0.03)',
              border: '1px dashed rgba(255,255,255,0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--text-mute)' }}>
              <Loader2 size={14} className="stakked-spinning" />
              Generating layout... asking {provider || 'the first available provider'}
            </div>
            {[1, 0.85, 0.65].map((w, i) => (
              <div
                key={i}
                style={{
                  height: 10,
                  width: `${w * 100}%`,
                  background: 'linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.12), rgba(255,255,255,0.04))',
                  backgroundSize: '200% 100%',
                  borderRadius: 6,
                  animation: 'stakked-shimmer 1.4s infinite linear',
                }}
              />
            ))}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div
            style={{
              marginBottom: 12,
              padding: 10,
              borderRadius: 6,
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#fca5a5',
              fontSize: 11,
            }}
          >
            {error}
          </div>
        )}

        {/* Preview summary */}
        {preview && !loading && (
          <div
            style={{
              marginBottom: 12,
              padding: 10,
              borderRadius: 6,
              background: 'rgba(168,85,247,0.08)',
              border: '1px solid rgba(168,85,247,0.25)',
              fontSize: 11,
              color: '#e9d5ff',
            }}
          >
            <div style={{ marginBottom: 4 }}>
              <strong>{preview.elements.length}</strong> elements previewed via{' '}
              <strong>{preview.provider}</strong> ({preview.model})
            </div>
            {preview.reasoning && <div style={{ opacity: 0.8 }}>{preview.reasoning}</div>}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          {!preview && (
            <button
              onClick={handleGenerate}
              disabled={loading || !hasProviders}
              style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: 8,
                border: 'none',
                background: hasProviders ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
                color: 'white',
                fontSize: 12,
                fontWeight: 600,
                cursor: loading || !hasProviders ? 'not-allowed' : 'pointer',
                opacity: loading || !hasProviders ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              {loading ? <Loader2 size={14} className="stakked-spinning" /> : <Sparkles size={14} />}
              {loading ? 'Generating…' : 'Generate'}
            </button>
          )}

          {preview && (
            <>
              <button
                onClick={handleGenerate}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.04)',
                  color: 'white',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <RotateCw size={14} /> Regenerate
              </button>
              <button
                onClick={handleAccept}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#10b981',
                  color: 'white',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <Check size={14} /> Accept
              </button>
            </>
          )}

          <button
            onClick={handleCancel}
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'transparent',
              color: 'var(--text-mute)',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Plain <style> — styled-jsx is not supported in Next.js App Router */}
      <style>{`
        @keyframes stakked-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes stakked-spin {
          to { transform: rotate(360deg); }
        }
        .stakked-spinning {
          animation: stakked-spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
