
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Award className="mr-2 h-5 w-5 text-amber-400"/>Автомобиль дня</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full rounded-md" />
          <Skeleton className="h-6 w-3/4 mt-4" />
          <Skeleton className="h-4 w-1/2 mt-2" />
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-2">
            <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    )
  }

  if (!car || !owner) return null;

  const carImage = car.photoUrl;
  const ownerAvatar = owner.photoURL;

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-blue-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
      <Card className="relative overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center text-primary">
              <Award className="mr-2 h-6 w-6"/>Победитель "Авто дня"
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {carImage && (
              <Link href={`/car/${car.id}`} className="relative aspect-video block">
                  <Image 
                      src={carImage} 
                      alt={`${car.brand} ${car.model}`}
                      fill
                      className="object-cover"
                  />
              </Link>
          )}
          <div className="p-4">
              <h3 className="text-xl font-bold">{car.brand} {car.model}</h3>
              <div className="flex items-center mt-2">
                  <Avatar className="h-6 w-6 mr-2">
                      {ownerAvatar && <AvatarImage src={ownerAvatar} />}
                      <AvatarFallback>{owner.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">Владелец: {owner.name}</span>
              </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-2">
          <Button asChild className="w-full">
              <Link href={`/car-of-the-day`}>Страница голосования</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
