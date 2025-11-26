
'use client';

import { useState } from 'react';
import { GarageCard } from "@/components/GarageCard";
import { Button } from "@/components/ui/button";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, doc, deleteDoc } from 'firebase/firestore';
import type { Car, User } from '@/lib/data';
import { Plus, Car as CarIcon } from "lucide-react";
import Link from 'next/link';
import { AddCarForm } from '@/components/AddCarForm';
import { useToast } from "@/hooks/use-toast";
import { deleteFile } from '@/lib/storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function GaragePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isAddCarOpen, setAddCarOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);

  const carsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'cars'));
  }, [user, firestore]);

  const { data: userCars, isLoading: carsLoading } = useCollection<Car>(carsQuery);
  
  const loading = isUserLoading || carsLoading;

  const handleEdit = (car: Car) => {
    setEditingCar(car);
    setAddCarOpen(true);
  };
  
  const handleDelete = async (car: Car) => {
    if (!user || !firestore) return;
    try {
      if (car.photos) {
        for (const photoUrl of car.photos) {
          try {
            await deleteFile(photoUrl);
          } catch (storageError) {
            console.warn(`Could not delete file ${photoUrl} from storage:`, storageError)
          }
        }
      }
      
      await deleteDoc(doc(firestore, 'users', user.uid, 'cars', car.id));
      
      toast({ title: "Успех!", description: "Автомобиль был удален." });
    } catch (error: any) {
       toast({ variant: 'destructive', title: "Ошибка", description: "Не удалось удалить автомобиль." });
    }
  };

  const handleOpenAddCar = () => {
    setEditingCar(null);
    setAddCarOpen(true);
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Загрузка гаража...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Мой гараж</h1>
        <p className="mb-4">Пожалуйста, <Link href="/auth" className="text-primary underline">войдите</Link>, чтобы увидеть свой гараж.</p>
      </div>
    );
  }

  const garageStats = {
    totalCars: userCars?.length || 0,
    averageYear: userCars && userCars.length > 0
      ? Math.round(userCars.reduce((sum, car) => sum + car.year, 0) / userCars.length)
      : 0,
    mostCommonBrand: userCars && userCars.length > 0
      ? Object.entries(userCars.reduce((acc, car) => {
          acc[car.brand] = (acc[car.brand] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)).sort((a, b) => b[1] - a[1])[0][0]
      : '-',
  };

  return (
    <>
      <AddCarForm 
        isOpen={isAddCarOpen} 
        setIsOpen={(open) => {
          if (!open) {
            setEditingCar(null);
          }
          setAddCarOpen(open);
        }}
        carToEdit={editingCar}
      />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Мой гараж</h1>
          <Button onClick={handleOpenAddCar}>
            <Plus className="mr-2 h-4 w-4" /> Добавить авто
          </Button>
        </div>
        
        {userCars && userCars.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userCars.map(car => (
                <GarageCard key={car.id} car={car} user={user as unknown as User} onEdit={handleEdit} onDelete={() => handleDelete(car)}/>
              ))}
            </div>
             <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Статистика гаража</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-3xl font-bold text-primary mb-1">
                        {garageStats.totalCars}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {garageStats.totalCars === 1 ? 'Автомобиль' : 'Автомобилей'}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                       <div className="text-3xl font-bold text-primary mb-1">
                        {garageStats.averageYear || '-'}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Средний год выпуска
                      </p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                       <div className="text-3xl font-bold text-primary mb-1">
                        {garageStats.mostCommonBrand}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Самый частый бренд
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
          </>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <CarIcon className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-muted-foreground">Ваш гараж пуст</h2>
            <p className="text-muted-foreground mt-2">Начните с добавления вашего первого автомобиля.</p>
            <Button className="mt-4" onClick={handleOpenAddCar}>
              <Plus className="mr-2 h-4 w-4" /> Добавить авто
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
