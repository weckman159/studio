'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import { Bold, Italic, List, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { uploadFile } from '@/lib/storage'; // Используем вашу функцию загрузки

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  postId: string; // Нужен для папки в Storage
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
        class: 'prose prose-sm sm:prose lg:prose-lg dark:prose-invert focus:outline-none min-h-[250px] max-w-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  // Функция загрузки изображения
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Загружаем в папку постов
      const result = await uploadFile(file, 'posts', postId);
      
      // Вставляем картинку в редактор по URL
      editor.chain().focus().setImage({ src: result.url }).run();
    } catch (error) {
      console.error("Ошибка загрузки фото в редактор:", error);
      alert("Не удалось загрузить изображение");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="border rounded-xl overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b bg-muted/30 overflow-x-auto">
        <Button
          variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          type="button"
        >
          <Bold className="h-4 w-4" />
        </Button>
        
        <Button
          variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          type="button"
        >
          <Italic className="h-4 w-4" />
        </Button>

        <Button
          variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          type="button"
        >
          <List className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          type="button"
        >
          {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
          <span className="ml-2 text-xs hidden sm:inline">Вставить фото</span>
        </Button>
        
        {/* Скрытый инпут для файла */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleImageUpload}
        />
      </div>

      {/* Editor Area */}
      <div className="p-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
