// src/components/MarketplaceItemForm.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { doc, collection, addDoc, updateDoc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { useFileUpload } from '@/hooks/use-file-upload';
import { useToast } from '@/hooks/use-toast';
import { MarketplaceItem } from '@/lib/types';
import { SmartButton } from '@/components/shared/SmartButton'; // ЗАМЕНА

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, AlertCircle } from 'lucide-react';

const formSchema = z.object({
  title: z.string().min(5, 'Название не короче 5 символов').max(80, 'Название не длиннее 80 символов'),
  description: z.string().min(10, 'Описание не короче 10 символов').max(350, 'Описание не длиннее 350 символов'),
  fullDescription: z.string().max(6000, 'Полное описание не длиннее 6000 символов').optional(),
  price: z.coerce.number().min(0, 'Цена не может быть отрицательной'),
  currency: z.string().default('RUB'),
  category: z.string().min(1, 'Выберите категорию'),
  condition: z.string().min(1, 'Выберите состояние'),
  location: z.string().min(2, 'Укажите город').max(60, 'Город не длиннее 60 символов'),
  sellerPhone: z.string().max(20, 'Номер не длиннее 20 символов').optional(),
  sellerEmail: z.string().email('Некорректный email').max(70, 'Email не длиннее 70 символов').optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface MarketplaceItemFormProps {
  itemToEdit?: MarketplaceItem;
}

export function MarketplaceItemForm({ itemToEdit }: MarketplaceItemFormProps) {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { uploadFiles, uploading, progress } = useFileUpload({ maxSizeInMB: 5, maxFiles: 7 });

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  
  const isEditMode = !!itemToEdit;
  const newItemId = useMemo(() => isEditMode ? itemToEdit.id : doc(collection(firestore, 'temp')).id, [isEditMode, itemToEdit, firestore]);
  
  const [canGoBack, setCanGoBack] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCanGoBack(window.history.length > 1);
    }
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: itemToEdit ? { ...itemToEdit } : {
      title: '', description: '', fullDescription: '', price: 0, currency: 'RUB', category: '', condition: '', location: '',
      sellerPhone: '', sellerEmail: user?.email || '',
    },
  });

  useEffect(() => {
    if (itemToEdit) {
      const allImages = [itemToEdit.imageUrl, ...(itemToEdit.gallery?.map(g => g.url) || [])].filter(Boolean) as string[];
      setImageUrls(allImages);
    }
  }, [itemToEdit]);

  const handleImageChange = (newUrls: string[]) => {
    const removedUrls = imageUrls.filter(url => !newUrls.includes(url) && !url.startsWith('blob:'));
    setImagesToDelete(prev => [...prev, ...removedUrls]);
    setImageUrls(newUrls);
  };
  
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    // ... (остальная логика без изменений)
  };

  const isSubmitting = form.formState.isSubmitting || uploading;
  
  const categories = ['Запчасти', 'Аксессуары', 'Шины и диски', 'Электроника', 'Тюнинг', 'Автомобили', 'Инструменты', 'Другое'];
  const conditions = ['Новое', 'Б/у', 'Отличное', 'Неисправное', 'На запчасти'];

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        {/* ИСПРАВЛЕНИЕ: Кнопка "Назад" с проверкой history */}
        {canGoBack && (
            <Button variant="ghost" size="sm" className="mb-4" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Назад
            </Button>
        )}
        <h1 className="text-4xl font-bold mb-2">{isEditMode ? 'Редактировать объявление' : 'Новое объявление'}</h1>
        <p className="text-muted-foreground">
          {isEditMode ? 'Внесите изменения в ваше объявление.' : 'Заполните данные товара для размещения на площадке.'}
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* ... (остальная форма без изменений) */}

          <div className="flex gap-4 mt-8">
            {/* ЗАМЕНА: Используем SmartButton */}
            <SmartButton type="submit" size="lg" disabled={isSubmitting} className="flex-1" loadingText={uploading ? `Загрузка... ${progress}%` : 'Сохранение...'}>
              {isEditMode ? 'Сохранить изменения' : 'Разместить объявление'}
            </SmartButton>
            {canGoBack && <Button type="button" variant="outline" size="lg" disabled={isSubmitting} onClick={() => router.back()}>Отмена</Button>}
          </div>
        </form>
      </Form>
    </div>
  );
}
