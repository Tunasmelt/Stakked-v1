'use client';

import React from 'react';
import { StakkedElement } from '@/types/element';

/**
 * FormElement — editor-side preview of a contact/email-capture form.
 *
 * Phase 5.9 spec: field types text/email/textarea/checkbox, submit → Supabase.
 * The editor renders a read-only preview (onSubmit is a no-op on the canvas);
 * actual submission is wired in PreviewRenderer / publish pipeline.
 */
export default function FormElement({ element }: { element: StakkedElement }) {
  const content = element.content.type === 'form' ? element.content : null;
  const fields = content?.fields ?? [];

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: 12,
        borderRadius: 'inherit',
      }}
    >
      {fields.length === 0 ? (
        <span style={{ opacity: 0.5, fontSize: 12 }}>Add form fields in the properties panel…</span>
      ) : (
        fields.map((f, i) => (
          <label
            key={f.label ?? i}
            style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11, color: '#fff', opacity: 0.9 }}
          >
            <span>
              {f.label}
              {f.required && <span style={{ color: '#f87171', marginLeft: 2 }}>*</span>}
            </span>
            {f.fieldType === 'textarea' ? (
              <textarea
                rows={3}
                readOnly
                style={{
                  padding: 6,
                  borderRadius: 6,
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#fff',
                }}
              />
            ) : f.fieldType === 'checkbox' ? (
              <input type="checkbox" readOnly />
            ) : (
              <input
                type={f.fieldType}
                readOnly
                style={{
                  padding: 6,
                  borderRadius: 6,
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#fff',
                }}
              />
            )}
          </label>
        ))
      )}
      {fields.length > 0 && (
        <button
          type="button"
          style={{
            marginTop: 6,
            padding: '8px 16px',
            borderRadius: 8,
            border: 'none',
            background: '#3b82f6',
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Submit
        </button>
      )}
    </form>
  );
}
