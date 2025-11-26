
'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser, useFirestore } from '@/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
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
import { SingleImageUpload } from './ImageUpload';
import { extractPathFromURL } from '@/lib/storage';


const carFormSchema = z.object({
  brand: z.string().min(1, { message: 'Бренд обязателен' }),
  model: z.string().min(1, { message: 'Модель обязательна' }),
  year: z.coerce.number().min(1900, { message: 'Неверный год' }).max(new Date().getFullYear() + 1, { message: 'Неверный год'}),
  engine: z.string().min(1, { message: 'Двигатель обязателен'}),
  description: z.string().optional(),
  photoUrl: z.string().optional(),
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

  const form = useForm<CarFormValues>({
    resolver: zodResolver(carFormSchema),
    defaultValues: {
      brand: '',
      model: '',
      year: undefined,
      engine: '',
      description: '',
      photoUrl: '',
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
                photoUrl: carToEdit.photoUrl || '',
            });
        } else {
            form.reset({ brand: '', model: '', year: undefined, engine: '', description: '', photoUrl: '' });
        }
    }
  }, [carToEdit, isOpen, form]);
  
  const onSubmit = async (data: CarFormValues) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Вы должны быть авторизованы.' });
      return;
    }

    try {
      const carData = {
        ...data,
        id: carId,
        userId: user.uid,
        photoPath: data.photoUrl ? extractPathFromURL(data.photoUrl) : '',
      };

      const carRef = doc(firestore, 'users', user.uid, 'cars', carId);

      if (carToEdit) {
        await setDoc(carRef, carData, { merge: true });
        toast({ title: 'Успех!', description: 'Данные автомобиля обновлены.' });
      } else {
        await setDoc(carRef, {
            ...carData,
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
            
            <FormField
              control={form.control}
              name="photoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Фотография</FormLabel>
                  <FormControl>
                    <SingleImageUpload
                        storagePath="cars"
                        entityId={carId}
                        value={field.value}
                        onChange={field.onChange}
                        disabled={form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Бренд</FormLabel>
                    <FormControl>
                      <Input placeholder="Например, BMW" {...field} disabled={form.formState.isSubmitting}/>
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
                      <Input placeholder="Например, M3" {...field} disabled={form.formState.isSubmitting}/>
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
                      <Input type="number" placeholder="Например, 2023" {...field} disabled={form.formState.isSubmitting}/>
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
                      <Input placeholder="Например, 3.0 L S58" {...field} disabled={form.formState.isSubmitting}/>
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
                      <Textarea placeholder="Расскажите об особенностях вашего автомобиля..." {...field} disabled={form.formState.isSubmitting}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <DialogFooter>
               <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={form.formState.isSubmitting}>Отмена</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
