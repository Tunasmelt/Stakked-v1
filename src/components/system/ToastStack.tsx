'use client';

import React from 'react';
import { useUIStore, Toast, ToastKind } from '@/stores/ui-store';

const ICONS: Record<ToastKind, string> = {
  info: 'ℹ',
  success: '✓',
  warning: '⚠',
  error: '✕',
};

const COLORS: Record<ToastKind, string> = {
  info: 'var(--accent, #3b82f6)',
  success: 'var(--ok, #22c55e)',
  warning: '#f59e0b',
  error: 'var(--err, #ef4444)',
};

function ToastItem({ toast }: { toast: Toast }) {
  const removeToast = useUIStore((s) => s.removeToast);

  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: 'var(--bg-2, #1a1a1e)',
        border: `1px solid ${COLORS[toast.kind]}`,
        borderLeft: `3px solid ${COLORS[toast.kind]}`,
        borderRadius: 8,
        padding: '10px 14px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        fontSize: 12,
        color: 'var(--text, #f1f1f2)',
        maxWidth: 320,
        minWidth: 220,
        pointerEvents: 'auto',
        animation: 'stakked-toast-in 0.2s ease',
      }}
    >
      <span style={{ color: COLORS[toast.kind], fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
        {ICONS[toast.kind]}
      </span>
      <span style={{ flex: 1, lineHeight: 1.4 }}>{toast.message}</span>
      <button
        onClick={() => removeToast(toast.id)}
        aria-label="Dismiss"
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-mute, #888)',
          cursor: 'pointer',
          fontSize: 14,
          padding: 2,
          flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}

export function ToastStack() {
  const toasts = useUIStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes stakked-toast-in {
          from { opacity: 0; transform: translateY(8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          pointerEvents: 'none',
        }}
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </div>
    </>
  );
}
