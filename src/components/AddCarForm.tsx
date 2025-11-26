
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser, useFirestore } from '@/firebase';
import { collection, doc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Car } from '@/lib/data';
import { MultipleImageUpload } from './ImageUpload';
import { useCarPhotosUpload } from '@/hooks/use-file-upload';


const carFormSchema = z.object({
  brand: z.string().min(1, { message: 'Бренд обязателен' }),
  model: z.string().min(1, { message: 'Модель обязательна' }),
  year: z.coerce.number().min(1900, { message: 'Неверный год' }).max(new Date().getFullYear() + 1, { message: 'Неверный год'}),
  engine: z.string().min(1, { message: 'Двигатель обязателен'}),
  description: z.string().optional(),
});

type CarFormValues = z.infer<typeof carFormSchema>;

interface AddCarFormProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  carToEdit?: Car | null;
}

export function AddCarForm({ isOpen, setIsOpen, carToEdit }: AddCarFormProps) {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  
  const { uploadFiles, uploading, progress, error: uploadError } = useCarPhotosUpload();


  const form = useForm<CarFormValues>({
    resolver: zodResolver(carFormSchema),
    defaultValues: {
      brand: '',
      model: '',
      year: undefined,
      engine: '',
      description: '',
    },
  });
  
  const carId = useMemo(() => carToEdit ? carToEdit.id : doc(collection(firestore, 'temp')).id, [carToEdit, firestore]);

  useEffect(() => {
    if (isOpen) {
        if (carToEdit) {
            form.reset({
                brand: carToEdit.brand,
                model: carToEdit.model,
                year: carToEdit.year,
                engine: carToEdit.engine,
                description: carToEdit.description || '',
            });
            setImageUrls(carToEdit.photos || []);
        } else {
            form.reset({ brand: '', model: '', year: undefined, engine: '', description: ''});
            setImageUrls([]);
        }
        setFilesToUpload([]);
    }
  }, [carToEdit, isOpen, form]);
  
  const onSubmit = async (data: CarFormValues) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Вы должны быть авторизованы.' });
      return;
    }

    try {
      const carRef = doc(firestore, 'users', user.uid, 'cars', carId);

      if (carToEdit) {
        await updateDoc(carRef, data);
        toast({ title: 'Успех!', description: 'Данные автомобиля обновлены.' });
      } else {
        const carData: Omit<Car, 'imageId' | 'photoUrl'> & { createdAt: any } = {
          ...data,
          id: carId,
          userId: user.uid,
          photos: [],
          createdAt: serverTimestamp(),
        };
        await setDoc(carRef, carData);
      }
      
      if(filesToUpload.length > 0) {
        const uploadedImages = await uploadFiles(filesToUpload, 'cars', carId);
        const newImageUrls = uploadedImages.map(img => img.url);
        const finalImageUrls = [...imageUrls, ...newImageUrls];

        await updateDoc(carRef, {
            photos: finalImageUrls,
            photoUrl: finalImageUrls[0] || '',
        });
      } else if (carToEdit) {
        // Handle case where images might have been removed but none added
        await updateDoc(carRef, {
            photos: imageUrls,
            photoUrl: imageUrls[0] || '',
        });
      }
      
      toast({ title: 'Успех!', description: carToEdit ? 'Автомобиль обновлен.' : 'Автомобиль добавлен.' });
      setIsOpen(false);
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Ошибка сохранения', description: e.message });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{carToEdit ? 'Редактировать автомобиль' : 'Добавить автомобиль'}</DialogTitle>
          <DialogDescription>
            {carToEdit ? 'Внесите изменения в информацию о вашем автомобиле.' : 'Заполните информацию о вашем новом автомобиле.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <FormItem>
              <FormLabel>Фотографии (первое фото будет главным)</FormLabel>
              <FormControl>
                <MultipleImageUpload
                    value={imageUrls}
                    onChange={(urls) => setImageUrls(urls as string[])}
                    onFilesSelected={setFilesToUpload}
                    uploading={uploading}
                    progress={progress}
                    disabled={form.formState.isSubmitting || uploading}
                    maxFiles={10}
                />
              </FormControl>
              <FormMessage>{uploadError}</FormMessage>
            </FormItem>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Бренд</FormLabel>
                    <FormControl>
                      <Input placeholder="Например, BMW" {...field} disabled={uploading}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Модель</FormLabel>
                    <FormControl>
                      <Input placeholder="Например, M3" {...field} disabled={uploading}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Год выпуска</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Например, 2023" {...field} disabled={uploading}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="engine"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Двигатель</FormLabel>
                    <FormControl>
                      <Input placeholder="Например, 3.0 L S58" {...field} disabled={uploading}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Описание</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Расскажите об особенностях вашего автомобиля..." {...field} disabled={uploading}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <DialogFooter>
               <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={uploading}>Отмена</Button>
              <Button type="submit" disabled={uploading}>
                {uploading ? `Сохранение... ${progress}%` : 'Сохранить'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
