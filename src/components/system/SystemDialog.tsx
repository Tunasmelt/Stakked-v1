'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useUIStore } from '@/stores/ui-store';
import styles from '@/styles/SystemDialog.module.css';

/**
 * SystemDialog — replacement for native confirm() and prompt().
 * Styled to match the Claude Creative OS aesthetic.
 */
export function SystemDialog() {
  const { confirmDialog, promptDialog, closeDialogs } = useUIStore();
  const [promptValue, setPromptValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when prompt opens
  useEffect(() => {
    if (promptDialog?.open) {
      setTimeout(() => {
        setPromptValue(promptDialog.defaultValue || '');
        inputRef.current?.focus();
      }, 50);
    }
  }, [promptDialog]);

  if (!confirmDialog?.open && !promptDialog?.open) return null;

  return (
    <div className={styles.overlay} onClick={closeDialogs}>
      {confirmDialog?.open && (
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.body}>
            <h2 className={styles.title}>{confirmDialog.title}</h2>
            <p className={styles.message}>{confirmDialog.message}</p>
          </div>
          <div className={styles.footer}>
            <button className={styles.cancelBtn} onClick={closeDialogs}>
              {confirmDialog.cancelText || 'Cancel'}
            </button>
            <button 
              className={`${styles.confirmBtn} ${confirmDialog.confirmText?.toLowerCase().includes('delete') ? styles.dangerBtn : ''}`} 
              onClick={() => {
                confirmDialog.onConfirm();
                closeDialogs();
              }}
            >
              {confirmDialog.confirmText || 'Confirm'}
            </button>
          </div>
        </div>
      )}

      {promptDialog?.open && (
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.body}>
            <h2 className={styles.title}>{promptDialog.title}</h2>
            <input 
              ref={inputRef}
              className={styles.input}
              placeholder={promptDialog.placeholder}
              value={promptValue}
              onChange={(e) => setPromptValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  promptDialog.onConfirm(promptValue);
                  closeDialogs();
                }
                if (e.key === 'Escape') closeDialogs();
              }}
            />
          </div>
          <div className={styles.footer}>
            <button className={styles.cancelBtn} onClick={closeDialogs}>
              Cancel
            </button>
            <button 
              className={styles.confirmBtn}
              onClick={() => {
                promptDialog.onConfirm(promptValue);
                closeDialogs();
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
