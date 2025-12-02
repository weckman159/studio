'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { useFileUpload } from '@/hooks/use-file-upload';
import { deleteFile } from '@/lib/storage';
import { Post } from '@/lib/types';
import dynamic from 'next/dynamic';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, X, MapPin, ImagePlus, ArrowLeft, Trash } from 'lucide-react';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Динамический импорт Tiptap редактора (чтобы избежать ошибок SSR)
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-muted rounded-xl animate-pulse" />
});

const postTypes = [
  'Блог', 'Фотоотчет', 'Вопрос', 'Мой опыт', 'Обзор', 'Ремонт', 'Тюнинг', 'Путешествия'
];

interface PostFormProps {
  postToEdit?: Post;
  communityId?: string;
  communityName?: string;
}

export function PostForm({ postToEdit, communityId, communityName }: PostFormProps) {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { uploadFiles, uploading, progress } = useFileUpload({ maxFiles: 1, maxSizeInMB: 10 });
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Генерируем ID поста сразу, чтобы можно было грузить картинки в текст ДО сохранения поста
  const [postId] = useState(() => postToEdit?.id || doc(collection(firestore, 'posts')).id);

  // State
  const [title, setTitle] = useState(postToEdit?.title || '');
  const [content, setContent] = useState(postToEdit?.content || ''); 
  const [category, setCategory] = useState(postToEdit?.category || 'Блог');
  const [location, setLocation] = useState(postToEdit?.location || '');
  
  // Cover Image Logic
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>(postToEdit?.imageUrl || '');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!postToEdit;

  // Clean up object URL
  useEffect(() => {
    return () => {
      if (coverPreview && coverPreview.startsWith('blob:')) {
        URL.revokeObjectURL(coverPreview);
      }
    };
  }, [coverPreview]);

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveCover = () => {
    setCoverFile(null);
    setCoverPreview('');
    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Вы не авторизованы' });
      return;
    }

    if (!title.trim()) {
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Введите заголовок' });
      return;
    }

    // Для фотоотчетов текст может быть необязательным, если есть фото в тексте или обложка
    const hasContent = content.trim().length > 0;
    const hasCover = !!coverPreview;
    
    if (!hasContent && !hasCover) {
        toast({ variant: 'destructive', title: 'Пусто', description: 'Добавьте текст или фото' });
        return;
    }

    setIsSubmitting(true);

    try {
      const postRef = doc(firestore, 'posts', postId);
      let finalCoverUrl = coverPreview;

      // 1. Загрузка обложки (если выбран новый файл)
      if (coverFile) {
        // Если меняем старое фото - удаляем его
        if (isEditMode && postToEdit?.imageUrl && !postToEdit.imageUrl.startsWith('blob:')) {
             try { await deleteFile(postToEdit.imageUrl); } catch(e) { console.warn('Old image delete fail', e); }
        }

        const uploadResult = await uploadFiles([coverFile], 'posts', postId);
        if (uploadResult.length > 0) {
            finalCoverUrl = uploadResult[0].url;
        }
      } else if (!coverPreview) {
          // Если обложку удалили
          finalCoverUrl = '';
      }

      // 2. Формирование данных
      const postData: any = {
        id: postId,
        authorId: user.uid,
        authorName: user.displayName || 'Пользователь',
        authorAvatar: user.photoURL,
        title: title.trim(),
        content: content, // HTML из Tiptap
        category,
        type: category, 
        imageUrl: finalCoverUrl,
        location: location.trim(),
        updatedAt: serverTimestamp(),
      };

      if (!isEditMode) {
        postData.createdAt = serverTimestamp();
        postData.likesCount = 0;
        postData.likedBy = [];
        postData.commentsCount = 0;
        postData.views = 0;
        if (communityId) postData.communityId = communityId;
      }

      await setDoc(postRef, postData, { merge: true });

      toast({ title: 'Успешно!', description: 'Ваш пост опубликован.' });
      
      const redirectUrl = communityId ? `/communities/${communityId}` : `/posts/${postId}`;
      router.push(redirectUrl);

    } catch (error: any) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Ошибка', description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const loading = isSubmitting || uploading;

  return (
    <div className="max-w-5xl mx-auto p-4 md:py-8">
        <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-4">
                <Link href={communityId ? `/communities/${communityId}` : "/posts"}>
                    <Button variant="ghost" size="icon"><ArrowLeft /></Button>
                </Link>
                <h1 className="text-2xl font-bold">{isEditMode ? 'Редактировать' : 'Создать публикацию'}</h1>
             </div>
             <Button type="submit" onClick={handleSubmit} disabled={loading} size="lg">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? 'Сохранить' : 'Опубликовать'}
            </Button>
        </div>

        {communityName && (
            <Alert className="mb-6 border-primary/20 bg-primary/5">
                <AlertDescription>
                    Публикация в сообщество: <strong>{communityName}</strong>
                </AlertDescription>
            </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
            
          {/* LEFT COLUMN: CONTENT EDITOR */}
          <div className="space-y-6">
            
            {/* Title Input */}
            <div className="space-y-2">
                <Input 
                    id="title" 
                    placeholder="Заголовок поста" 
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    disabled={loading}
                    className="text-2xl font-bold h-14 border-none px-0 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/50"
                />
            </div>

            {/* Rich Text Editor */}
            <RichTextEditor 
                content={content} 
                onChange={setContent} 
                postId={postId} 
            />

          </div>

          {/* RIGHT COLUMN: SETTINGS & COVER */}
          <div className="space-y-6">
            
            {/* Cover Image */}
            <Card className="overflow-hidden">
                <div className="p-4 pb-2 font-semibold text-sm">Обложка (для ленты)</div>
                <CardContent className="p-4 pt-0">
                    {coverPreview ? (
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden border bg-muted group">
                            <Image src={coverPreview} alt="Cover" fill className="object-cover" />
                            <Button 
                                type="button"
                                variant="destructive" 
                                size="icon" 
                                className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={handleRemoveCover}
                                disabled={loading}
                            >
                                <Trash className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <div 
                            className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-muted-foreground/20 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => coverInputRef.current?.click()}
                        >
                            <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
                            <span className="text-xs text-muted-foreground">Загрузить обложку</span>
                        </div>
                    )}
                    
                    {/* Hidden Input */}
                    <input 
                        ref={coverInputRef}
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleCoverSelect}
                        disabled={loading}
                    />
                    {uploading && <Progress value={progress} className="h-1 mt-2" />}
                </CardContent>
            </Card>

            {/* Settings */}
            <Card>
                 <CardContent className="p-4 space-y-4">
                    <div className="space-y-2">
                        <Label>Категория</Label>
                        <Select value={category} onValueChange={setCategory} disabled={loading}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {postTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Локация</Label>
                        <div className="relative">
                             <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                             <Input 
                                className="pl-9" 
                                placeholder="Добавить место" 
                                value={location} 
                                onChange={e => setLocation(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    </div>
                 </CardContent>
            </Card>
            
            <div className="text-xs text-muted-foreground px-2">
                * Обложка будет отображаться в ленте новостей. В самом посте вы можете добавлять сколько угодно фото через редактор слева.
            </div>
          </div>
        </div>
    </div>
  );
}
