
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Car, User } from '@/lib/data';
import { cars as mockCars, users as mockUsers } from '@/lib/data';
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

  useEffect(() => {
    const fetchCar = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const data: FeaturedCarData = { carId: '1', userId: '1' };
        const foundCar = mockCars.find(c => c.id === data.carId);
        const foundOwner = mockUsers.find(u => u.id === data.userId);
        
        if(foundCar && foundOwner) {
          setCar(foundCar);
          setOwner(foundOwner);
        }
      } catch (error) {
        console.error("Failed to fetch car of the day:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [firestore]);

  if (loading) {
    return (
      <Skeleton className="h-[250px] w-full rounded-2xl" />
    )
  }

  if (!car || !owner) return null;

  const carImage = car.photoUrl || car.photos?.[0];

  return (
    <div className="relative group overflow-hidden rounded-2xl h-[250px]">
        {carImage && (
            <Image 
                src={carImage} 
                alt={`${car.brand} ${car.model}`}
                fill
                className="object-cover w-full h-full"
            />
        )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
      <div className="absolute bottom-4 left-4 right-4 text-white">
        <h2 className="text-2xl font-bold flex items-center">
            <Award className="mr-2 h-6 w-6 text-amber-300"/>
            Автомобиль дня
        </h2>
        <p className="text-lg">{car.brand} {car.model}</p>
        <Button size="sm" className="mt-2" asChild>
            <Link href="/car-of-the-day">Страница голосования</Link>
        </Button>
      </div>
    </div>
  );
}
