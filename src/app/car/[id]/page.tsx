'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import type { Car, Post, User } from "@/lib/data";
import { users, posts as mockPosts, cars as mockCars } from "@/lib/data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PostCard } from "@/components/PostCard";
import { Award, Calendar, Wrench, Car as CarIcon, ImageIcon, FileText, GalleryHorizontal, BookCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { doc, collection, query, where } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import { Timeline, TimelineItem, TimelineConnector, TimelineHeader, TimelineTitle, TimelineIcon, TimelineDescription, TimelineContent, TimelineTime } from "@/components/ui/timeline";


function CarProfilePageSkeleton() {
    return (
        <div className="flex flex-col lg:flex-row gap-8">
            <aside className="w-full lg:w-64">
                 <div className="sticky top-24 space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </aside>
            <div className="flex-1 space-y-8">
                <Skeleton className="aspect-video w-full" />
                <div className="space-y-4">
                    <Skeleton className="h-8 w-1/2" />
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Skeleton className="aspect-square w-full" />
                        <Skeleton className="aspect-square w-full" />
                        <Skeleton className="aspect-square w-full" />
                        <Skeleton className="aspect-square w-full" />
                    </div>
                </div>
                 <div className="space-y-4">
                    <Skeleton className="h-8 w-1/2" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Skeleton className="h-64 w-full" />
                        <Skeleton className="h-64 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                </div>
            </div>
        </div>
    )
}


export default function CarProfilePage({ params }: { params: { id: string } }) {
  const firestore = useFirestore();
  const [car, setCar] = useState<Car | null>(null);
  const [owner, setOwner] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id || !firestore) return;

    const fetchCarAndOwner = async () => {
        setLoading(true);
        // This is a simplified fetch. A real app would need a more complex query
        // to find a car by its ID across all users.
        const foundCar = mockCars.find(c => c.id === params.id);

        if (foundCar) {
            setCar(foundCar);
            const foundOwner = users.find(u => u.id === foundCar.userId);
            setOwner(foundOwner || null);
        } else {
            notFound();
        }
        setLoading(false);
    };

    fetchCarAndOwner();
  }, [params.id, firestore]);
  
  if (loading) {
    return <CarProfilePageSkeleton />;
  }

  if (!car) {
    return notFound();
  }
  
  const pageTitle = `${car.brand} ${car.model}`;
  const mainImage = car.photoUrl || car.photos?.[0];
  const galleryPhotos = car.photos?.slice(0, 4) || [];
  const relatedPosts = mockPosts.filter(p => p.carId === car.id).slice(0, 3);
  const serviceHistory = mockPosts.filter(p => p.carId === car.id && p.type === 'Обслуживание');
  
  const navLinks = [
    { href: '#photos', label: 'Фото' },
    { href: '#posts', label: 'Новое' },
    { href: '#specs', label: 'Характеристики' },
    { href: '#parts', label: 'Запчасти' },
    { href: '#reviews', label: 'Отзывы владельцев' },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar */}
        <aside className="w-full lg:w-64">
            <nav className="sticky top-24 space-y-1">
                {navLinks.map(link => (
                     <a key={link.href} href={link.href} className="block px-4 py-2 rounded text-muted-foreground hover:bg-muted hover:text-foreground">
                        {link.label}
                    </a>
                ))}
            </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 space-y-12">
             {/* Hero-блок автомобиля */}
            <div className="relative">
                <div className="w-full aspect-video relative rounded-lg overflow-hidden bg-muted">
                    {mainImage && <Image 
                        src={mainImage} 
                        alt={pageTitle} 
                        fill
                        className="object-cover"
                    />}
                </div>
                <div className="absolute bottom-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg">
                    <h1 className="text-2xl font-bold">{pageTitle}</h1>
                    {owner && <p className="text-sm">Владелец: <Link href={`/profile/${owner.id}`} className="hover:underline">{owner.name}</Link></p>}
                </div>
                <Button className="absolute top-4 right-4">Записать в гараж</Button>
            </div>

             <Tabs defaultValue="posts" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="posts">
                        <FileText className="w-4 h-4 mr-2" />
                        Бортжурнал
                    </TabsTrigger>
                    <TabsTrigger value="history">
                        <BookCheck className="w-4 h-4 mr-2" />
                        История обслуживания
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="posts" className="mt-6">
                    <div className="space-y-6">
                        {relatedPosts.map(post => {
                           const postUser = users.find(u => u.id === post.authorId);
                           const postCar = mockCars.find(c => c.id === post.carId);
                           if (!postUser || !postCar) return null;
                           return <PostCard key={post.id} post={post} user={postUser} car={postCar} />
                        })}
                    </div>
                </TabsContent>
                <TabsContent value="history" className="mt-6">
                    <Timeline>
                        {serviceHistory.map(item => (
                            <TimelineItem key={item.id}>
                                <TimelineConnector />
                                <TimelineHeader>
                                <TimelineTime>
                                    {new Date(item.createdAt).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </TimelineTime>
                                <TimelineIcon>
                                    <Wrench className="h-4 w-4" />
                                </TimelineIcon>
                                <TimelineTitle>{item.title}</TimelineTitle>
                                </TimelineHeader>
                                <TimelineContent>
                                    <TimelineDescription>
                                        {item.content.replace(/<[^>]*>?/gm, '').substring(0, 100)}...
                                         <Link href={`/posts/${item.id}`} className="text-primary hover:underline ml-2">Подробнее</Link>
                                    </TimelineDescription>
                                </TimelineContent>
                            </TimelineItem>
                        ))}
                         {serviceHistory.length === 0 && (
                            <Card>
                                <CardContent className="p-8 text-center text-muted-foreground">
                                    История обслуживания для этого автомобиля еще не велась.
                                </CardContent>
                            </Card>
                        )}
                    </Timeline>
                </TabsContent>
            </Tabs>
            
            {/* Галерея фото */}
            <section id="photos">
                <h2 className="text-2xl font-bold mb-4">Фото {pageTitle}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {galleryPhotos.map((photoUrl, i) => (
                    <div key={i} className="relative aspect-square">
                        <Image 
                            src={photoUrl} 
                            alt={`${pageTitle} photo ${i+1}`}
                            fill
                            className="rounded-lg object-cover cursor-pointer hover:opacity-80 transition"
                        />
                    </div>
                    ))}
                </div>
                { (car.photos?.length || 0) > 4 && 
                    <Button variant="link" className="mt-2 px-0">Показать всё →</Button>
                }
            </section>
            
            {/* Характеристики */}
            <section id="specs">
                <h2 className="text-2xl font-bold mb-4">Характеристики</h2>
                <Card>
                    <CardContent className="pt-6 space-y-4">
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
                    </CardContent>
                </Card>
            </section>
        </main>
    </div>
  );
}
