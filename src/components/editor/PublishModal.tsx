/* src/components/editor/PublishModal.tsx */
'use client';

import React, { useEffect, useState } from 'react';
import { Rocket, X, Loader2, Copy, Check, ExternalLink } from 'lucide-react';
import { useProjectStore } from '@/stores/project-store';
import { supabase } from '@/lib/supabase';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function PublishModal({ open, onClose }: Props) {
  const project = useProjectStore((s) => s.project);
  const [publishing, setPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Escape closes the modal (ARIA requirement for role="dialog")
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handlePublish = async () => {
    if (!project) return;

    setPublishing(true);
    setError(null);

    // Attach the current session token so the publish API can verify ownership
    // for authenticated projects. Anonymous projects (userId starts with 'anon-')
    // do not require a token and the API will accept the request without one.
    let authToken: string | null = null;
    if (supabase) {
      const { data } = await supabase.auth.getSession();
      authToken = data.session?.access_token ?? null;
    }

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch('/api/publish', {
        method: 'POST',
        headers,
        body: JSON.stringify(project),
      });
      
      const result = await res.json();
      
      if (!res.ok) {
        setError(result.error || `Publish failed (${res.status})`);
        return;
      }
      
      if (result.success && result.url) {
        setPublishedUrl(result.url);
      } else {
        setError(result.error || 'Publishing failed — no URL returned');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred during publishing.');
    } finally {
      setPublishing(false);
    }
  };

  const handleCopy = () => {
    if (!publishedUrl) return;
    navigator.clipboard.writeText(publishedUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // Clipboard API unavailable (e.g. non-secure context) — fall back to execCommand
      try {
        const el = document.createElement('textarea');
        el.value = publishedUrl;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Both methods failed — silently ignore
      }
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="publish-modal-title"
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
      onClick={onClose}
    >
      <style>{`@keyframes stakked-spin { to { transform: rotate(360deg); } } .stakked-spinning { animation: stakked-spin 1s linear infinite; }`}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 440,
          background: 'var(--bg)',
          border: '1px solid var(--line)',
          borderRadius: 12,
          padding: 24,
          color: 'white',
          boxShadow: '0 30px 80px rgba(0,0,0,0.55)',
        }}
      >
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}
        >
          <h2 id="publish-modal-title" style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, fontWeight: 600, margin: 0 }}>
            <Rocket size={20} color="var(--accent)" /> Publish Project
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-mute)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </header>

        <p style={{ fontSize: 13, color: 'var(--text-mute)', lineHeight: 1.5, marginBottom: 24 }}>
          Publishing creates a public, high-performance version of your site.
          It will be available for anyone with the link.
        </p>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            padding: '10px 12px',
            borderRadius: 8,
            color: '#fca5a5',
            fontSize: 12,
            marginBottom: 20
          }}>
            {error}
          </div>
        )}

        {publishedUrl ? (
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 11, color: 'var(--text-mute)', display: 'block', marginBottom: 8 }}>
              Public Site URL
            </label>
            <div style={{ 
              display: 'flex', 
              gap: 8,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--line)',
              borderRadius: 8,
              padding: '6px 6px 6px 12px',
              alignItems: 'center'
            }}>
              <span style={{ 
                flex: 1, 
                fontSize: 12, 
                color: 'white', 
                whiteSpace: 'nowrap', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis' 
              }}>
                {publishedUrl}
              </span>
              <button 
                onClick={handleCopy}
                style={{
                  padding: '6px 10px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 6,
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 11
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            
            <a 
              href={publishedUrl} 
              target="_blank" 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginTop: 16,
                padding: '12px',
                background: 'var(--accent)',
                borderRadius: 8,
                color: 'white',
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 600
              }}
            >
              <ExternalLink size={14} /> Open Live Site
            </a>
          </div>
        ) : (
          <button
            onClick={handlePublish}
            disabled={publishing}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 8,
              background: 'var(--accent)',
              color: 'white',
              border: 'none',
              fontSize: 14,
              fontWeight: 600,
              cursor: publishing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10
            }}
          >
            {publishing ? <Loader2 size={18} className="stakked-spinning" /> : <Rocket size={18} />}
            {publishing ? 'Publishing Site...' : 'Go Live Now'}
          </button>
        )}

        {!publishedUrl && (
          <button
            onClick={onClose}
            style={{
              width: '100%',
              marginTop: 12,
              padding: '12px',
              borderRadius: 8,
              background: 'transparent',
              color: 'var(--text-mute)',
              border: '1px solid rgba(255,255,255,0.1)',
              fontSize: 14,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
