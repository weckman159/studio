
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { collection, addDoc, serverTimestamp, doc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Upload, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useFileUpload } from '@/hooks/use-file-upload';
import { Progress } from '@/components/ui/progress';

// Структура формы события
interface EventFormData {
  title: string;
  description: string;
  fullDescription: string;
  location: string;
  address: string;
  startDate: Date | null;
  endDate: Date | null;
  category: string;
  requirements: string;
  schedule: string;
  maxParticipants: number; // 0 или пусто — без ограничения
}

export default function CreateEventPage() {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const { uploadFiles, uploading, progress, error: uploadError } = useFileUpload({ maxFiles: 1, maxSizeInMB: 5});

  // Состояния формы
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    fullDescription: '',
    location: '',
    address: '',
    startDate: null,
    endDate: null,
    category: '',
    requirements: '',
    schedule: '',
    maxParticipants: 0,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Категории событий
  const categories = [
    'Встречи',
    'Пробеги',
    'Слеты',
    'Гонки',
    'Выставки',
    'Образование',
    'Другое'
  ];

  // Обработка поля формы
  const handleInputChange = (field: keyof EventFormData, value: string | number | boolean | Date | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  // Загрузка изображения
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Выберите файл изображения');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Размер изображения не должен превышать 5 МБ');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Валидация формы
  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('Введите название события');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Введите краткое описание');
      return false;
    }
    if (!formData.location.trim()) {
      setError('Укажите место проведения');
      return false;
    }
    if (!formData.category) {
      setError('Выберите категорию');
      return false;
    }
    if (!formData.startDate) {
      setError('Выберите дату и время начала');
      return false;
    }
    if (formData.endDate && formData.endDate < formData.startDate) {
      setError('Дата окончания раньше даты начала');
      return false;
    }
    return true;
  };

  // Обработка отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore) {
      setError('Необходимо войти в систему');
      router.push('/auth');
      return;
    }
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    try {
      const eventIdForPath = doc(collection(firestore, 'temp')).id;
      let imageUrl = '';
      if (imageFile) {
        const uploadResult = await uploadFiles([imageFile], 'events', eventIdForPath);
        if(uploadResult.length > 0) {
            imageUrl = uploadResult[0].url;
        } else {
            throw new Error(uploadError || "Не удалось загрузить изображение");
        }
      }

      // Сохраняем событие
      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        fullDescription: formData.fullDescription.trim() || formData.description.trim(),
        location: formData.location.trim(),
        address: formData.address.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        category: formData.category,
        requirements: formData.requirements.trim(),
        schedule: formData.schedule.trim(),
        imageUrl,
        organizerId: user.uid,
        organizerName: user.displayName || 'Пользователь',
        organizerAvatar: user.photoURL,
        participantIds: [user.uid],
        participantsCount: 1,
        maxParticipants: formData.maxParticipants > 0 ? formData.maxParticipants : null,
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(collection(firestore, 'events'), eventData);
      router.push(`/events/${docRef.id}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Не удалось создать событие. Попробуйте ещё раз.');
      console.error('Ошибка создания события:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Для создания события необходимо войти в систему.
            <Link href="/auth" className="ml-2 underline">
              Войти
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  const totalLoading = loading || uploading;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Link href="/events">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад к событиям
          </Button>
        </Link>
        <h1 className="text-4xl font-bold mb-2">Создать событие</h1>
        <p className="text-muted-foreground">
          Заполните детали мероприятия, чтобы добавить его на портал
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
              Заполните основные поля о вашем событии
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Название события *</Label>
              <Input
                id="title"
                placeholder="Например: Весенний автопробег"
                value={formData.title}
                onChange={e => handleInputChange('title', e.target.value)}
                disabled={totalLoading}
                maxLength={80}
              />
              <p className="text-sm text-muted-foreground">
                {formData.title.length}/80 символов
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Краткое описание *</Label>
              <Textarea
                id="description"
                placeholder="Опишите событие кратко"
                value={formData.description}
                maxLength={250}
                onChange={e => handleInputChange('description', e.target.value)}
                rows={3}
                disabled={totalLoading}
              />
              <p className="text-sm text-muted-foreground">
                {formData.description.length}/250 символов
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullDescription">Полное описание</Label>
              <Textarea
                id="fullDescription"
                value={formData.fullDescription}
                onChange={e => handleInputChange('fullDescription', e.target.value)}
                placeholder="Детально расскажите о событии"
                rows={6}
                disabled={totalLoading}
              />
            </div>
            <div className="space-y-2">
              <Label>Категория *</Label>
              <Select
                value={formData.category}
                onValueChange={v => handleInputChange('category', v)}
                disabled={totalLoading}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Место проведения *</Label>
                <Input
                  id="location"
                  placeholder="Например: Москва, Лужники"
                  value={formData.location}
                  onChange={e => handleInputChange('location', e.target.value)}
                  disabled={totalLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Полный адрес</Label>
                <Input
                  id="address"
                  placeholder="Адрес или координаты для карты"
                  value={formData.address}
                  onChange={e => handleInputChange('address', e.target.value)}
                  disabled={totalLoading}
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Дата и время начала *</Label>
                <DateTimePicker
                  date={formData.startDate}
                  setDate={date => handleInputChange('startDate', date)}
                  disabled={totalLoading}
                />
              </div>
              <div className="space-y-2">
                <Label>Дата и время окончания</Label>
                <DateTimePicker
                  date={formData.endDate}
                  setDate={date => handleInputChange('endDate', date)}
                  disabled={totalLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxParticipants">Лимит участников</Label>
              <Input
                id="maxParticipants"
                type="number"
                min={0}
                placeholder="Оставьте пустым — без ограничений"
                value={formData.maxParticipants || ''}
                onChange={e => handleInputChange('maxParticipants', Number(e.target.value || 0))}
                disabled={totalLoading}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Изображение</CardTitle>
            <CardDescription>
              Прикрепите обложку для события
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-2">
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
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Дополнительно</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Требования к участникам</Label>
              <Textarea
                placeholder="Например: только владельцы BMW"
                value={formData.requirements}
                onChange={e => handleInputChange('requirements', e.target.value)}
                disabled={totalLoading}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Программа мероприятия</Label>
              <Textarea
                placeholder="Временной план или расписание"
                value={formData.schedule}
                onChange={e => handleInputChange('schedule', e.target.value)}
                disabled={totalLoading}
                rows={5}
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
                {uploading ? `Загрузка... ${progress}%` : 'Создание...'}
              </>
            ) : (
              'Создать событие'
            )}
          </Button>
          <Link href="/events">
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
