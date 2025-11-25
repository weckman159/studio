
'use client';

import { useState } from 'react';
import Image from "next/image";
import { notFound, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GarageCard } from "@/components/GarageCard";
import { Button } from '@/components/ui/button';
import { FileText, Heart, Award, Plus } from "lucide-react";
import { useDoc, useCollection, useUser, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc, deleteDoc } from 'firebase/firestore';
import type { User as UserData, Car } from '@/lib/data';
import { AddCarForm } from '@/components/AddCarForm';
import { useToast } from "@/hooks/use-toast";
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function ProfilePage({ params }: { params: { id: string } }) {
  const { user: authUser, isUserLoading: isAuthUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const [isAddCarOpen, setAddCarOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);

  const userRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'users', params.id);
  }, [firestore, params.id]);
  
  const { data: user, isLoading: isUserLoading } = useDoc<UserData>(userRef);

  const userCarsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users', params.id, 'cars'));
  }, [firestore, params.id]);

  const { data: userCars, isLoading: carsLoading } = useCollection<Car>(userCarsQuery);

  const userAvatar = user ? PlaceHolderImages.find((img) => img.id === user.avatarId) : null;
  const isOwner = authUser && authUser.uid === params.id;

  const handleEdit = (car: Car) => {
    setEditingCar(car);
    setAddCarOpen(true);
  };
  
  const handleDelete = async (carId: string) => {
    if (!authUser || !firestore) return;
    try {
      await deleteDoc(doc(firestore, 'users', authUser.uid, 'cars', carId));
      toast({ title: "Успех!", description: "Автомобиль был удален." });
    } catch (error: any) {
       toast({ variant: 'destructive', title: "Ошибка", description: "Не удалось удалить автомобиль." });
    }
  };

  const pageLoading = isUserLoading || isAuthUserLoading || carsLoading;
  
  if (pageLoading) {
    return <div className="container mx-auto px-4 py-8 text-center">Загрузка профиля...</div>;
  }

  if (!user) {
    notFound();
  }

  return (
    <>
      {isOwner && (
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
      )}
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardContent className="p-6 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
            <Avatar className="h-24 w-24">
              {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt={user.name} data-ai-hint={userAvatar.imageHint} />}
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <p className="text-muted-foreground mt-1">{user.bio}</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Посты</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.stats.posts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Лайки</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.stats.likes}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Победы "Авто дня"</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.stats.wins}</div>
            </CardContent>
          </Card>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Гараж пользователя</h2>
            {isOwner && (
              <Button onClick={() => setAddCarOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Добавить авто
              </Button>
            )}
          </div>
          {userCars && userCars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userCars.map((car) => (
                <GarageCard 
                  key={car.id} 
                  car={car} 
                  user={user}
                  onEdit={isOwner ? handleEdit : undefined}
                  onDelete={isOwner ? handleDelete : undefined}
                />
              ))}
            </div>
          ) : (
             <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                <p>У этого пользователя пока нет автомобилей в гараже.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
