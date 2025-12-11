'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { useFileUpload } from '@/hooks/use-file-upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  Bold, 
  Italic, 
  List, 
  Code, 
  ImagePlus,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const categories = [
  'Блог',
  'Новости',
  'Обзор',
  'Руководство',
  'Другое',
];

export default function CreatePostPage() {
  const router = useRouter();
  const { user, isUserLoading: authLoading } = useUser();
  const { toast } = useToast();
  const { uploadFiles, uploading } = useFileUpload({maxSizeInMB: 10}); 
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Блог');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary hover:underline',
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto my-4',
        },
      }),
      Placeholder.configure({
        placeholder: 'Напишите вашу историю здесь...',
      }),
    ],
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[300px] px-4 py-3',
      },
    },
  });

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      if (coverPreview) URL.revokeObjectURL(coverPreview);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleInsertImage = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !editor) return;

      try {
        const uploadResults = await uploadFiles([file], 'posts');
        if (uploadResults.length > 0) {
          editor.chain().focus().setImage({ src: uploadResults[0].url }).run();
        } else {
          throw new Error("Не удалось получить URL изображения после загрузки.");
        }
      } catch (error) {
        console.error('Image upload failed:', error);
        toast({variant: 'destructive', title: 'Ошибка', description: 'Не удалось загрузить изображение.'});
      }
    };

    input.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editor) return;
    if (!title.trim()) {
      toast({variant: 'destructive', title: 'Ошибка', description: 'Введите заголовок'});
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Загружаем обложку если есть
      let coverUrl = '';
      if (coverImage) {
        const uploadResults = await uploadFiles([coverImage], 'posts');
        if(uploadResults.length > 0) coverUrl = uploadResults[0].url;
      }
      
      // Получаем HTML контент из редактора
      const content = editor.getHTML();

      // Создаем пост через API
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          category,
          coverImage: coverUrl,
          authorId: user.uid,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create post');
      }

      const { postId } = await response.json();
      
      toast({title: "Успех!", description: "Пост опубликован."});
      
      // Редирект на страницу поста
      router.push(`/posts/${postId}`);
    } catch (error) {
      console.error('Post creation error:', error);
      toast({
        variant: 'destructive', 
        title: 'Ошибка', 
        description: error instanceof Error ? error.message : 'Не удалось создать пост'
      });
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    router.push('/auth');
    return null;
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Создать публикацию</h1>
        <Button
          onClick={handleSubmit}
          disabled={submitting || uploading}
          className="bg-primary hover:bg-primary/90"
        >
          {submitting || uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Публикация...
            </>
          ) : (
            'Опубликовать'
          )}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Заголовок поста</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Введите заголовок..."
            className="bg-card border-border"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cover">Обложка (для ленты)</Label>
          <div className="flex flex-col gap-4">
            <input
              id="cover"
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('cover')?.click()}
              className="w-fit"
            >
              <ImagePlus className="w-4 h-4 mr-2" />
              Загрузить обложку
            </Button>
            {coverPreview && (
              <img
                src={coverPreview}
                alt="Preview"
                className="w-full max-h-64 object-cover rounded-xl border"
              />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Категория</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="bg-card border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Содержание</Label>
          
          <div className="flex items-center gap-1 p-2 bg-muted border border-border rounded-t-xl">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={cn(editor?.isActive('bold') && 'bg-background')}
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={cn(editor?.isActive('italic') && 'bg-background')}
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className={cn(editor?.isActive('bulletList') && 'bg-background')}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
              className={cn(editor?.isActive('codeBlock') && 'bg-background')}
            >
              <Code className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleInsertImage}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ImagePlus className="w-4 h-4" />
              )}
            </Button>
          </div>

          <div className="bg-card border border-border border-t-0 rounded-b-xl">
            <EditorContent editor={editor} />
          </div>
        </div>
      </form>
    </div>
  );
}
