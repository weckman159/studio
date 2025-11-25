
'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import Link from 'next/link';
import { notFound, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { FileText, Award, Car as CarIcon, Edit, Users as UsersIcon, Heart, MessageCircle } from "lucide-react";
import { useUser } from "@/firebase";
import type { User as UserData, Car, Post } from '@/lib/data';
import { users, cars, posts } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';

function CompactPostItem({ post }: { post: Post }) {
    const postImage = PlaceHolderImages.find((img) => img.id === post.imageId);
    const car = cars.find(c => c.id === post.carId);
    const [formattedDate, setFormattedDate] = useState('');

    useEffect(() => {
        if (post.createdAt) {
            setFormattedDate(new Date(post.createdAt).toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }));
        }
    }, [post.createdAt]);

    if (!car) return null;

    return (
        <Card className="flex items-start p-4 transition-all hover:bg-muted/50">
            {postImage && (
                <Link href={`/posts/${post.id}`} className="mr-4 flex-shrink-0">
                    <Image
                        src={postImage.imageUrl}
                        alt={post.title}
                        width={128}
                        height={80}
                        className="rounded-md object-cover w-32 h-20"
                        data-ai-hint={postImage.imageHint}
                    />
                </Link>
            )}
            <div className="flex-grow">
                <Link href={`/posts/${post.id}`} className="hover:underline">
                    <h3 className="font-semibold text-lg leading-tight">{post.title}</h3>
                </Link>
                <p className="text-sm text-muted-foreground mt-1">
                    в бортжурнале <Link href={`/car/${car.id}`} className="text-primary hover:underline">{car.brand} {car.model}</Link>
                </p>
                <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
                    <span>{formattedDate}</span>
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4" /> {post.likes}
                        </span>
                        <span className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" /> {post.comments}
                        </span>
                    </div>
                </div>
            </div>
        </Card>
    )
}

function CompactGarageCard({ car }: { car: Car }) {
  const carImage = PlaceHolderImages.find((img) => img.id === car.imageId);

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg group">
        <Link href={`/car/${car.id}`} className="block aspect-video relative">
          {carImage && (
            <Image
              src={carImage.imageUrl}
              alt={`${car.brand} ${car.model}`}
              fill
              className="object-cover"
              data-ai-hint={carImage.imageHint}
            />
          )}
        </Link>
        <div className="p-3 flex-1 flex flex-col">
            <h4 className="font-semibold leading-tight">
                <Link href={`/car/${car.id}`} className="hover:text-primary transition-colors">
                    {car.brand} {car.model}
                </Link>
            </h4>
            <p className="text-sm text-muted-foreground">{car.year} год</p>
            <div className="flex-1" />
            <Button asChild variant="outline" size="sm" className="w-full mt-2">
                <Link href={`/car/${car.id}`}>Просмотреть</Link>
            </Button>
        </div>
    </Card>
  );
}


export default function ProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const { user: authUser, isUserLoading: isAuthUserLoading } = useUser();
  
  const isOwner = authUser && authUser.uid === id;
  
  const user = users.find(u => u.id === id) || (isOwner ? users.find(u => u.id === '1') : undefined);

  const pageLoading = isAuthUserLoading;
  
  if (pageLoading) {
    return <div className="container mx-auto px-4 py-8 text-center">Загрузка профиля...</div>;
  }

  if (!user) {
    notFound();
  }

  const userIdForContent = user.id;
  const userCars = cars.filter(c => c.userId === userIdForContent);
  const userPosts = posts.filter(p => p.userId === userIdForContent);
  const userAvatar = PlaceHolderImages.find((img) => img.id === user.avatarId);
  const communitiesCount = 3; // Mock value
  
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
                  <p className="text-muted-foreground mt-1 max-w-xl">{user.bio}</p>
                </div>
              </div>
              {isOwner && (
                 <Button variant="outline"><Edit className="mr-2 h-4 w-4"/> Редактировать профиль</Button>
              )}
          </CardHeader>
           <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-center">
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <FileText className="h-6 w-6 mx-auto text-primary mb-2" />
                        <p className="text-2xl font-bold">{userPosts.length}</p>
                        <p className="text-sm text-muted-foreground">Мои посты</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <CarIcon className="h-6 w-6 mx-auto text-primary mb-2" />
                        <p className="text-2xl font-bold">{userCars.length}</p>
                        <p className="text-sm text-muted-foreground">Гараж</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <UsersIcon className="h-6 w-6 mx-auto text-primary mb-2" />
                        <p className="text-2xl font-bold">{communitiesCount}</p>
                        <p className="text-sm text-muted-foreground">Сообщества</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <Award className="h-6 w-6 mx-auto text-primary mb-2" />
                        <p className="text-2xl font-bold">{user.stats.wins}</p>
                        <p className="text-sm text-muted-foreground">Победы "Авто дня"</p>
                    </div>
                     <div className="p-4 bg-muted/50 rounded-lg">
                        <Heart className="h-6 w-6 mx-auto text-primary mb-2" />
                        <p className="text-2xl font-bold">{user.stats.likes}</p>
                        <p className="text-sm text-muted-foreground">Лайки</p>
                    </div>
                </div>
           </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
                <h2 className="text-2xl font-bold">Бортжурнал</h2>
                {userPosts && userPosts.length > 0 ? (
                  <div className="space-y-4">
                    {userPosts.map((post) => (
                       <CompactPostItem key={post.id} post={post} />
                    ))}
                  </div>
                ) : (
                   <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                      <p>У этого пользователя пока нет записей в бортжурнале.</p>
                    </CardContent>
                  </Card>
                )}
            </div>
             <div className="lg:col-span-1">
                 <h2 className="text-2xl font-bold mb-4">Гараж</h2>
                  {userCars && userCars.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {userCars.map((car) => (
                        <CompactGarageCard 
                          key={car.id} 
                          car={car}
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
