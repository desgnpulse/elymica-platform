'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Start writing...',
  disabled = false,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-sage underline hover:text-deep-sage',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none min-h-[200px] px-4 py-3 focus:outline-none text-night',
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-label': placeholder,
      },
    },
  });

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Update editable state
  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [disabled, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="rounded-lg border border-sage/30 bg-white overflow-hidden">
      {/* Toolbar */}
      <div
        className="flex flex-wrap gap-1 border-b border-sage/20 bg-sand/30 px-2 py-2"
        role="toolbar"
        aria-label="Text formatting toolbar"
      >
        {/* Text formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          aria-pressed={editor.isActive('bold')}
          aria-label="Bold"
          className={`rounded px-2 py-1 text-sm font-semibold transition hover:bg-sage/20 disabled:opacity-30 min-w-[32px] min-h-[32px] ${
            editor.isActive('bold') ? 'bg-sage/30 text-deep-sage' : 'text-night'
          }`}
          title="Bold (Ctrl+B)"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          aria-pressed={editor.isActive('italic')}
          aria-label="Italic"
          className={`rounded px-2 py-1 text-sm italic transition hover:bg-sage/20 disabled:opacity-30 min-w-[32px] min-h-[32px] ${
            editor.isActive('italic') ? 'bg-sage/30 text-deep-sage' : 'text-night'
          }`}
          title="Italic (Ctrl+I)"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          aria-pressed={editor.isActive('strike')}
          aria-label="Strikethrough"
          className={`rounded px-2 py-1 text-sm line-through transition hover:bg-sage/20 disabled:opacity-30 min-w-[32px] min-h-[32px] ${
            editor.isActive('strike') ? 'bg-sage/30 text-deep-sage' : 'text-night'
          }`}
          title="Strikethrough"
        >
          S
        </button>

        <div className="mx-1 w-px bg-sage/30" aria-hidden="true" />

        {/* Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          aria-pressed={editor.isActive('heading', { level: 1 })}
          aria-label="Heading 1"
          className={`rounded px-2 py-1 text-sm font-bold transition hover:bg-sage/20 min-w-[32px] min-h-[32px] ${
            editor.isActive('heading', { level: 1 })
              ? 'bg-sage/30 text-deep-sage'
              : 'text-night'
          }`}
          title="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          aria-pressed={editor.isActive('heading', { level: 2 })}
          aria-label="Heading 2"
          className={`rounded px-2 py-1 text-sm font-bold transition hover:bg-sage/20 min-w-[32px] min-h-[32px] ${
            editor.isActive('heading', { level: 2 })
              ? 'bg-sage/30 text-deep-sage'
              : 'text-night'
          }`}
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          aria-pressed={editor.isActive('heading', { level: 3 })}
          aria-label="Heading 3"
          className={`rounded px-2 py-1 text-sm font-bold transition hover:bg-sage/20 min-w-[32px] min-h-[32px] ${
            editor.isActive('heading', { level: 3 })
              ? 'bg-sage/30 text-deep-sage'
              : 'text-night'
          }`}
          title="Heading 3"
        >
          H3
        </button>

        <div className="mx-1 w-px bg-sage/30" aria-hidden="true" />

        {/* Lists */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          aria-pressed={editor.isActive('bulletList')}
          aria-label="Bullet list"
          className={`rounded px-2 py-1 text-sm transition hover:bg-sage/20 min-w-[32px] min-h-[32px] ${
            editor.isActive('bulletList') ? 'bg-sage/30 text-deep-sage' : 'text-night'
          }`}
          title="Bullet List"
        >
          •
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          aria-pressed={editor.isActive('orderedList')}
          aria-label="Numbered list"
          className={`rounded px-2 py-1 text-sm transition hover:bg-sage/20 min-w-[32px] min-h-[32px] ${
            editor.isActive('orderedList') ? 'bg-sage/30 text-deep-sage' : 'text-night'
          }`}
          title="Numbered List"
        >
          1.
        </button>

        <div className="mx-1 w-px bg-sage/30" aria-hidden="true" />

        {/* Code & Quote */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          aria-pressed={editor.isActive('codeBlock')}
          aria-label="Code block"
          className={`rounded px-2 py-1 text-sm font-mono transition hover:bg-sage/20 min-w-[32px] min-h-[32px] ${
            editor.isActive('codeBlock') ? 'bg-sage/30 text-deep-sage' : 'text-night'
          }`}
          title="Code Block"
        >
          {'</>'}
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          aria-pressed={editor.isActive('blockquote')}
          aria-label="Blockquote"
          className={`rounded px-2 py-1 text-sm transition hover:bg-sage/20 min-w-[32px] min-h-[32px] ${
            editor.isActive('blockquote') ? 'bg-sage/30 text-deep-sage' : 'text-night'
          }`}
          title="Quote"
        >
          &quot;
        </button>

        <div className="mx-1 w-px bg-sage/30" aria-hidden="true" />

        {/* Link */}
        <button
          type="button"
          onClick={() => {
            const url = window.prompt('Enter URL:');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          aria-pressed={editor.isActive('link')}
          aria-label="Add link"
          className={`rounded px-2 py-1 text-sm transition hover:bg-sage/20 min-w-[32px] min-h-[32px] ${
            editor.isActive('link') ? 'bg-sage/30 text-deep-sage' : 'text-night'
          }`}
          title="Add Link"
        >
          🔗
        </button>

        <div className="mx-1 w-px bg-sage/30" aria-hidden="true" />

        {/* Clear formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          aria-label="Clear formatting"
          className="rounded px-2 py-1 text-sm text-olive transition hover:bg-sage/20 min-w-[32px] min-h-[32px]"
          title="Clear Formatting"
        >
          ×
        </button>
      </div>

      {/* Editor content area */}
      <EditorContent editor={editor} />
    </div>
  );
}
