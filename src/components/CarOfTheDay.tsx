'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Car, User } from '@/lib/data';
import { cars as mockCars, users as mockUsers } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
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

  const handleVote = async () => {
    if (!car || !firestore) return;
    const carRef = doc(firestore, 'cars', car.id);
    await updateDoc(carRef, { votes: increment(1) });
    alert('Ваш голос учтён!');
  };

  useEffect(() => {
    const fetchCar = async () => {
      setLoading(true);
      try {
        const today = new Date().toISOString().split('T')[0];
        // In a real app, you would fetch from Firestore.
        // const featuredRef = doc(firestore, 'featured_cars', today);
        // const featuredSnap = await getDoc(featuredRef);
        
        // Mocking the fetch
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // This is mock logic. Replace with `featuredSnap.exists()`
        const featuredCarExists = true; 
        if (featuredCarExists) {
          // const data = featuredSnap.data() as FeaturedCarData;
          const data: FeaturedCarData = { carId: '1', userId: '1' }; // Mock data
          const foundCar = mockCars.find(c => c.id === data.carId);
          const foundOwner = mockUsers.find(u => u.id === data.userId);
          
          if(foundCar && foundOwner) {
            setCar(foundCar);
            setOwner(foundOwner);
          }
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
            <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    )
  }

  if (!car || !owner) return null;

  const carImage = PlaceHolderImages.find(img => img.id === car.imageId);
  const ownerAvatar = PlaceHolderImages.find(img => img.id === owner.avatarId);

  return (
    <Card className="overflow-hidden border-2 border-primary/50 shadow-lg shadow-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center text-primary">
            <Award className="mr-2 h-6 w-6"/>Автомобиль дня
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {carImage && (
            <Link href={`/car/${car.id}`} className="relative aspect-video block">
                <Image 
                    src={carImage.imageUrl} 
                    alt={`${car.brand} ${car.model}`}
                    fill
                    className="object-cover"
                    data-ai-hint={carImage.imageHint}
                />
            </Link>
        )}
        <div className="p-4">
            <h3 className="text-xl font-bold">{car.brand} {car.model}</h3>
            <div className="flex items-center mt-2">
                <Avatar className="h-6 w-6 mr-2">
                    {ownerAvatar && <AvatarImage src={ownerAvatar.imageUrl} data-ai-hint={ownerAvatar.imageHint}/>}
                    <AvatarFallback>{owner.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">Владелец: {owner.name}</span>
            </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-2">
        <Button asChild className="w-full">
            <Link href={`/car/${car.id}`}>Перейти к авто</Link>
        </Button>
        <Button variant="secondary" onClick={handleVote}>
            <ThumbsUp className="mr-2"/>
            Голосовать
        </Button>
      </CardFooter>
    </Card>
  );
}
