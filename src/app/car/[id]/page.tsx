
'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import type { Car, Post, User } from "@/lib/data";
import { users, posts as mockPosts } from "@/lib/data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PostCard } from "@/components/PostCard";
import { Award, Calendar, Wrench, Car as CarIcon, ImageIcon, FileText, GalleryHorizontal } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { doc, collection, query, where } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export default function CarProfilePage({ params }: { params: { id: string } }) {
  const firestore = useFirestore();
  const [owner, setOwner] = useState<User | null>(null);

  const carQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    // We don't know the user ID, so we can't query the subcollection directly.
    // This is a limitation we'll have to address later, for now, we find the car in mock data.
    return null;
  }, [firestore, params.id]);

  // MOCK DATA LOGIC - to be replaced with a robust Firestore query
  const car = mockPosts.map(p => {
    const carData = { ...mockCars.find(c => c.id === p.carId) };
    if (p.imageIds) {
      carData.photos = p.imageIds.map(id => {
        const img = PlaceHolderImages.find(i => i.id === id);
        return img ? img.imageUrl : '';
      }).filter(Boolean);
      carData.photoUrl = carData.photos[0];
    }
    return carData as Car;
  }).find(c => c.id === params.id) || { ...mockCars[0], id: params.id, brand: 'Загрузка данных...', model: '', photos: [] };
  
  const relatedPosts = mockPosts.filter((p) => p.carId === car.id);
  const isLoading = false; // Mock loading state
  // END MOCK DATA LOGIC

  useEffect(() => {
    if (car && car.userId) {
      const ownerData = users.find(u => u.id === car.userId);
      setOwner(ownerData || null);
    }
  }, [car]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
            <Card>
                <Skeleton className="aspect-video w-full" />
                <CardHeader>
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-6 w-1/2" />
                </CardHeader>
            </Card>
            <Skeleton className="h-10 w-full" />
             <div className="space-y-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        </div>
      </div>
    )
  }

  if (!car) {
    return <div>Автомобиль не найден.</div>;
  }
  
  const pageTitle = car.brand === 'Загрузка данных...' ? `Автомобиль ${params.id}` : `${car.brand} ${car.model}`;
  const mainImage = car.photoUrl || car.photos?.[0];
  const isCarOfTheDay = car.isCarOfTheDay;


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
          <Card className="overflow-hidden">
            <CardHeader className="p-0">
               <div className="relative aspect-video bg-muted">
                  {mainImage ? (
                    <Image
                      src={mainImage}
                      alt={pageTitle}
                      fill
                      className="object-cover"
                    />
                  ) : (
                     <div className="flex items-center justify-center h-full">
                       <CarIcon className="w-24 h-24 text-muted-foreground"/>
                     </div>
                  )}
                  {isCarOfTheDay && (
                     <div className="absolute top-4 right-4">
                        <Badge variant="destructive" className="text-base font-bold py-2 px-4 shadow-lg animate-pulse">
                           <Award className="mr-2 h-5 w-5" />
                           Автомобиль дня
                        </Badge>
                     </div>
                  )}
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <CardTitle className="text-4xl font-bold">{pageTitle}</CardTitle>
                {owner && <CardDescription className="text-lg mt-1">Владелец: <Link href={`/profile/${owner.id}`} className="text-primary hover:underline">{owner.name}</Link></CardDescription>}
                 {car.brand === 'Загрузка данных...' && (
                   <CardDescription className="text-amber-500 mt-2">
                     Не удалось загрузить полные данные об автомобиле. Отображается временная информация.
                   </CardDescription>
                 )}
            </CardContent>
          </Card>
          
          <Tabs defaultValue="posts">
              <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="posts"><FileText className="mr-2 h-4 w-4"/>Бортжурнал</TabsTrigger>
                  <TabsTrigger value="specs"><Wrench className="mr-2 h-4 w-4"/>Характеристики</TabsTrigger>
                  <TabsTrigger value="gallery"><GalleryHorizontal className="mr-2 h-4 w-4"/>Галерея</TabsTrigger>
              </TabsList>
              
              <TabsContent value="posts" className="mt-6">
                <div className="space-y-6">
                 {relatedPosts.length > 0 ? (
                    relatedPosts.map(post => {
                        const postUser = users.find(u => u.id === post.userId);
                        if (!postUser || !car) return null;
                        return <PostCard key={post.id} post={post} user={postUser} car={car} />
                    })
                 ) : (
                    <Card>
                        <CardContent className="p-10 text-center text-muted-foreground">
                            <p>У этого автомобиля еще нет постов в бортжурнале.</p>
                        </CardContent>
                    </Card>
                 )}
                </div>
              </TabsContent>

              <TabsContent value="specs" className="mt-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Характеристики</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center">
                            <Calendar className="h-5 w-5 mr-3 text-muted-foreground"/>
                            <div>
                                <p className="text-sm text-muted-foreground">Год выпуска</p>
                                <p className="font-semibold">{car.year}</p>
                            </div>
                        </div>
                        <Separator/>
                        <div className="flex items-center">
                            <Wrench className="h-5 w-5 mr-3 text-muted-foreground"/>
                            <div>
                                <p className="text-sm text-muted-foreground">Двигатель</p>
                                <p className="font-semibold">{car.engine}</p>
                            </div>
                        </div>
                        {car.description && (
                        <>
                            <Separator/>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Описание от владельца</p>
                                <p className="text-sm whitespace-pre-line">{car.description}</p>
                            </div>
                        </>
                        )}
                    </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="gallery" className="mt-6">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center"><ImageIcon className="mr-2 h-5 w-5"/>Галерея</CardTitle>
                    </CardHeader>
                    <CardContent>
                       {car.photos && car.photos.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {car.photos.map((imgUrl, index) => (
                                <div key={index} className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                                    <Image 
                                        src={imgUrl}
                                        alt={`${pageTitle} gallery image ${index + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ))}
                            </div>
                       ) : (
                           <div className="p-10 text-center text-muted-foreground">
                               <p>Владелец еще не добавил фотографии в галерею.</p>
                           </div>
                       )}
                    </CardContent>
                </Card>
              </TabsContent>
          </Tabs>
        </div>
    </div>
  );
}

    