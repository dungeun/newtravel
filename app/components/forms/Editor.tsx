import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import FontFamily from '@tiptap/extension-font-family';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  Paintbrush,
} from 'lucide-react';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
}

const Editor = ({ content, onChange }: EditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Highlight,
      FontFamily,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 bg-gray-50 p-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`rounded p-1.5 hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
        >
          <Bold className="size-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`rounded p-1.5 hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
        >
          <Italic className="size-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`rounded p-1.5 hover:bg-gray-200 ${editor.isActive('underline') ? 'bg-gray-200' : ''}`}
        >
          <UnderlineIcon className="size-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={`rounded p-1.5 hover:bg-gray-200 ${editor.isActive('highlight') ? 'bg-gray-200' : ''}`}
        >
          <Highlighter className="size-4" />
        </button>
        <div className="mx-1 h-5 w-px bg-gray-300" />
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`rounded p-1.5 hover:bg-gray-200 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}`}
        >
          <AlignLeft className="size-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`rounded p-1.5 hover:bg-gray-200 ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}`}
        >
          <AlignCenter className="size-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`rounded p-1.5 hover:bg-gray-200 ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}`}
        >
          <AlignRight className="size-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={`rounded p-1.5 hover:bg-gray-200 ${editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-200' : ''}`}
        >
          <AlignJustify className="size-4" />
        </button>
        <div className="mx-1 h-5 w-px bg-gray-300" />
        <select
          onChange={e => editor.chain().focus().setFontFamily(e.target.value).run()}
          className="rounded border border-gray-300 p-1.5 text-sm"
        >
          <option value="Inter">기본</option>
          <option value="serif">명조</option>
          <option value="monospace">고정폭</option>
        </select>
        <button
          onClick={() => editor.chain().focus().setColor('#000000').run()}
          className="rounded p-1.5 hover:bg-gray-200"
        >
          <Paintbrush className="size-4" />
        </button>
      </div>
      <EditorContent editor={editor} className="prose min-h-[400px] max-w-none p-4" />
    </div>
  );
};

export default Editor;
