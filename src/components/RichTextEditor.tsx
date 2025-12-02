'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import { Bold, Italic, List, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { uploadFile } from '@/lib/storage';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  postId: string;
}

export default function RichTextEditor({ content, onChange, postId }: RichTextEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension.configure({
        inline: true,
        allowBase64: true,
      }),
      Placeholder.configure({
        placeholder: 'Напишите вашу историю здесь...',
      }),
    ],
    content: content,
    editorProps: {
      attributes: {
        // Здесь важен класс 'prose'
        class: 'prose prose-sm sm:prose lg:prose-lg dark:prose-invert focus:outline-none min-h-[250px] max-w-none p-4',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await uploadFile(file, 'posts', postId);
      editor.chain().focus().setImage({ src: result.url }).run();
    } catch (error) {
      console.error("Editor upload error:", error);
      alert("Не удалось загрузить фото");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="border rounded-xl overflow-hidden bg-background shadow-sm">
      <div className="flex items-center gap-1 p-2 border-b bg-muted/30 overflow-x-auto">
        <Button variant={editor.isActive('bold') ? 'secondary' : 'ghost'} size="sm" onClick={() => editor.chain().focus().toggleBold().run()} type="button">
          <Bold className="h-4 w-4" />
        </Button>
        <Button variant={editor.isActive('italic') ? 'secondary' : 'ghost'} size="sm" onClick={() => editor.chain().focus().toggleItalic().run()} type="button">
          <Italic className="h-4 w-4" />
        </Button>
        <Button variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'} size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()} type="button">
          <List className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading} type="button">
          {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
          <span className="ml-2 text-xs hidden sm:inline">Фото</span>
        </Button>
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
