
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GarageCard } from "@/components/GarageCard";
import { Button } from "@/components/ui/button";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, doc, deleteDoc, where } from 'firebase/firestore';
import type { Car } from '@/lib/types';
import { Plus, Car as CarIcon, Loader2 } from "lucide-react";
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
    return query(collection(firestore, 'cars'), where('userId', '==', user.uid));
  }, [user, firestore]);

  const { data: userCars, isLoading: carsLoading } = useCollection<Car>(carsQuery);
  
  const loading = isUserLoading || carsLoading;

  const handleEdit = (car: Car) => {
    setEditingCar(car);
    setAddCarOpen(true);
  };
  
  const handleDelete = async (car: Car) => {
    if (!user || !firestore) return;
    if (!confirm(`Вы уверены, что хотите удалить ${car.brand} ${car.model}? Это действие необратимо.`)) {
        return;
    }
    
    try {
      const photosToDelete = [...(car.photos || []), car.photoUrl].filter(Boolean) as string[];
      for (const photoUrl of photosToDelete) {
        try {
          await deleteFile(photoUrl);
        } catch (storageError) {
          console.warn(`Could not delete file ${photoUrl} from storage:`, storageError)
        }
      }
      
      await deleteDoc(doc(firestore, 'cars', car.id));
      
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
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4 text-white">Мой гараж</h1>
        <p className="mb-4 text-text-secondary">Пожалуйста, <Link href="/auth" className="text-primary underline">войдите</Link>, чтобы увидеть свой гараж.</p>
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
      <div className="p-4 md:p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Мой гараж</h1>
          <Button onClick={handleOpenAddCar}>
            <Plus className="mr-2 h-4 w-4" /> Добавить авто
          </Button>
        </div>
        
        {userCars && userCars.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userCars.map(car => (
                <GarageCard key={car.id} car={car} onEdit={handleEdit} onDelete={() => handleDelete(car)}/>
              ))}
            </div>
             <Card className="mt-8 holographic-panel">
                <CardHeader>
                  <CardTitle className="text-white">Статистика гаража</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-surface rounded-lg">
                      <div className="text-3xl font-bold text-primary mb-1">
                        {garageStats.totalCars}
                      </div>
                      <p className="text-sm text-text-secondary">
                        {garageStats.totalCars === 1 ? 'Автомобиль' : (garageStats.totalCars > 1 && garageStats.totalCars < 5 ? 'Автомобиля' : 'Автомобилей')}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-surface rounded-lg">
                       <div className="text-3xl font-bold text-primary mb-1">
                        {garageStats.averageYear || '-'}
                      </div>
                      <p className="text-sm text-text-secondary">
                        Средний год выпуска
                      </p>
                    </div>
                    <div className="text-center p-4 bg-surface rounded-lg">
                       <div className="text-3xl font-bold text-primary mb-1">
                        {garageStats.mostCommonBrand}
                      </div>
                      <p className="text-sm text-text-secondary">
                        Самый частый бренд
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
          </>
        ) : (
          <div className="text-center py-16 border-2 border-dashed border-border rounded-xl holographic-panel">
            <CarIcon className="mx-auto h-16 w-16 text-text-muted mb-4" />
            <h2 className="text-xl font-semibold text-white">Ваш гараж пуст</h2>
            <p className="text-text-secondary mt-2">Начните с добавления вашего первого автомобиля.</p>
            <Button className="mt-4" onClick={handleOpenAddCar}>
              <Plus className="mr-2 h-4 w-4" /> Добавить авто
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
