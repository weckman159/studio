// src/app/marketplace/create/page.tsx
// Страница для размещения нового объявления на маркетплейсе
// Позволяет пользователю добавить автозапчасть, авто, аксессуар с фото и контактами
// Gemini: валидация, загрузка фото, сохранение в Firestore

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { useFileUpload } from '@/hooks/use-file-upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Upload, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface MarketplaceForm {
  title: string;
  description: string;
  fullDescription: string;
  price: string;
  currency: string;
  category: string;
  condition: string;
  location: string;
  sellerPhone: string;
  sellerEmail: string;
}

export default function MarketplaceCreatePage() {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const {uploadFiles, uploading, progress, error: uploadError } = useFileUpload({maxSizeInMB: 5, maxFiles: 7});

  // Состояния формы
  const [form, setForm] = useState<MarketplaceForm>({
    title: '',
    description: '',
    fullDescription: '',
    price: '',
    currency: 'RUB',
    category: '',
    condition: '',
    location: '',
    sellerPhone: '',
    sellerEmail: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreview, setGalleryPreview] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if(user) {
        setForm(prev => ({...prev, sellerEmail: user.email || ''}));
    }
  }, [user]);

  // Категории и состояния
  const categories = [
    'Запчасти', 'Аксессуары', 'Шины и диски', 'Электроника',
    'Тюнинг', 'Автомобили', 'Инструменты', 'Другое'
  ];
  const conditions = ['Новое', 'Б/у', 'Отличное', 'Неисправное', 'На запчасти'];

  // Поля формы
  const handleInput = (field: keyof MarketplaceForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  // Загрузка главного фото
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

  // Загрузка фотографий галереи
  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 6); // максимум 6 фото
    const previews: string[] = [];
    const validFiles: File[] = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 5 * 1024 * 1024) continue;
      previews.push(URL.createObjectURL(file));
      validFiles.push(file);
    }
    setGalleryFiles(validFiles);
    setGalleryPreview(previews);
  };

  // Валидация
  const validate = () => {
    if (!form.title.trim()) { setError('Укажите название товара'); return false; }
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) { setError('Укажите корректную цену'); return false; }
    if (!form.category) { setError('Выберите категорию'); return false; }
    if (!form.condition) { setError('Выберите состояние'); return false; }
    if (!form.location.trim()) { setError('Укажите местоположение'); return false; }
    if (!form.sellerPhone.trim()) { setError('Укажите контакт для связи'); return false; }
    if (!form.sellerEmail.trim()) { setError('Укажите email'); return false; }
    return true;
  };

  // Отправка формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!user || !firestore) {
      setError('Нужно войти в систему');
      router.push('/auth');
      return;
    }
    if (!validate()) return;
    setLoading(true);

    try {
        let imageUrl = '';
        let galleryUrls: string[] = [];
        const allFiles = [];
        if (imageFile) allFiles.push(imageFile);
        if (galleryFiles.length > 0) allFiles.push(...galleryFiles);

        if (allFiles.length > 0) {
            const uploadResults = await uploadFiles(allFiles, 'listings', user.uid);
            if (imageFile) {
                imageUrl = uploadResults.shift()?.url || '';
            }
            galleryUrls = uploadResults.map(r => r.url);
        }
      
      // Создаем объявление
      const result = await addDoc(collection(firestore, 'marketplace'), {
        title: form.title.trim(),
        description: form.description.trim(),
        fullDescription: form.fullDescription.trim() || form.description.trim(),
        price: Number(form.price),
        currency: form.currency || 'RUB',
        category: form.category,
        condition: form.condition,
        location: form.location.trim(),
        sellerId: user.uid,
        sellerName: user.displayName || 'Пользователь',
        sellerAvatar: user.photoURL,
        sellerPhone: form.sellerPhone.trim(),
        sellerEmail: form.sellerEmail.trim(),
        imageUrl,
        gallery: galleryUrls,
        createdAt: serverTimestamp(),
        views: 0
      });
      router.push(`/marketplace/${result.id}`);
    } catch (err) {
      setError('Ошибка сохранения. Попробуйте еще раз.');
      console.error('Ошибка добавления товара:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const isFormSubmitting = loading || uploading;

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Для размещения объявления необходимо войти в систему.
            <Link href="/auth" className="ml-2 underline">
              Войти
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <Link href="/marketplace">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            К маркетплейсу
          </Button>
        </Link>
        <h1 className="text-4xl font-bold mb-2">Новое объявление</h1>
        <p className="text-muted-foreground">
          Заполните данные товара для размещения на площадке.
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
            <CardTitle>Параметры товара</CardTitle>
            <CardDescription>Обязательные — отмечены *</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Название *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={e => handleInput('title', e.target.value)}
                maxLength={80}
                disabled={isFormSubmitting}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Категория *</Label>
              <Select
                value={form.category}
                onValueChange={v => handleInput('category', v)}
                disabled={isFormSubmitting}
                required
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Категория" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem value={c} key={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="condition">Состояние *</Label>
              <Select
                value={form.condition}
                onValueChange={v => handleInput('condition', v)}
                disabled={isFormSubmitting}
                required
              >
                <SelectTrigger id="condition">
                  <SelectValue placeholder="Состояние" />
                </SelectTrigger>
                <SelectContent>
                  {conditions.map(c => <SelectItem value={c} key={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Цена (₽) *</Label>
              <Input
                id="price"
                type="number"
                min={0}
                max={1_000_000_000}
                value={form.price}
                onChange={e => handleInput('price', e.target.value)}
                disabled={isFormSubmitting}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Местоположение/Город *</Label>
              <Input
                id="location"
                value={form.location}
                onChange={e => handleInput('location', e.target.value)}
                maxLength={60}
                disabled={isFormSubmitting}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Краткое описание *</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={e => handleInput('description', e.target.value)}
                maxLength={350}
                rows={3}
                disabled={isFormSubmitting}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullDescription">Полное описание</Label>
              <Textarea
                id="fullDescription"
                value={form.fullDescription}
                onChange={e => handleInput('fullDescription', e.target.value)}
                rows={7}
                maxLength={600}
                disabled={isFormSubmitting}
              />
            </div>
          </CardContent>
        </Card>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Фото товара</CardTitle>
            <CardDescription>Главное фото + до 6 дополнительных</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 mb-3">
              {imagePreview ? (
                <Image src={imagePreview} alt="Фото" width={96} height={96} className="w-24 h-24 rounded-lg object-cover border" />
              ) : (
                <div className="w-24 h-24 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                  <Upload className="h-8 w-8 text-muted-foreground/50" />
                </div>
              )}
              <div className="flex-1">
                <Label htmlFor="image">Главное фото</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  disabled={isFormSubmitting}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Рекомендуемый размер: 800x600px, макс. 5 МБ
                </p>
              </div>
            </div>
            {/* Галерея фото */}
            <div>
              <Label htmlFor="gallery">Дополнительные фото</Label>
              <Input
                id="gallery"
                type="file"
                accept="image/*"
                multiple
                onChange={handleGallerySelect}
                disabled={isFormSubmitting}
              />
              <div className="flex gap-2 mt-2 flex-wrap">
                {galleryPreview.map((src, i) => (
                  <Image key={i} src={src} alt={`Превью ${i + 1}`} width={64} height={64} className="w-16 h-16 object-cover rounded border" />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                До 6 фото, макс. 5 МБ каждое
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Контакты для связи</CardTitle>
            <CardDescription>Покупатель сможет сразу написать/позвонить</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sellerPhone">Телефон *</Label>
              <Input
                id="sellerPhone"
                value={form.sellerPhone}
                onChange={e => handleInput('sellerPhone', e.target.value)}
                maxLength={20}
                required
                disabled={isFormSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sellerEmail">Email *</Label>
              <Input
                id="sellerEmail"
                type="email"
                value={form.sellerEmail}
                onChange={e => handleInput('sellerEmail', e.target.value)}
                maxLength={70}
                required
                disabled={isFormSubmitting}
              />
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-4 mt-4">
          <Button
            type="submit"
            size="lg"
            disabled={isFormSubmitting}
            className="flex-1"
          >
            {isFormSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {uploading ? `Загрузка... ${progress}%` : 'Сохранение...'}
              </>
            ) : (
              'Разместить объявление'
            )}
          </Button>
          <Link href="/marketplace">
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={isFormSubmitting}
            >
              Отмена
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
