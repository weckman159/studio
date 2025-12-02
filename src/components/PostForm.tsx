// src/components/PostForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, updateDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Upload, Loader2, AlertCircle, Trash, Users } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useFileUpload } from '@/hooks/use-file-upload';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import type { Post } from '@/lib/types';
import { deleteFile } from '@/lib/storage';

// Динамический импорт редактора
const CKEditorWrapper = dynamic(() => import('@/components/CKEditorWrapper'), {
  ssr: false,
  loading: () => <div className="border rounded-md h-[200px] bg-muted animate-pulse" />
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
  const { uploadFiles, uploading, progress, error: uploadError } = useFileUpload({ maxFiles: 1, maxSizeInMB: 10 });

  const [type, setType] = useState(postToEdit?.category || 'Блог');
  const [title, setTitle] = useState(postToEdit?.title || '');
  const [content, setContent] = useState(postToEdit?.content || '');
  
  // Image states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(postToEdit?.imageUrl || '');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditMode = !!postToEdit;
  
  const validate = () => {
    if (!title.trim() || title.length < 3) { 
        setError('Заголовок слишком короткий'); 
        return false; 
    }
    // Разрешаем короткий контент если это фотоотчет
    if ((!content.trim() || content.length < 10) && type !== 'Фотоотчет') { 
        setError('Напишите хотя бы пару предложений'); 
        return false; 
    }
    return true;
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) { setError('Нужно выбрать изображение'); return; }
      if (file.size > 10 * 1024 * 1024) { setError('Файл слишком большой (макс 10МБ)'); return; }
      
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Ошибка авторизации' });
      return;
    }
    if (!validate()) return;

    setLoading(true);
    try {
        // Генерируем ID сразу, чтобы использовать его в пути к файлу
        const postId = postToEdit?.id || doc(collection(firestore, 'posts')).id;
        const postRef = doc(firestore, 'posts', postId);

        let imageUrl = postToEdit?.imageUrl || '';

        // 1. Загрузка фото если выбрано новое
        if (imageFile) {
            // Удаляем старое если было
            if (isEditMode && postToEdit?.imageUrl && postToEdit.imageUrl !== imagePreview) {
                try { await deleteFile(postToEdit.imageUrl); } catch(e) { console.warn("Old image delete fail", e)}
            }
            
            const uploadResult = await uploadFiles([imageFile], 'posts', postId);
            if (uploadResult.length > 0) {
                imageUrl = uploadResult[0].url;
            }
        } else if (isEditMode && !imagePreview && postToEdit?.imageUrl) {
            // Пользователь удалил картинку
            try { await deleteFile(postToEdit.imageUrl); } catch(e) { console.warn("Old image delete fail", e)}
            imageUrl = '';
        }

        // 2. Данные поста
        const postData: any = {
            id: postId,
            authorId: user.uid,
            authorName: user.displayName || 'Пользователь',
            authorAvatar: user.photoURL || null,
            type,
            category: type,
            title: title.trim(),
            content: content.trim(),
            imageUrl,
            updatedAt: serverTimestamp(),
        };

        // Добавляем поля только при создании
        if (!isEditMode) {
            postData.createdAt = serverTimestamp();
            postData.likesCount = 0;
            postData.likedBy = [];
            postData.commentsCount = 0;
            postData.views = 0;
            if (communityId) postData.communityId = communityId;
        }

        // 3. Запись в базу
        await setDoc(postRef, postData, { merge: true });

        toast({ title: "Успешно!", description: "Ваш пост опубликован." });
        
        // Редирект
        const redirectUrl = communityId 
            ? `/communities/${communityId}` 
            : `/posts/${postId}`;
            
        router.push(redirectUrl);
        router.refresh();

    } catch (err: any) {
        console.error('Post submit error:', err);
        setError(err.message || 'Не удалось опубликовать пост');
    } finally {
      setLoading(false);
    }
  };
  
  const totalLoading = loading || uploading;
  let backLink = communityId ? `/communities/${communityId}` : '/posts';

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <Link href={backLink}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Отмена
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">{isEditMode ? 'Редактирование' : 'Новая запись'}</h1>
        <div className="w-20"></div> {/* Spacer */}
      </div>

      {communityName && (
        <Alert className="mb-6 border-primary/20 bg-primary/5">
            <Users className="h-4 w-4 text-primary" />
            <AlertDescription>
                Публикация в сообщество: <span className="font-semibold">{communityName}</span>
            </AlertDescription>
        </Alert>
      )}

      {(error || uploadError) && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || uploadError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="border shadow-sm">
          <CardContent className="p-6 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="title" className="text-base">Заголовок</Label>
                    <Input 
                        id="title" 
                        value={title} 
                        onChange={e => setTitle(e.target.value)} 
                        placeholder="О чем хотите рассказать?" 
                        className="text-lg font-medium h-12"
                        maxLength={100}
                        disabled={totalLoading}
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-base">Тип</Label>
                    <Select value={type} onValueChange={setType} disabled={totalLoading}>
                        <SelectTrigger className="h-12">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {postTypes.map(pt => <SelectItem value={pt} key={pt}>{pt}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
              <Label className="text-base">Обложка поста</Label>
              {imagePreview ? (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden border bg-muted group">
                    <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <Button type="button" variant="destructive" onClick={handleRemoveImage}>
                            <Trash className="mr-2 h-4 w-4" /> Удалить фото
                        </Button>
                    </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-muted-foreground/25 rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Нажмите для загрузки</span> или перетащите</p>
                        <p className="text-xs text-muted-foreground">JPG, PNG (макс. 10MB)</p>
                    </div>
                    <Input type="file" className="hidden" accept="image/*" onChange={handleImageSelect} disabled={totalLoading} />
                </label>
              )}
              {uploading && <Progress value={progress} className="h-2 mt-2" />}
            </div>

            <div className="space-y-2">
              <Label className="text-base">Текст</Label>
              <div className="prose-editor-wrapper min-h-[300px]">
                 <CKEditorWrapper initialData={content} onChange={(data) => setContent(data)} />
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full text-lg h-12" disabled={totalLoading}>
                {totalLoading ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {uploading ? 'Загрузка фото...' : 'Публикация...'}
                    </>
                ) : (
                    isEditMode ? 'Сохранить изменения' : 'Опубликовать'
                )}
            </Button>

          </CardContent>
        </Card>
      </form>
    </div>
  );
}
