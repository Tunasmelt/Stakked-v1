'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Search, Settings, FileBox, Palette, FileText, Monitor, LayoutDashboard, Command } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { useProjectStore } from '@/stores/project-store';
import { compileProjectToHtml } from '@/lib/export';
import { downloadNodeAsImage } from '@/lib/export-image';
import { useRouter } from 'next/navigation';
import styles from '@/styles/CommandPalette.module.css';

export function CommandPalette() {
  const router = useRouter();
  const { commandPaletteOpen, setCommandPaletteOpen, setSettingsModalOpen, toggleTweaks } = useUIStore();

  const handleExportHtml = () => {
    const proj = useProjectStore.getState().project;
    const pageIdx = useProjectStore.getState().activePageIndex;
    if (!proj) return;
    const html = compileProjectToHtml(proj, { pageIndex: pageIdx });
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${proj.slug ?? proj.title ?? 'stakked'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  // Focus input and reset state on open
  useEffect(() => {
    if (commandPaletteOpen) {
      // eslint-disable-next-line
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  const rawCommands = [
    { id: 'settings', label: 'User Settings', group: 'Preferences', icon: Settings, action: () => setSettingsModalOpen(true) },
    { id: 'tweaks', label: 'Toggle Tweaks Panel', group: 'Preferences', icon: Palette, action: () => toggleTweaks() },
    { id: 'dashboard', label: 'Back to Workspace', group: 'Navigation', icon: LayoutDashboard, action: () => router.push('/') },
    { id: 'docs', label: 'Documentation', group: 'Navigation', icon: FileText, action: () => router.push('/docs') },
    { id: 'features', label: 'Features Showcase', group: 'Navigation', icon: Monitor, action: () => router.push('/features') },
    { id: 'export-html', label: 'Export to HTML', group: 'Actions', icon: FileBox, action: handleExportHtml },
    { id: 'export-png', label: 'Export to PNG', group: 'Actions', icon: FileBox, action: async () => {
      const canvas = document.querySelector('[data-export-canvas]');
      if (canvas) {
        setCommandPaletteOpen(false);
        await downloadNodeAsImage(canvas as HTMLElement, 'export.png');
      }
    }},
  ];

  const filtered = query.trim() === '' 
    ? rawCommands 
    : rawCommands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()) || c.group.toLowerCase().includes(query.toLowerCase()));

  // Groups for rendering
  const groups = Array.from(new Set(filtered.map(c => c.group)));

  // Navigation within modal
  useEffect(() => {
    const handleNavigation = (e: KeyboardEvent) => {
      if (!commandPaletteOpen) return;
      
      if (e.key === 'Escape') {
        e.preventDefault();
        setCommandPaletteOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filtered.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
      } else if (e.key === 'Enter' && filtered.length > 0) {
        e.preventDefault();
        filtered[selectedIndex].action();
        setCommandPaletteOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleNavigation);
    return () => window.removeEventListener('keydown', handleNavigation);
  }, [commandPaletteOpen, filtered, selectedIndex, setCommandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  return (
    <div className={styles.overlay} onClick={() => setCommandPaletteOpen(false)}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        
        <div className={styles.header}>
          <Search size={18} className={styles.searchIcon} />
          <input
            ref={inputRef}
            className={styles.input}
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <div className={styles.shortcut}>ESC</div>
        </div>

        <div className={styles.content}>
          {filtered.length === 0 && (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-mute)', fontSize: '14px' }}>
              No commands found.
            </div>
          )}

          {groups.map(group => (
            <div key={group}>
              <div className={styles.groupLabel}>{group}</div>
              {filtered.map((item, flatIdx) => {
                if (item.group !== group) return null;
                const isSelected = flatIdx === selectedIndex;
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className={styles.item}
                    data-selected={isSelected}
                    onMouseEnter={() => setSelectedIndex(flatIdx)}
                    onClick={() => {
                      item.action();
                      setCommandPaletteOpen(false);
                    }}
                  >
                    <div className={styles.itemIcon}>
                      {Icon ? <Icon size={16} /> : <Command size={16} />}
                    </div>
                    <div className={styles.itemLabel}>{item.label}</div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
