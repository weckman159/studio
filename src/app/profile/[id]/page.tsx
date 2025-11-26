

'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import Link from 'next/link';
import { notFound, useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { FileText, Award, Car as CarIcon, Edit3, Users as UsersIcon, Heart, MessageCircle, Plus, AtSign, Bookmark, UserCheck, UserPlus, MapPin, Calendar, AlertCircle, Repeat2 } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import type { User as UserData, Car, Post } from '@/lib/data';
import { users, cars as mockCars, posts as mockPosts } from '@/lib/data';
import { EditProfileModal } from '@/components/EditProfileModal';
import { AddCarForm } from '@/components/AddCarForm';
import { GarageCard } from '@/components/GarageCard';
import { collection, query, where, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostCard } from '@/components/PostCard';
import { UserListDialog } from '@/components/UserListDialog';
import { Alert, AlertDescription } from '@/components/ui/alert';


export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user: authUser, isUserLoading: isAuthUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const isOwner = authUser && authUser.uid === id;
  
  const [user, setUser] = useState<UserData | undefined>(undefined);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isCarModalOpen, setCarModalOpen] = useState(false);
  const [isFollowersModalOpen, setFollowersModalOpen] = useState(false);
  const [isFollowingModalOpen, setFollowingModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);

  const carsQuery = useMemoFirebase(() => {
    if (!id || !firestore) return null;
    return query(collection(firestore, 'users', id, 'cars'));
  }, [id, firestore]);

  const { data: userCars, isLoading: carsLoading } = useCollection<Car>(carsQuery);
  const userPosts = mockPosts.filter(p => p.authorId === id);
  const favoritePosts = mockPosts.filter(p => ['1', '3'].includes(p.id)); // Mock favorites

  useEffect(() => {
    const fetchUser = async () => {
        if (!id || !firestore || id === 'undefined') return;
        const userDoc = await getDoc(doc(firestore, 'users', id));
        if (userDoc.exists()) {
            setUser({ id: userDoc.id, ...userDoc.data() } as UserData);
        } else {
            const mockUser = users.find(u => u.id === id);
            setUser(mockUser);
            if(!mockUser) notFound();
        }
    }
    fetchUser();
  }, [id, firestore]);


  if (id === 'undefined') {
    return (
        <div className="container mx-auto px-4 py-8">
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Некорректный профиль пользователя. ID не может быть 'undefined'.
                </AlertDescription>
            </Alert>
        </div>
    )
  }

  const pageLoading = isAuthUserLoading || carsLoading || !user;
  
  if (pageLoading) {
    return <div className="container mx-auto px-4 py-8 text-center">Загрузка профиля...</div>;
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
  
  const handleSubscribe = () => {
      if (!authUser) return;
      setIsSubscribed(!isSubscribed);
      setUser(prevUser => {
          if (!prevUser) return prevUser;
          const currentFollowers = prevUser.stats?.followers || 0;
          return {
              ...prevUser,
              stats: {
                  ...prevUser.stats,
                  followers: currentFollowers + (isSubscribed ? -1 : 1),
              }
          }
      })
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

  const currentCarName = userCars && userCars.length > 0 ? `${userCars[0].brand} ${userCars[0].model}` : 'пока нет';
  const otherCars = userCars ? userCars.slice(1) : [];

  return (
      <>
      <EditProfileModal 
        isOpen={isEditModalOpen}
        setIsOpen={setEditModalOpen}
        user={user}
        onSave={handleProfileSave}
      />
      {userCars && (
        <AddCarForm
          isOpen={isCarModalOpen}
          setIsOpen={(open) => {
            if (!open) setEditingCar(null);
            setCarModalOpen(open);
          }}
          carToEdit={editingCar}
        />
      )}
      <UserListDialog isOpen={isFollowersModalOpen} onOpenChange={setFollowersModalOpen} title="Подписчики" users={users} />
      <UserListDialog isOpen={isFollowingModalOpen} onOpenChange={setFollowingModalOpen} title="Подписки" users={users.slice(1)} />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Шапка профиля */}
        <div className="flex flex-col sm:flex-row gap-6 items-start mb-6">
          <Avatar className="h-32 w-32 border-4 border-background shadow-md">
            <AvatarImage src={user.photoURL} />
            <AvatarFallback className="text-4xl">{user.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{user.name}, {user.age}</h1>
            <p className="text-muted-foreground">
              Я езжу на <b>{currentCarName}</b>
            </p>
            <p className="text-sm text-muted-foreground">{user.location}</p>
            
            {/* Статистика */}
            <div className="flex gap-4 mt-4">
              <div className="flex flex-col items-center">
                <div className="rounded-full border-4 border-primary/80 h-20 w-20 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{user.stats?.drive || 0}</div>
                    <div className="text-xs">драйв</div>
                  </div>
                </div>
              </div>
              <button onClick={() => setFollowersModalOpen(true)} className="flex flex-col items-center">
                <div className="rounded-full border-4 border-border h-20 w-20 flex items-center justify-center hover:border-primary/50 transition-colors">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{user.stats?.followers || 0}</div>
                    <div className="text-xs">читают</div>
                  </div>
                </div>
              </button>
              <div className="flex flex-col items-center">
                <div className="rounded-full border-4 border-border h-20 w-20 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{userPosts.length}</div>
                    <div className="text-xs">записей</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Кнопки */}
            <div className="flex gap-2 mt-4">
               {isOwner ? (
                  <Button variant="outline" onClick={() => setEditModalOpen(true)}>
                    <Edit3 className="mr-2 h-4 w-4" />
                    Редактировать
                  </Button>
                ) : (
                  <>
                    {authUser && (
                        <Button onClick={handleSubscribe}>
                          {isSubscribed ? <UserCheck className="mr-2 h-4 w-4"/> : <UserPlus className="mr-2 h-4 w-4"/>}
                          {isSubscribed ? 'Вы подписаны' : 'Подписаться'}
                      </Button>
                    )}
                     <Button variant="outline">Сообщение</Button>
                  </>
                )}
            </div>
          </div>
        </div>

        {/* Гараж (dropdown) */}
        {userCars && userCars.length > 0 && (
          <details className="mb-6 bg-muted rounded-lg p-4">
            <summary className="font-semibold cursor-pointer">
              {currentCarName} ▼
            </summary>
            <ul className="mt-2 ml-4 space-y-1 text-sm list-disc list-inside">
              {otherCars.map((car) => (
                 <li key={car.id} className="hover:underline cursor-pointer">
                   <Link href={`/car/${car.id}`}>{car.brand} {car.model}</Link>
                </li>
              ))}
            </ul>
          </details>
        )}
        
        {/* Активность */}
        <div className="flex gap-6 mb-8 text-sm text-muted-foreground border-b pb-4">
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4" /> {user.stats?.likes || 0}
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" /> {userPosts.reduce((sum, p) => sum + p.commentsCount, 0)}
          </div>
          <div className="flex items-center gap-1">
            <Repeat2 className="h-4 w-4" /> {user.stats?.reposts || 0}
          </div>
          <div className="flex items-center gap-1">
            <Bookmark className="h-4 w-4" /> {favoritePosts.length}
          </div>
        </div>

        
        <Tabs defaultValue="posts" className="w-full">
            <TabsList className="mb-6 grid w-full grid-cols-3">
              <TabsTrigger value="posts"><FileText className="w-4 h-4 mr-2" />Бортжурнал</TabsTrigger>
              <TabsTrigger value="garage"><CarIcon className="w-4 h-4 mr-2" />Гараж</TabsTrigger>
              <TabsTrigger value="favorites"><Bookmark className="w-4 h-4 mr-2" />Избранное</TabsTrigger>
            </TabsList>
            
            <TabsContent value="posts">
                 {userPosts && userPosts.length > 0 ? (
                  <div className="space-y-4">
                    {userPosts.map((post) => {
                      const postUser = users.find(u => u.id === post.authorId);
                      const postCar = userCars?.find(c => c.id === post.carId) || mockCars.find(c => c.id === post.carId);
                      if (!postUser || !postCar) return null;
                      return <PostCard key={post.id} post={post} user={postUser} car={postCar} />
                    })}
                  </div>
                ) : (
                   <Card>
                    <CardContent className="p-10 text-center text-muted-foreground">
                      <p>У этого пользователя пока нет записей в бортжурнале.</p>
                       {isOwner && <Button onClick={() => router.push('/posts/create')} className="mt-4">Создать пост</Button>}
                    </CardContent>
                  </Card>
                )}
            </TabsContent>
            
            <TabsContent value="garage">
                 <div className="flex justify-end mb-4">
                    {isOwner && (
                        <Button variant="outline" size="sm" onClick={handleAddCar}>
                            <Plus className="h-4 w-4 mr-2"/>
                            Добавить автомобиль
                        </Button>
                    )}
                 </div>
                 {userCars && userCars.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {userCars.map((car) => (
                        <GarageCard
                        key={car.id} 
                        car={car}
                        user={user}
                        onEdit={isOwner ? handleEditCar : undefined}
                        onDelete={isOwner ? handleDeleteCar : undefined}
                        />
                    ))}
                    </div>
                ) : (
                    <Card>
                      <CardContent className="p-10 text-center text-muted-foreground">
                          <p>В гараже пока нет автомобилей.</p>
                          {isOwner && <Button onClick={handleAddCar} className="mt-4">Добавить автомобиль</Button>}
                      </CardContent>
                    </Card>
                )}
            </TabsContent>

            <TabsContent value="favorites">
              {favoritePosts.length > 0 ? (
                <div className="space-y-6">
                  {favoritePosts.map(post => {
                     const postUser = users.find(u => u.id === post.authorId);
                     const postCar = mockCars.find(c => c.id === post.carId);
                     if (!postUser || !postCar) return null;
                     return <PostCard key={post.id} post={post} user={postUser} car={postCar} />
                  })}
                </div>
              ) : (
                 <Card>
                    <CardContent className="p-10 text-center text-muted-foreground">
                      <p>Пользователь еще не добавлял посты в избранное.</p>
                    </CardContent>
                  </Card>
              )}
            </TabsContent>
        </Tabs>
      </div>
      </>
  );
}

    