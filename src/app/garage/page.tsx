'use client';

import { GarageCard } from "@/components/GarageCard";
import { Button } from "@/components/ui/button";
import { useUser, useCollection, useFirestore } from "@/firebase";
import { collection, query, where } from 'firebase/firestore';
import { Car, User } from '@/lib/data';
import { users } from '@/lib/data';
import { Plus } from "lucide-react";
import Link from 'next/link';

export default function GaragePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  
  const carsQuery = user && firestore ? query(collection(firestore, 'users', user.uid, 'cars')) : null;
  const { data: userCars, isLoading: carsLoading } = useCollection<Car>(carsQuery);
  
  const loading = isUserLoading || carsLoading;
  
  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Загрузка...</div>;
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Мой гараж</h1>
        <p className="mb-4">Пожалуйста, <Link href="/auth" className="text-primary underline">войдите</Link>, чтобы увидеть свой гараж.</p>
      </div>
    );
  }
  
  const owner = users.find(u => u.id === user.uid) || users[0]; // fallback for demo

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Мой гараж</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Добавить авто
        </Button>
      </div>
      
      {userCars && userCars.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userCars.map(car => (
            <GarageCard key={car.id} car={car} user={owner} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold text-muted-foreground">Ваш гараж пуст</h2>
          <p className="text-muted-foreground mt-2">Начните с добавления вашего первого автомобиля.</p>
          <Button className="mt-4">
            <Plus className="mr-2 h-4 w-4" /> Добавить авто
          </Button>
        </div>
      )}
    </div>
  );
}
