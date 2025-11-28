// src/components/MarketplaceItemForm.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { doc, collection, addDoc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { useFileUpload } from '@/hooks/use-file-upload';
import { useToast } from '@/hooks/use-toast';
import { MarketplaceItem } from '@/lib/data';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { MultipleImageUpload } from './ImageUpload';
import { deleteFile } from '@/lib/storage';

const formSchema = z.object({
  title: z.string().min(5, 'Название не короче 5 символов').max(80, 'Название не длиннее 80 символов'),
  description: z.string().min(10, 'Описание не короче 10 символов').max(350, 'Описание не длиннее 350 символов'),
  fullDescription: z.string().max(6000, 'Полное описание не длиннее 6000 символов').optional(),
  price: z.coerce.number().min(0, 'Цена не может быть отрицательной'),
  currency: z.string().default('RUB'),
  category: z.string().min(1, 'Выберите категорию'),
  condition: z.string().min(1, 'Выберите состояние'),
  location: z.string().min(2, 'Укажите город').max(60, 'Город не длиннее 60 символов'),
  sellerPhone: z.string().min(5, 'Укажите корректный номер').max(20, 'Номер не длиннее 20 символов').optional(),
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

  // Generate a stable ID for new items
  const newItemId = useMemo(() => isEditMode ? itemToEdit.id : doc(collection(firestore, 'temp')).id, [isEditMode, itemToEdit, firestore]);


  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: itemToEdit ? {
      ...itemToEdit,
      price: itemToEdit.price,
    } : {
      title: '',
      description: '',
      fullDescription: '',
      price: 0,
      currency: 'RUB',
      category: '',
      condition: '',
      location: '',
      sellerPhone: '',
      sellerEmail: user?.email || '',
    },
  });

  useEffect(() => {
    if (itemToEdit) {
      const allImages = [itemToEdit.imageUrl, ...(itemToEdit.gallery || [])].filter(Boolean) as string[];
      setImageUrls(allImages);
    }
  }, [itemToEdit]);

  const handleImageChange = (newUrls: string[]) => {
    const removedUrls = imageUrls.filter(url => !newUrls.includes(url) && !url.startsWith('blob:'));
    setImagesToDelete(prev => [...prev, ...removedUrls]);
    setImageUrls(newUrls);
  };
  
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Необходима авторизация.' });
      return;
    }

    try {
      // 1. Delete images marked for deletion from Storage
      for (const url of imagesToDelete) {
        await deleteFile(url);
      }
      
      // 2. Upload new files to Storage
      let uploadedImageUrls: string[] = [];
      if (filesToUpload.length > 0) {
        const uploadResults = await uploadFiles(filesToUpload, 'listings', newItemId);
        uploadedImageUrls = uploadResults.map(res => res.url);
      }

      const existingImageUrls = imageUrls.filter(url => !url.startsWith('blob:'));
      const finalImageUrls = [...existingImageUrls, ...uploadedImageUrls];
      const mainImageUrl = finalImageUrls[0] || '';
      const galleryUrls = finalImageUrls.slice(1);

      const itemData = {
        ...data,
        imageUrl: mainImageUrl,
        gallery: galleryUrls,
        updatedAt: serverTimestamp(),
      };

      if (isEditMode) {
        // Update existing item
        const itemRef = doc(firestore, 'marketplace', itemToEdit.id);
        await updateDoc(itemRef, itemData);
        toast({ title: 'Успех!', description: 'Объявление обновлено.' });
        router.push(`/marketplace/${itemToEdit.id}`);
      } else {
        // Create new item
        const newItemData = {
          ...itemData,
          id: newItemId, // use the stable ID
          sellerId: user.uid,
          sellerName: user.displayName || 'Пользователь',
          sellerAvatar: user.photoURL || '',
          createdAt: serverTimestamp(),
          views: 0,
        };
        await setDoc(doc(firestore, 'marketplace', newItemId), newItemData);
        toast({ title: 'Успех!', description: 'Объявление размещено.' });
        router.push(`/marketplace/${newItemId}`);
      }

    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Ошибка сохранения', description: e.message });
    }
  };

  const isSubmitting = form.formState.isSubmitting || uploading;
  
  const categories = ['Запчасти', 'Аксессуары', 'Шины и диски', 'Электроника', 'Тюнинг', 'Автомобили', 'Инструменты', 'Другое'];
  const conditions = ['Новое', 'Б/у', 'Отличное', 'Неисправное', 'На запчасти'];

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <Link href="/marketplace">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            К маркетплейсу
          </Button>
        </Link>
        <h1 className="text-4xl font-bold mb-2">{isEditMode ? 'Редактировать объявление' : 'Новое объявление'}</h1>
        <p className="text-muted-foreground">
          {isEditMode ? 'Внесите изменения в ваше объявление.' : 'Заполните данные товара для размещения на площадке.'}
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Параметры товара</CardTitle>
              <CardDescription>Обязательные — отмечены *</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem><FormLabel>Название *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem><FormLabel>Категория *</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Категория" /></SelectTrigger></FormControl><SelectContent>{categories.map(c => <SelectItem value={c} key={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="condition" render={({ field }) => (
                <FormItem><FormLabel>Состояние *</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Состояние" /></SelectTrigger></FormControl><SelectContent>{conditions.map(c => <SelectItem value={c} key={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem><FormLabel>Цена (₽) *</FormLabel><FormControl><Input type="number" min={0} {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="location" render={({ field }) => (
                <FormItem><FormLabel>Местоположение/Город *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Краткое описание *</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="fullDescription" render={({ field }) => (
                <FormItem><FormLabel>Полное описание</FormLabel><FormControl><Textarea rows={7} {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </CardContent>
          </Card>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Фото товара</CardTitle>
              <CardDescription>Главное фото + до 6 дополнительных</CardDescription>
            </CardHeader>
            <CardContent>
               <MultipleImageUpload
                    value={imageUrls}
                    onChange={(urls) => handleImageChange(urls as string[])}
                    onFilesSelected={setFilesToUpload}
                    uploading={uploading}
                    progress={progress}
                    disabled={isSubmitting}
                    maxFiles={7}
                />
            </CardContent>
          </Card>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Контакты для связи</CardTitle>
              <CardDescription>Покупатель сможет сразу написать/позвонить</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <FormField control={form.control} name="sellerPhone" render={({ field }) => (
                <FormItem><FormLabel>Телефон</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
               <FormField control={form.control} name="sellerEmail" render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </CardContent>
          </Card>
          <div className="flex gap-4 mt-4">
            <Button type="submit" size="lg" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{uploading ? `Загрузка... ${progress}%` : 'Сохранение...'}</> : (isEditMode ? 'Сохранить изменения' : 'Разместить объявление')}
            </Button>
            <Link href="/marketplace">
              <Button type="button" variant="outline" size="lg" disabled={isSubmitting}>Отмена</Button>
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
}
