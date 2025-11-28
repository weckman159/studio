
// src/app/posts/create/page.tsx
// Страница создания нового пользовательского поста
// Форма с редактором и загрузкой главного фото. После публикации — переход к посту.
// Gemini: поддержка разных типов поста (блог, отчет, вопрос и т.д.)

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp, doc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Upload, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useFileUpload } from '@/hooks/use-file-upload';
import { Progress } from '@/components/ui/progress';

const CKEditorWrapper = dynamic(() => import('@/components/CKEditorWrapper'), {
  ssr: false,
  loading: () => <p>Загрузка редактора...</p>
});


const postTypes = [
  'Блог', 'Фотоотчет', 'Вопрос', 'Мой опыт', 'Обзор', 'Обслуживание'
];

export default function CreatePostPage() {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const { uploadFiles, uploading, progress, error: uploadError } = useFileUpload({ maxFiles: 1, maxSizeInMB: 5 });


  // Состояния формы
  const [type, setType] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Валидация
  const validate = () => {
    if (!type) {
      setError('Выберите тип поста');
      return false;
    }
    if (!title.trim()) {
      setError('Укажите заголовок');
      return false;
    }
    if (title.length < 5) {
      setError('Заголовок слишком короткий');
      return false;
    }
    if (content.trim().length < 20) {
      setError('Минимальная длина текста — 20 символов');
      return false;
    }
    return true;
  };

  // Загрузка изображения
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Загрузите файл изображения');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Изображение не больше 5 МБ');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Форма отправки
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user || !firestore) {
      setError('Необходимо войти');
      router.push('/auth');
      return;
    }
    if (!validate()) return;

    setLoading(true);
    try {
      const postId = doc(collection(firestore, 'temp')).id;
      let imageUrl = '';
      if (imageFile) {
        const uploadResult = await uploadFiles([imageFile], 'posts', postId);
        if(uploadResult.length > 0) {
            imageUrl = uploadResult[0].url;
        } else {
            throw new Error(uploadError || "Failed to upload image");
        }
      }
      // Добавляем пост
      const docRef = await addDoc(collection(firestore, 'posts'), {
        id: postId,
        type,
        title: title.trim(),
        content: content.trim(),
        imageUrl,
        authorId: user.uid,
        authorName: user.displayName || 'Пользователь',
        authorAvatar: user.photoURL,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        likesCount: 0,
        likedBy: [],
        commentsCount: 0
      });
      router.push(`/posts/${postId}`);
    } catch (err) {
      setError('Ошибка публикации. Попробуйте ещё раз.');
      console.error('Ошибка создания поста:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const totalLoading = loading || uploading;

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Для публикации поста необходимо войти.
            <Link href="/auth" className="ml-2 underline">
              Войти
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <Link href="/posts">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            К постам
          </Button>
        </Link>
        <h1 className="text-4xl font-bold mb-2">Создать пост</h1>
        <p className="text-muted-foreground">
          Опишите ваш опыт, задайте вопрос или просто поделитесь историей.
        </p>
      </div>
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
            {/* Тип поста */}
            <div className="space-y-2">
              <Label>Тип поста *</Label>
              <Select
                value={type}
                onValueChange={setType}
                disabled={totalLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип" />
                </SelectTrigger>
                <SelectContent>
                  {postTypes.map(pt => (
                    <SelectItem value={pt} key={pt}>{pt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Заголовок */}
            <div className="space-y-2">
              <Label htmlFor="title">Заголовок *</Label>
              <Input
                id="title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                maxLength={120}
                disabled={totalLoading}
                required
              />
              <p className="text-sm text-muted-foreground">{title.length}/120</p>
            </div>
            {/* Главная картинка */}
            <div className="space-y-2">
              <Label>Главное фото</Label>
              <div className="flex items-center gap-4">
                {imagePreview ? (
                  <Image src={imagePreview} alt="Фото" width={128} height={128} className="w-32 h-32 rounded-lg object-cover border" />
                ) : (
                  <div className="w-32 h-32 rounded-lg border-2 border-dashed border-muted-foreground flex items-center justify-center">
                    <Upload className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    disabled={totalLoading}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Макс. 5 МБ, оптимально 800x600px
                  </p>
                </div>
              </div>
              {uploading && <Progress value={progress} className="w-full mt-2" />}
            </div>
            {/* Контент (текст или ckeditor) */}
            <div className="space-y-2">
              <Label htmlFor="content">Содержание *</Label>
               <CKEditorWrapper
                initialData={content}
                onChange={(data) => setContent(data)}
              />
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-4">
          <Button
            type="submit"
            size="lg"
            disabled={totalLoading}
            className="flex-1"
          >
            {totalLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {uploading ? `Загрузка... ${progress}%` : 'Публикация...'}
              </>
            ) : (
              'Опубликовать'
            )}
          </Button>
          <Link href="/posts">
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={totalLoading}
            >
              Отмена
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
