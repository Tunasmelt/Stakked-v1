'use client';

import React, { useState } from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  FileText, Plus, GripVertical, MoreVertical, 
  Copy, Edit3, Trash2 
} from 'lucide-react';
import { useProjectStore } from '@/stores/project-store';
import { useUIStore } from '@/stores/ui-store';
import { StakkedPage } from '@/types/project';
import styles from '@/styles/PageList.module.css';

export const PageList: React.FC = () => {
  const project = useProjectStore((state) => state.project);
  const activePageIndex = useProjectStore((state) => state.activePageIndex);
  const setActivePageIndex = useProjectStore(s => s.setActivePageIndex);
  const addPage            = useProjectStore(s => s.addPage);
  const reorderPages       = useProjectStore(s => s.reorderPages);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!project || !over) return;

    if (active.id !== over.id) {
      const oldIndex = project.pages.findIndex((p) => p.id === active.id);
      const newIndex = project.pages.findIndex((p) => p.id === over.id);
      
      const newPages = arrayMove(project.pages, oldIndex, newIndex);
      reorderPages(newPages.map(p => p.id));
      
      // Update active index if moved
      if (activePageIndex === oldIndex) {
        setActivePageIndex(newIndex);
      } else if (activePageIndex > oldIndex && activePageIndex <= newIndex) {
        setActivePageIndex(activePageIndex - 1);
      } else if (activePageIndex < oldIndex && activePageIndex >= newIndex) {
        setActivePageIndex(activePageIndex + 1);
      }
    }
  };

  const handleAddPage = () => {
    // Parentheses required — `??` has lower precedence than `+`
    const nextTitle = `Page ${(project?.pages.length ?? 0) + 1}`;
    addPage(nextTitle);
    // addPage appends synchronously; new page is at index = current length
    if (project) setActivePageIndex(project.pages.length);
  };

  if (!project) return null;

  return (
    <div className={styles.container}>
      <button className={styles.addButton} onClick={handleAddPage}>
        <Plus size={14} />
        Add Page
      </button>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={project.pages.map(p => p.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className={styles.list}>
            {project.pages.map((page, index) => (
              <SortablePageItem 
                key={page.id} 
                page={page} 
                isActive={index === activePageIndex}
                isLast={project.pages.length === 1}
                onSelect={() => setActivePageIndex(index)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

interface ItemProps {
  page: StakkedPage;
  isActive: boolean;
  isLast: boolean;
  onSelect: () => void;
}

const SortablePageItem: React.FC<ItemProps> = ({ page, isActive, isLast, onSelect }) => {
  // Reactive selectors — prevent stale closures in callbacks
  const renamePage    = useProjectStore((s) => s.renamePage);
  const duplicatePage = useProjectStore((s) => s.duplicatePage);
  const removePage    = useProjectStore((s) => s.removePage);
  
  const showConfirm = useUIStore(s => s.showConfirm);
  const showPrompt  = useUIStore(s => s.showPrompt);
  const [showMenu, setShowMenu] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 1,
    opacity: isDragging ? 0.5 : 1
  };

  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    showPrompt(
      'Rename Page',
      page.title,
      (newTitle) => {
        if (newTitle) renamePage(page.id, newTitle);
      },
      'Enter page title...'
    );
    setShowMenu(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    showConfirm(
      'Delete Page',
      `Are you sure you want to delete "${page.title}"? All elements on this page will be removed.`,
      () => {
        removePage(page.id);
      },
      'Delete'
    );
    setShowMenu(false);
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`${styles.item} ${isActive ? styles.active : ''}`}
      onClick={onSelect}
      onContextMenu={(e) => {
        e.preventDefault();
        setShowMenu(!showMenu);
      }}
    >
      <div className={styles.dragHandle} {...attributes} {...listeners}>
        <GripVertical size={14} />
      </div>
      
      <FileText size={14} className={styles.icon} />
      
      <div className={styles.details}>
        <span className={styles.title}>{page.title}</span>
        <span className={styles.slug}>/{page.slug}</span>
      </div>

      <div className={styles.actions}>
        <button 
          className={styles.menuButton} 
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
        >
          <MoreVertical size={14} />
        </button>

        {showMenu && (
          <div className={styles.menu} onMouseLeave={() => setShowMenu(false)}>
            <button onClick={handleRename}>
              <Edit3 size={14} /> Rename
            </button>
            <button onClick={(e) => { e.stopPropagation(); duplicatePage(page.id); setShowMenu(false); }}>
              <Copy size={14} /> Duplicate
            </button>
            <button 
              onClick={handleDelete}
              disabled={isLast}
              className={styles.deleteAction}
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
