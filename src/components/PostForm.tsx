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

const CKEditorWrapper = dynamic(() => import('@/components/CKEditorWrapper'), {
  ssr: false,
  loading: () => <div className="border rounded-md min-h-[200px] flex items-center justify-center"><p>Загрузка редактора...</p></div>
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
  const { uploadFiles, uploading, progress, error: uploadError } = useFileUpload({ maxFiles: 1, maxSizeInMB: 5 });

  const [type, setType] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditMode = !!postToEdit;

  useEffect(() => {
    if (isEditMode && postToEdit) {
      setType(postToEdit.type || postToEdit.category || '');
      setTitle(postToEdit.title);
      setContent(postToEdit.content);
      setImagePreview(postToEdit.imageUrl || '');
    }
  }, [postToEdit, isEditMode]);
  
  const validate = () => {
    if (!type) { setError('Выберите тип поста'); return false; }
    if (!title.trim() || title.length < 5) { setError('Заголовок должен содержать минимум 5 символов'); return false; }
    if (!content.trim() || content.length < 20) { setError('Минимальная длина текста — 20 символов'); return false; }
    return true;
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) { setError('Загрузите файл изображения'); return; }
      if (file.size > 5 * 1024 * 1024) { setError('Изображение не больше 5 МБ'); return; }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = async () => {
    setImageFile(null);
    setImagePreview('');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Необходимо войти' });
      router.push('/auth');
      return;
    }
    if (!validate()) return;

    setLoading(true);
    try {
        const postId = postToEdit?.id || doc(collection(firestore, 'posts')).id;
        const postRef = doc(firestore, 'posts', postId);

        let imageUrl = postToEdit?.imageUrl || '';

        // 1. Handle image upload first if there is a new file
        if (imageFile) {
            // If editing and there was an old image, delete it
            if (isEditMode && postToEdit?.imageUrl) {
                await deleteFile(postToEdit.imageUrl);
            }
            const uploadResult = await uploadFiles([imageFile], 'posts', postId);
            if (uploadResult.length > 0) {
                imageUrl = uploadResult[0].url;
            } else {
                throw new Error(uploadError || "Ошибка загрузки изображения. Попробуйте другой файл.");
            }
        } else if (isEditMode && postToEdit?.imageUrl && !imagePreview) {
            // If in edit mode and the preview was cleared, delete the old image
            await deleteFile(postToEdit.imageUrl);
            imageUrl = '';
        }

        // 2. Prepare post data
        const postData = {
            id: postId,
            authorId: user.uid,
            authorName: user.displayName || 'Пользователь',
            authorAvatar: user.photoURL,
            type,
            category: type,
            title: title.trim(),
            content: content.trim(),
            imageUrl,
            updatedAt: serverTimestamp(),
            ...(isEditMode ? {} : { 
                createdAt: serverTimestamp(),
                likesCount: 0,
                likedBy: [],
                commentsCount: 0,
                views: 0,
                bookmarks: 0,
                communityId: communityId,
            })
        };

        // 3. Save document to Firestore
        await setDoc(postRef, postData, { merge: true });

        toast({ title: "Успех!", description: `Пост успешно ${isEditMode ? 'обновлен' : 'создан'}.` });
        router.push(`/posts/${postId}`);
        router.refresh();

    } catch (err: any) {
        let errorMessage = 'Ошибка публикации. Попробуйте ещё раз.';
        if (err.code === 'permission-denied') {
            errorMessage = 'Недостаточно прав для выполнения этого действия. Проверьте правила безопасности Firestore.';
        } else if (err.code === 'unavailable') {
            errorMessage = 'Нет подключения к интернету или сервис недоступен.';
        } else if (err.message?.includes('upload')) {
            errorMessage = err.message; // Use specific upload error
        }
        setError(errorMessage);
        console.error('Ошибка создания/обновления поста:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const totalLoading = loading || uploading;

  let backLink = '/posts';
  if (isEditMode && postToEdit) {
      backLink = postToEdit.communityId ? `/communities/${postToEdit.communityId}` : `/posts/${postToEdit.id}`;
  } else if (communityId) {
      backLink = `/communities/${communityId}`;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <Link href={backLink}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад
          </Button>
        </Link>
        <h1 className="text-4xl font-bold mb-2">{isEditMode ? 'Редактировать пост' : 'Создать пост'}</h1>
        <p className="text-muted-foreground">
          {isEditMode ? 'Внесите изменения и сохраните.' : 'Опишите ваш опыт, задайте вопрос или просто поделитесь историей.'}
        </p>
      </div>
      {communityName && (
        <Alert className="mb-6">
            <Users className="h-4 w-4" />
            <AlertDescription>
                Вы публикуете в сообществе: <strong>{communityName}</strong>
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
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Параметры поста</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Тип поста *</Label>
              <Select value={type} onValueChange={setType} disabled={totalLoading}>
                <SelectTrigger><SelectValue placeholder="Выберите тип" /></SelectTrigger>
                <SelectContent>{postTypes.map(pt => <SelectItem value={pt} key={pt}>{pt}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Заголовок *</Label>
              <Input id="title" value={title} onChange={e => setTitle(e.target.value)} maxLength={120} disabled={totalLoading} required />
              <p className="text-sm text-muted-foreground">{title.length}/120</p>
            </div>
            <div className="space-y-2">
              <Label>Главное фото</Label>
              {imagePreview ? (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                    <Image src={imagePreview} alt="Предпросмотр" fill className="object-cover" />
                    <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 z-10" onClick={handleRemoveImage}>
                        <Trash className="h-4 w-4" />
                    </Button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                    <div className="w-32 h-32 rounded-lg border-2 border-dashed border-muted-foreground flex items-center justify-center">
                        <Upload className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <div className="flex-1">
                        <Input type="file" accept="image/*" onChange={handleImageSelect} disabled={totalLoading} />
                        <p className="text-xs text-muted-foreground mt-1">Макс. 5 МБ, оптимально 800x600px</p>
                    </div>
                </div>
              )}
              {uploading && <Progress value={progress} className="w-full mt-2" />}
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Содержание *</Label>
               <CKEditorWrapper initialData={content} onChange={(data) => setContent(data)} />
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-4">
          <Button type="submit" size="lg" disabled={totalLoading} className="flex-1">
            {totalLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{uploading ? `Загрузка... ${progress}%` : 'Сохранение...'}</> : (isEditMode ? 'Сохранить изменения' : 'Опубликовать')}
          </Button>
          <Link href={backLink}>
            <Button type="button" variant="outline" size="lg" disabled={totalLoading}>Отмена</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
