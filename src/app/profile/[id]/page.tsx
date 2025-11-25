
'use client';

import { useState } from 'react';
import Image from "next/image";
import { notFound, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GarageCard } from "@/components/GarageCard";
import { Button } from '@/components/ui/button';
import { FileText, Award, Car as CarIcon, Edit } from "lucide-react";
import { useUser } from "@/firebase";
import type { User as UserData, Car, Post } from '@/lib/data';
import { users, cars, posts } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { PostCard } from '@/components/PostCard';


export default function ProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const { user: authUser, isUserLoading: isAuthUserLoading } = useUser();
  
  const isOwner = authUser && authUser.uid === id;
  
  // Find user in mock data. If it's the owner's profile, fall back to user '1' for mock data consistency.
  const user = users.find(u => u.id === id) || (isOwner ? users.find(u => u.id === '1') : undefined);

  const pageLoading = isAuthUserLoading;
  
  if (pageLoading) {
    return <div className="container mx-auto px-4 py-8 text-center">Загрузка профиля...</div>;
  }

  if (!user) {
    notFound();
  }

  // Use the found user's ID for fetching their related data
  const userIdForContent = user.id;
  const userCars = cars.filter(c => c.userId === userIdForContent);
  const userPosts = posts.filter(p => p.userId === userIdForContent);
  const userAvatar = PlaceHolderImages.find((img) => img.id === user.avatarId);
  
  return (
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8 overflow-hidden">
          <CardHeader className="bg-muted/30 p-6 flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
             <div className="flex items-center space-x-6">
                <Avatar className="h-24 w-24 border-4 border-background">
                  {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt={user.name} data-ai-hint={userAvatar.imageHint} />}
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl font-bold">{user.name}</h1>
                  <p className="text-muted-foreground mt-1">{user.bio}</p>
                </div>
              </div>
              {isOwner && (
                 <Button variant="outline"><Edit className="mr-2 h-4 w-4"/> Редактировать профиль</Button>
              )}
          </CardHeader>
           <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <FileText className="h-6 w-6 mx-auto text-primary mb-2" />
                        <p className="text-2xl font-bold">{userPosts.length}</p>
                        <p className="text-sm text-muted-foreground">Посты</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <CarIcon className="h-6 w-6 mx-auto text-primary mb-2" />
                        <p className="text-2xl font-bold">{userCars.length}</p>
                        <p className="text-sm text-muted-foreground">Автомобили</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <Award className="h-6 w-6 mx-auto text-primary mb-2" />
                        <p className="text-2xl font-bold">{user.stats.wins}</p>
                        <p className="text-sm text-muted-foreground">Победы "Авто дня"</p>
                    </div>
                     <div className="p-4 bg-muted/50 rounded-lg">
                        <svg className="h-6 w-6 mx-auto text-primary mb-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                        <p className="text-2xl font-bold">{user.stats.likes}</p>
                        <p className="text-sm text-muted-foreground">Лайки</p>
                    </div>
                </div>
           </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Бортжурнал</h2>
                  {userPosts && userPosts.length > 0 ? (
                    <div className="space-y-6">
                      {userPosts.map((post) => {
                         const postUser = users.find(u => u.id === post.userId);
                         const postCar = cars.find(c => c.id === post.carId);
                         if (!postUser || !postCar) return null;
                         return <PostCard key={post.id} post={post} user={postUser} car={postCar} />
                      })}
                    </div>
                  ) : (
                     <Card>
                      <CardContent className="p-6 text-center text-muted-foreground">
                        <p>У этого пользователя пока нет записей в бортжурнале.</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
            </div>
             <div className="lg:col-span-1">
                 <h2 className="text-2xl font-bold mb-4">Гараж</h2>
                  {userCars && userCars.length > 0 ? (
                    <div className="space-y-6">
                      {userCars.map((car) => (
                        <GarageCard 
                          key={car.id} 
                          car={car} 
                          user={user}
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
      </div>
  );
}
