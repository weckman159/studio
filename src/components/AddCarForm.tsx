
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser, useFirestore } from '@/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
import { deleteFile } from '@/lib/storage';
import { useCarPhotoUpload } from '@/hooks/use-file-upload';
import { ImageUp, X } from 'lucide-react';


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
  const { uploading, progress, error, uploadedFile, upload, remove, reset, setUploadedFile } = useCarPhotoUpload();

  const [localImageFile, setLocalImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

  useEffect(() => {
    reset();
    setLocalImageFile(null);
    if (carToEdit) {
      form.reset({
        brand: carToEdit.brand,
        model: carToEdit.model,
        year: carToEdit.year,
        engine: carToEdit.engine,
        description: carToEdit.description || '',
      });
      if (carToEdit.photoUrl && carToEdit.photoPath) {
        setUploadedFile({ url: carToEdit.photoUrl, path: carToEdit.photoPath, fileName: '' });
        setImagePreview(carToEdit.photoUrl);
      } else {
        setImagePreview(null);
      }
    } else {
      form.reset({ brand: '', model: '', year: undefined, engine: '', description: ''});
      setImagePreview(null);
    }
  }, [carToEdit, isOpen, form, reset, setUploadedFile]);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLocalImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setLocalImageFile(null);
    setImagePreview(null);
    // Если было загруженное ранее фото, оно будет удалено при отправке формы
  }

  const onSubmit = async (data: CarFormValues) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Вы должны быть авторизованы.' });
      return;
    }

    try {
      let finalPhotoUrl = carToEdit?.photoUrl || '';
      let finalPhotoPath = carToEdit?.photoPath || '';

      const carId = carToEdit ? carToEdit.id : doc(collection(firestore, 'temp')).id;
      
      // 1. Если выбрано новое локальное изображение
      if (localImageFile) {
        // Удаляем старое фото, если оно было
        if (carToEdit && carToEdit.photoPath) {
          await deleteFile(carToEdit.photoPath);
        }
        const uploadResult = await upload(localImageFile, 'cars', carId);
        if (uploadResult) {
          finalPhotoUrl = uploadResult.url;
          finalPhotoPath = uploadResult.path;
        } else {
          throw new Error(error || "Ошибка загрузки фото");
        }
      } 
      // 2. Если превью было удалено (т.е. нет ни нового, ни старого фото)
      else if (!imagePreview && carToEdit?.photoPath) {
        await deleteFile(carToEdit.photoPath);
        finalPhotoUrl = '';
        finalPhotoPath = '';
      }
      
      const carData = {
        ...data,
        photoUrl: finalPhotoUrl,
        photoPath: finalPhotoPath,
        userId: user.uid,
      };

      if (carToEdit) {
        const carRef = doc(firestore, 'users', user.uid, 'cars', carToEdit.id);
        await setDoc(carRef, carData, { merge: true });
        toast({ title: 'Успех!', description: 'Данные автомобиля обновлены.' });
      } else {
        const carRef = doc(firestore, 'users', user.uid, 'cars', carId);
        await setDoc(carRef, {
            ...carData,
            id: carId,
            createdAt: serverTimestamp(),
        });
        toast({ title: 'Успех!', description: 'Новый автомобиль добавлен в ваш гараж.' });
      }
      
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
                <FormLabel>Фотография</FormLabel>
                <FormControl>
                    {imagePreview ? (
                        <div className="relative w-full aspect-video rounded-md overflow-hidden group">
                           <Image src={imagePreview} alt="Предпросмотр" fill className="object-cover" />
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Button type="button" variant="destructive" size="icon" onClick={removeImage} disabled={uploading}>
                                    <X className="h-5 w-5" />
                                </Button>
                           </div>
                        </div>
                    ) : (
                        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <ImageUp className="w-8 h-8 mb-4 text-muted-foreground" />
                                <p className="mb-2 text-sm text-muted-foreground">
                                    <span className="font-semibold">Нажмите для загрузки</span> или перетащите
                                </p>
                                <p className="text-xs text-muted-foreground">PNG, JPG, WEBP (до 5MB)</p>
                            </div>
                            <Input type="file" className="hidden" onChange={handleImageChange} accept="image/png, image/jpeg, image/webp" disabled={uploading} />
                        </label>
                    )}
                </FormControl>
                {uploading && <Progress value={progress} className="w-full mt-2" />}
                {error && <p className="text-sm font-medium text-destructive mt-2">{error}</p>}
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
              <Button type="submit" disabled={uploading || form.formState.isSubmitting}>
                {uploading ? `Загрузка: ${progress}%` : (form.formState.isSubmitting ? 'Сохранение...' : 'Сохранить')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
