
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
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
import type { Car } from '@/lib/data';

const carFormSchema = z.object({
  brand: z.string().min(1, { message: 'Бренд обязателен' }),
  model: z.string().min(1, { message: 'Модель обязательна' }),
  year: z.coerce.number().min(1900, { message: 'Неверный год' }).max(new Date().getFullYear() + 1, { message: 'Неверный год'}),
  engine: z.string().min(1, { message: 'Двигатель обязателен'}),
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
    },
  });

  useEffect(() => {
    if (carToEdit) {
      form.reset({
        brand: carToEdit.brand,
        model: carToEdit.model,
        year: carToEdit.year,
        engine: carToEdit.engine,
      });
    } else {
      form.reset({
        brand: '',
        model: '',
        year: undefined,
        engine: '',
      });
    }
  }, [carToEdit, form, isOpen]);

  const onSubmit = async (data: CarFormValues) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Вы должны быть авторизованы.' });
      return;
    }

    try {
      if (carToEdit) {
        // Update existing car
        const carRef = doc(firestore, 'users', user.uid, 'cars', carToEdit.id);
        await setDoc(carRef, {
            ...carToEdit,
            ...data
        }, { merge: true });
        toast({ title: 'Успех!', description: 'Данные автомобиля обновлены.' });
      } else {
        // Add new car
        const carsCollection = collection(firestore, 'users', user.uid, 'cars');
        await addDoc(carsCollection, {
          ...data,
          userId: user.uid,
          imageId: `car${Math.floor(Math.random() * 3) + 1}`, // Mock image
          createdAt: serverTimestamp(),
        });
        toast({ title: 'Успех!', description: 'Новый автомобиль добавлен в ваш гараж.' });
      }
      setIsOpen(false);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Ошибка', description: error.message });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
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
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Бренд</FormLabel>
                  <FormControl>
                    <Input placeholder="Например, BMW" {...field} />
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
                    <Input placeholder="Например, M3" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Год выпуска</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Например, 2023" {...field} />
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
                    <Input placeholder="Например, 3.0 L S58" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
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
