'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import type { Car, Post, User } from "@/lib/data";
import { users, posts as mockPosts, cars as mockCars } from "@/lib/data";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PostCard } from "@/components/PostCard";
import { Award, Calendar, Wrench, Car as CarIcon, ImageIcon, FileText, GalleryHorizontal, BookCheck, Heart, MessageCircle } from "lucide-react";
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
        <div className="space-y-8">
            <Skeleton className="h-96 w-full rounded-2xl" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
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
    )
}

interface SpecCardProps {
    label: string;
    value: string;
    icon: React.ReactNode;
    progress?: number;
}

function SpecCard({ label, value, icon, progress }: SpecCardProps) {
  return (
    <div className="text-center p-4 rounded-xl bg-card border hover:shadow-lg transition-all">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="font-bold text-lg mb-1">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
      {progress && (
        <div className="w-full bg-muted rounded-full h-2 mt-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}


export default function CarProfilePage({ params }: { params: { id: string } }) {
  const firestore = useFirestore();
  const [car, setCar] = useState<Car & {nickname?: string, stockHP?: number, currentHP?: number, acceleration?: string, clearance?: string, mileage?: string, views?: number, comments?: number, likes?: number} | null>(null);
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
            // Add mock data for new fields
            const extendedCar = {
                ...foundCar,
                nickname: 'Begemot',
                stockHP: 230,
                currentHP: 310,
                acceleration: '6.1',
                clearance: '16.5',
                mileage: '75,000',
                views: 12500,
                comments: 89,
                likes: 432,
            };
            setCar(extendedCar);
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
  

  return (
    <div className="flex-1 space-y-12">
        {/* Hero-блок автомобиля */}
        <div className="relative h-96 overflow-hidden rounded-2xl shadow-2xl group">
            {mainImage && <Image 
                src={mainImage} 
                alt={pageTitle} 
                fill
                className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
            />}
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                        <span className="font-bold text-xl">{car.brand}</span>
                        <span className="ml-2 text-white/90">{car.model}</span>
                    </div>
                    <Badge variant="secondary">{car.year}</Badge>
                    {car.nickname && <Badge>{car.nickname}</Badge>}
                    {car.isCarOfTheDay && <Badge variant="destructive">Машина дня</Badge>}
                </div>
                 <div className="flex gap-4 text-white text-sm mb-4">
                    <span>👑 {car.views} просмотров</span>
                    <span>💬 {car.comments}</span>
                    <span>❤️ {car.likes}</span>
                </div>
                 <div className="flex gap-3">
                    <Button size="lg" className="bg-white/90 text-black hover:bg-white shadow-lg">
                        Записать в гараж
                    </Button>
                    <Button variant="outline" size="lg" className="border-white/50 text-white hover:bg-white/20">
                        Посмотреть в 360°
                    </Button>
                </div>
            </div>
        </div>

        {/* Spec Bar */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-muted/50 p-6 rounded-2xl backdrop-blur-sm">
            <SpecCard 
                label="Мощность" 
                value={`${car.stockHP} → ${car.currentHP}`} 
                icon="🚗"
                progress={(car.currentHP || 0) / (car.stockHP || 1) * 100}
            />
            <SpecCard 
                label="0-100 км/ч" 
                value={`${car.acceleration}s`}
                icon="⚡"
            />
            <SpecCard 
                label="Клиренс" 
                value={`${car.clearance}см`}
                icon="🛻"
            />
            <SpecCard 
                label="Пробег" 
                value={`${car.mileage}км`}
                icon="🛣️"
            />
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
    </div>
  );
}
