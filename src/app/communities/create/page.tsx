
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp, doc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Upload, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useFileUpload } from '@/hooks/use-file-upload';
import { Progress } from '@/components/ui/progress';

// Интерфейс для данных формы
interface CommunityFormData {
  name: string;
  description: string;
  fullDescription: string;
  category: string;
  isPrivate: boolean;
  rules: string;
}

export default function CreateCommunityPage() {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const { uploadFiles, uploading, progress, error: uploadError } = useFileUpload({ maxFiles: 2, maxSizeInMB: 5 });


  // Состояния формы
  const [formData, setFormData] = useState<CommunityFormData>({
    name: '',
    description: '',
    fullDescription: '',
    category: '',
    isPrivate: false,
    rules: ''
  });

  // Состояния для загрузки изображений
  const [imageFile, setImageFile] = useState<File | null>(null); // Файл аватара
  const [coverFile, setCoverFile] = useState<File | null>(null); // Файл обложки
  const [imagePreview, setImagePreview] = useState<string>(''); // Превью аватара
  const [coverPreview, setCoverPreview] = useState<string>(''); // Превью обложки

  // Состояния UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Категории сообществ
  const categories = [
    'Тюнинг',
    'Ремонт',
    'Путешествия',
    'Гонки',
    'Классика',
    'Электромобили',
    'Внедорожники',
    'Мотоциклы',
    'Грузовики',
    'Автоспорт'
  ];

  // Обработчик изменения полей формы
  const handleInputChange = (field: keyof CommunityFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(''); // Очищаем ошибку при изменении
  };

  // Обработчик выбора файла аватара
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Размер изображения не должен превышать 5 МБ');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError('Выберите файл изображения');
        return;
      }

      setImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Обработчик выбора файла обложки
  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Размер изображения не должен превышать 5 МБ');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError('Выберите файл изображения');
        return;
      }

      setCoverFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Валидация формы
  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Введите название сообщества');
      return false;
    }

    if (formData.name.length < 3) {
      setError('Название должно содержать минимум 3 символа');
      return false;
    }

    if (formData.name.length > 50) {
      setError('Название не должно превышать 50 символов');
      return false;
    }

    if (!formData.description.trim()) {
      setError('Введите краткое описание');
      return false;
    }

    if (formData.description.length < 10) {
      setError('Описание должно содержать минимум 10 символов');
      return false;
    }

    if (formData.description.length > 200) {
      setError('Краткое описание не должно превышать 200 символов');
      return false;
    }

    if (!formData.category) {
      setError('Выберите категорию сообщества');
      return false;
    }

    return true;
  };

  // Обработчик отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !firestore) {
      setError('Необходимо войти в систему и инициализировать Firestore');
      router.push('/auth');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const filesToUpload: { file: File, path: 'avatars' | 'covers' }[] = [];
      if(imageFile) filesToUpload.push({ file: imageFile, path: 'avatars' });
      if(coverFile) filesToUpload.push({ file: coverFile, path: 'covers' });

      let imageUrl = '';
      let coverUrl = '';

      if (filesToUpload.length > 0) {
          const communityIdForPath = doc(collection(firestore, 'temp')).id;
          const uploadResults = await uploadFiles(
            filesToUpload.map(f => f.file),
            'communities',
            communityIdForPath
          );
          imageUrl = uploadResults.find(r => r.fileName.startsWith(imageFile?.name || '___'))?.url || '';
          coverUrl = uploadResults.find(r => r.fileName.startsWith(coverFile?.name || '___'))?.url || '';
      }

      const communityData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        fullDescription: formData.fullDescription.trim() || formData.description.trim(),
        category: formData.category,
        isPrivate: formData.isPrivate,
        rules: formData.rules.trim(),
        imageUrl,
        coverUrl,
        adminId: user.uid,
        memberIds: [user.uid],
        membersCount: 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(firestore, 'communities'), communityData);

      router.push(`/communities/${docRef.id}`);

    } catch (error) {
      console.error('Ошибка создания сообщества:', error);
      setError('Не удалось создать сообщество. Попробуйте еще раз.');
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
            Для создания сообщества необходимо войти в систему.
            <Link href="/auth" className="ml-2 underline">
              Войти
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Link href="/communities">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад к сообществам
          </Button>
        </Link>
        <h1 className="text-4xl font-bold mb-2">Создать сообщество</h1>
        <p className="text-muted-foreground">
          Создайте сообщество по интересам и объединяйте людей
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
            <CardTitle>Основная информация</CardTitle>
            <CardDescription>
              Заполните основные данные о вашем сообществе
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">
                Название сообщества <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Например: Любители BMW"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                maxLength={50}
                disabled={totalLoading}
              />
              <p className="text-sm text-muted-foreground">
                {formData.name.length}/50 символов
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Краткое описание <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Опишите сообщество в 1-2 предложениях"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                maxLength={200}
                rows={3}
                disabled={totalLoading}
              />
              <p className="text-sm text-muted-foreground">
                {formData.description.length}/200 символов
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullDescription">
                Полное описание
              </Label>
              <Textarea
                id="fullDescription"
                placeholder="Более подробно расскажите о сообществе, его целях и участниках"
                value={formData.fullDescription}
                onChange={(e) => handleInputChange('fullDescription', e.target.value)}
                rows={5}
                disabled={totalLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">
                Категория <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange('category', value)}
                disabled={totalLoading}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="isPrivate">Приватное сообщество</Label>
                <p className="text-sm text-muted-foreground">
                  Только по приглашению или запросу на вступление
                </p>
              </div>
              <Switch
                id="isPrivate"
                checked={formData.isPrivate}
                onCheckedChange={(checked) => handleInputChange('isPrivate', checked)}
                disabled={totalLoading}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Изображения</CardTitle>
            <CardDescription>
              Добавьте аватар и обложку для вашего сообщества
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="image">Аватар сообщества</Label>
              <div className="flex items-center gap-4">
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="Превью аватара"
                    width={96}
                    height={96}
                    className="w-24 h-24 rounded-lg object-cover border"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                    <Upload className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    disabled={totalLoading}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Рекомендуемый размер: 400x400px, макс. 5 МБ
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cover">Обложка сообщества</Label>
              <div className="space-y-4">
                {coverPreview ? (
                  <Image
                    src={coverPreview}
                    alt="Превью обложки"
                    width={1200}
                    height={400}
                    className="w-full h-48 rounded-lg object-cover border"
                  />
                ) : (
                  <div className="w-full h-48 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                    <Upload className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                )}
                <div>
                  <Input
                    id="cover"
                    type="file"
                    accept="image/*"
                    onChange={handleCoverSelect}
                    disabled={totalLoading}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Рекомендуемый размер: 1200x400px, макс. 5 МБ
                  </p>
                </div>
              </div>
             {uploading && <Progress value={progress} className="w-full mt-2" />}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Правила сообщества</CardTitle>
            <CardDescription>
              Установите правила поведения в сообществе (необязательно)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              id="rules"
              placeholder="Например:&#10;1. Уважайте других участников&#10;2. Не размещайте спам&#10;3. Публикуйте контент по теме"
              value={formData.rules}
              onChange={(e) => handleInputChange('rules', e.target.value)}
              rows={8}
              disabled={totalLoading}
            />
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
                {uploading ? `Загрузка... ${progress}%` : 'Создание...'}
              </>
            ) : (
              'Создать сообщество'
            )}
          </Button>
          <Link href="/communities">
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
    