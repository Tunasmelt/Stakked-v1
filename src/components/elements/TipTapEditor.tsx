'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import React, { useEffect } from 'react';

interface Props {
  content: string;
  onUpdate: (html: string) => void;
  onBlur: () => void;
}

/**
 * Heavy TipTap editor component. 
 * This should be loaded dynamically by the parent TextElement.
 */
export default function TipTapEditor({ content, onUpdate, onBlur }: Props) {
  // Track whether a change originated from inside TipTap (user typing)
  // vs. from outside (undo/redo mutating the store). Without this guard,
  // calling setContent() during user typing would reset the cursor position.
  const isInternalChange = React.useRef(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      isInternalChange.current = true;
      onUpdate(editor.getHTML());
    },
  });

  // Focus on mount
  useEffect(() => {
    if (editor) {
      editor.commands.focus('end');
    }
  }, [editor]);

  // Sync external content changes (undo/redo from the project store) back into TipTap.
  // Only fires when the store mutates content from outside — the isInternalChange guard
  // prevents feedback loops when the user types (which also triggers onUpdate → store).
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    if (isInternalChange.current) {
      // This effect fired because the user typed — don't overwrite their cursor
      isInternalChange.current = false;
      return;
    }
    const currentHtml = editor.getHTML();
    if (currentHtml !== content) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  return (
    <div onBlur={onBlur} style={{ width: '100%', height: '100%' }}>
      <EditorContent editor={editor} />
    </div>
  );
}
