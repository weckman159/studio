
'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import Link from 'next/link';
import { notFound, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { FileText, Award, Car as CarIcon, Edit, Users as UsersIcon, Heart, MessageCircle, Plus } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import type { User as UserData, Car, Post } from '@/lib/data';
import { users, cars as mockCars, posts } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { EditProfileModal } from '@/components/EditProfileModal';
import { AddCarForm } from '@/components/AddCarForm';
import { GarageCard } from '@/components/GarageCard';
import { collection, query, where, doc, deleteDoc } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";


function CompactPostItem({ post }: { post: Post }) {
    const postImage = PlaceHolderImages.find((img) => img.id === post.imageId);
    const car = mockCars.find(c => c.id === post.carId);
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
                <Link href={`/car/${car.id}`} className="mr-4 flex-shrink-0">
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

export default function ProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const { user: authUser, isUserLoading: isAuthUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const isOwner = authUser && authUser.uid === id;
  
  const initialUser = users.find(u => u.id === id) || (isOwner ? users.find(u => u.id === '1') : undefined);
  
  const [user, setUser] = useState<UserData | undefined>(initialUser);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isCarModalOpen, setCarModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);

  const carsQuery = useMemoFirebase(() => {
    if (!id || !firestore) return null;
    return query(collection(firestore, 'users', id, 'cars'));
  }, [id, firestore]);

  const { data: userCars, isLoading: carsLoading } = useCollection<Car>(carsQuery);
  const userPosts = posts.filter(p => p.userId === id);


  useEffect(() => {
    setUser(initialUser);
  }, [initialUser?.id]);

  const pageLoading = isAuthUserLoading || carsLoading;
  
  if (pageLoading && !user) {
    return <div className="container mx-auto px-4 py-8 text-center">Загрузка профиля...</div>;
  }

  if (!user) {
    notFound();
  }
  
  const handleProfileSave = (updatedUser: UserData) => {
    setUser(updatedUser);
  };

  const handleEditCar = (car: Car) => {
    setEditingCar(car);
    setCarModalOpen(true);
  };

  const handleAddCar = () => {
    setEditingCar(null);
    setCarModalOpen(true);
  }

  const handleDeleteCar = async (carId: string) => {
    if (!authUser || !firestore) return;
    try {
      await deleteDoc(doc(firestore, 'users', authUser.uid, 'cars', carId));
      toast({ title: "Успех!", description: "Автомобиль был удален." });
    } catch (error: any) {
       toast({ variant: 'destructive', title: "Ошибка", description: "Не удалось удалить автомобиль." });
    }
  };

  const userAvatar = PlaceHolderImages.find((img) => img.id === user.avatarId);
  const communitiesCount = 3; // Mock value
  
  return (
      <>
      <EditProfileModal 
        isOpen={isEditModalOpen}
        setIsOpen={setEditModalOpen}
        user={user}
        onSave={handleProfileSave}
      />
      <AddCarForm
        isOpen={isCarModalOpen}
        setIsOpen={setCarModalOpen}
        carToEdit={editingCar}
      />

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
                 <Button variant="outline" onClick={() => setEditModalOpen(true)}><Edit className="mr-2 h-4 w-4"/> Редактировать профиль</Button>
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
                        <p className="text-2xl font-bold">{userCars?.length || 0}</p>
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
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Гараж</h2>
                    {isOwner && (
                        <Button variant="outline" size="sm" onClick={handleAddCar}>
                            <Plus className="h-4 w-4 mr-2"/>
                            Добавить
                        </Button>
                    )}
                 </div>
                 <Card>
                    <CardContent className="p-2">
                        {userCars && userCars.length > 0 ? (
                            <div className="space-y-1">
                            {userCars.map((car) => (
                                <GarageCard
                                key={car.id} 
                                car={car}
                                user={user}
                                variant="compact"
                                onEdit={isOwner ? handleEditCar : undefined}
                                onDelete={isOwner ? handleDeleteCar : undefined}
                                />
                            ))}
                            </div>
                        ) : (
                            <div className="p-6 text-center text-muted-foreground">
                                <p>В гараже пока нет автомобилей.</p>
                            </div>
                        )}
                    </CardContent>
                 </Card>
            </div>
        </div>
      </div>
      </>
  );
}
