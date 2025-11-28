
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Car, User } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, ThumbsUp } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';


interface FeaturedCarData {
    carId: string;
    userId: string;
}

export function CarOfTheDay() {
  const [car, setCar] = useState<Car | null>(null);
  const [owner, setOwner] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const firestore = useFirestore();
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchCar = async () => {
      if (!firestore) return;
      setLoading(true);
      try {
        const featuredCarRef = doc(firestore, 'featuredCars', todayStr);
        const featuredCarSnap = await getDoc(featuredCarRef);
        
        let carId: string | null = null;
        let userId: string | null = null;

        if (featuredCarSnap.exists()) {
            const data = featuredCarSnap.data() as FeaturedCarData;
            carId = data.carId;
            userId = data.userId;
        } else {
            // Fallback for demo: pick a car, maybe the first one from a user.
            // In production, a backend function would select and set this document daily.
            console.warn(`No featured car for today (${todayStr}).`);
        }
        
        if (carId && userId) {
             const carRef = doc(firestore, 'cars', carId);
             const carSnap = await getDoc(carRef);

             if (carSnap.exists()) {
                const carData = { id: carSnap.id, ...carSnap.data() } as Car;
                const userSnap = await getDoc(doc(firestore, 'users', userId));
                if(userSnap.exists()){
                    setCar(carData);
                    setOwner({ id: userSnap.id, ...userSnap.data() } as User);
                }
             }
        }
      } catch (error) {
        console.error("Failed to fetch car of the day:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [firestore, todayStr]);

  if (loading) {
    return (
      <Skeleton className="h-[250px] w-full rounded-2xl" />
    )
  }

  if (!car || !owner) {
    return (
        <Card className="h-[250px] w-full rounded-2xl flex items-center justify-center">
            <CardContent className="text-center">
                <Award className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 font-semibold">Автомобиль дня еще не выбран</p>
                <p className="text-sm text-muted-foreground">Примите участие в голосовании!</p>
                <Button size="sm" className="mt-4" asChild>
                    <Link href="/car-of-the-day">Голосовать</Link>
                </Button>
            </CardContent>
        </Card>
    );
  }

  const carImage = car.photoUrl || car.photos?.[0];

  return (
    <div className="relative group overflow-hidden rounded-2xl h-[250px]">
        {carImage && (
            <Link href={`/car/${car.id}`}>
                <Image 
                    src={carImage} 
                    alt={`${car.brand} ${car.model}`}
                    fill
                    className="object-cover w-full h-full"
                />
            </Link>
        )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
      <div className="absolute bottom-4 left-4 right-4 text-white flex justify-between items-end">
        <div>
            <h2 className="text-2xl font-bold flex items-center">
                <Award className="mr-2 h-6 w-6 text-amber-300"/>
                Автомобиль дня
            </h2>
            <p className="text-lg">{car.brand} {car.model}</p>
            <div className="flex items-center gap-2 mt-2">
                <Avatar className="h-6 w-6">
                    <AvatarImage src={owner.photoURL} alt={owner.name} />
                    <AvatarFallback>{owner.name?.[0]}</AvatarFallback>
                </Avatar>
                <Link href={`/profile/${owner.id}`} className="text-sm hover:underline">{owner.name}</Link>
            </div>
        </div>
        <Button size="sm" asChild>
            <Link href="/car-of-the-day">Голосование</Link>
        </Button>
      </div>
    </div>
  );
}
