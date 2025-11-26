// src/app/workshops/create/page.tsx
// Страница для добавления новой автомастерской вручную пользователем
// Валидация, поддержка загрузки фото, после создания — переход к мастерской

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useUser, useStorage } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Upload, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useFileUpload } from '@/hooks/use-file-upload';

const specializations = [
  'Мультибренд',
  'BMW',
  'Mercedes',
  'Toyota',
  'VAG',
  'Электро',
  'Детейлинг',
  'Шиномонтаж',
  'Тюнинг'
];

export default function CreateWorkshopPage() {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const { uploadFiles, uploading, progress, error: uploadError } = useFileUpload({ maxFiles: 1, maxSizeInMB: 5});

  // Состояния формы
  const [form, setForm] = useState({
    name: '',
    city: '',
    address: '',
    specialization: '',
    phone: '',
    description: '',
    website: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Загрузите файл изображения');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Размер изображения не больше 5 МБ');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Валидация
  const validate = () => {
    if (!form.name.trim()) return 'Введите название мастерской';
    if (!form.city.trim()) return 'Укажите город';
    if (!form.address.trim()) return 'Введите адрес';
    if (!form.specialization) return 'Выберите специализацию';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!user || !firestore) {
      setError('Для добавления мастерской войдите в систему');
      router.push('/auth');
      return;
    }
    const err = validate();
    if (err) { setError(err); return; }
    setSaving(true);

    try {
      let imageUrl = '';
      if (imageFile) {
        const uploadResult = await uploadFiles([imageFile], 'workshops', user.uid);
        if (uploadResult.length > 0) {
          imageUrl = uploadResult[0].url;
        } else {
            throw new Error(uploadError || "Не удалось загрузить изображение");
        }
      }

      const wsData: any = {
        name: form.name.trim(),
        city: form.city.trim(),
        address: form.address.trim(),
        specialization: form.specialization,
        description: form.description.trim(),
        phone: form.phone.trim(),
        website: form.website.trim(),
        imageUrl,
        rating: 0,
        reviewsCount: 0,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        source: 'user'
      };
      const docRef = await addDoc(collection(firestore, 'workshops'), wsData);
      router.push(`/workshops/${docRef.id}`);
    } catch (err) {
      setError('Не удалось добавить мастерскую. Попробуйте ещё раз.');
      console.error('Ошибка создания мастерской:', err);
    } finally {
      setSaving(false);
    }
  };

  const totalLoading = saving || uploading;

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Для добавления мастерской необходимо войти.
            <Link href="/auth" className="ml-2 underline">
              Войти
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <Link href="/workshops">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            К мастерским
          </Button>
        </Link>
        <h1 className="text-4xl font-bold mb-2">Добавить мастерскую</h1>
        <p className="text-muted-foreground">
          Заполните данные автомастерской — имя, специализацию, адрес. Добавьте описание и фото для доверия.
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
            <CardTitle>Информация о мастерской</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Название *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={e => handleField('name', e.target.value)}
                maxLength={60}
                disabled={totalLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Город *</Label>
              <Input
                id="city"
                value={form.city}
                onChange={e => handleField('city', e.target.value)}
                maxLength={30}
                disabled={totalLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Адрес *</Label>
              <Input
                id="address"
                value={form.address}
                onChange={e => handleField('address', e.target.value)}
                maxLength={100}
                disabled={totalLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Специализация *</Label>
              <Select
                value={form.specialization}
                onValueChange={v => handleField('specialization', v)}
                disabled={totalLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите специализацию" />
                </SelectTrigger>
                <SelectContent>
                  {specializations.map(s => (
                    <SelectItem value={s} key={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={e => handleField('phone', e.target.value)}
                maxLength={20}
                disabled={totalLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Сайт (если есть)</Label>
              <Input
                id="website"
                value={form.website}
                onChange={e => handleField('website', e.target.value)}
                maxLength={60}
                disabled={totalLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={e => handleField('description', e.target.value)}
                rows={4}
                maxLength={400}
                disabled={totalLoading}
              />
            </div>
          </CardContent>
        </Card>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Фото сервисного центра</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <div className="relative w-32 h-32">
                    <Image src={imagePreview} alt="Фото" fill className="rounded-lg object-cover border" />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
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
                  Рекомендуемый размер: 800x400px, макс. 5 МБ
                </p>
              </div>
            </div>
             {uploading && <Progress value={progress} className="w-full mt-2" />}
          </CardContent>
        </Card>
        <Button type="submit" size="lg" disabled={totalLoading} className="w-full">
          {totalLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {uploading ? `Загрузка... ${progress}%` : 'Сохранение...'}
            </>
          ) : (
            'Добавить мастерскую'
          )}
        </Button>
      </form>
    </div>
  );
}