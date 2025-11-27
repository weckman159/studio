

'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import Link from 'next/link';
import { notFound, useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { FileText, Award, Car as CarIcon, Edit3, Users as UsersIcon, Heart, MessageCircle, Plus, AtSign, Bookmark, UserCheck, UserPlus, MapPin, Calendar, AlertCircle, Repeat2, Settings, Instagram, Send, Youtube } from "lucide-react";
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
import { Separator } from '@/components/ui/separator';


function ProfileHero({ user, isOwner }: { user: UserData, isOwner: boolean }) {
    const [isSubscribed, setIsSubscribed] = useState(false);
    
     const handleSubscribe = () => {
      // Placeholder for subscription logic
      setIsSubscribed(!isSubscribed);
  }

  return (
    <div className="relative h-[40vh] min-h-[300px] w-full rounded-2xl overflow-hidden mb-8 shadow-lg">
      {/* Background Image/Video */}
      <Image 
        src={user.photoURL || 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?q=80&w=2025&auto=format&fit=crop'} 
        alt={`${user.name}'s cover photo`}
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
      
      {/* Info Block */}
      <div className="absolute bottom-6 left-6 right-6">
        <div className="flex items-end gap-6">
          <Avatar className="h-32 w-32 rounded-2xl border-4 border-primary/80 shadow-2xl">
            <AvatarImage src={user.photoURL} />
            <AvatarFallback className="text-4xl">{user.name?.[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white shadow-text">{user.name}</h1>
            <p className="text-muted-foreground text-white/80 shadow-text">@{user.nickname}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/90 mt-2 shadow-text">
                <span>{user.stats?.followers || 0} подписчиков</span>
                <span>•</span>
                <span>{user.stats?.posts || 0} записей</span>
                <span>•</span>
                <span>{user.stats?.likes || 0} лайков</span>
            </div>
          </div>
          <div className="hidden md:flex gap-2">
             {isOwner ? (
                <Button variant="outline" size="lg" className="bg-white/10 text-white border-white/20 backdrop-blur-md">
                    <Settings className="mr-2 h-4 w-4" />
                    Настройки
                </Button>
            ) : (
                <>
                    <Button size="lg" onClick={handleSubscribe} className="bg-white/90 text-black hover:bg-white">
                        {isSubscribed ? <UserCheck className="mr-2 h-4 w-4"/> : <UserPlus className="mr-2 h-4 w-4"/>}
                        {isSubscribed ? 'Вы подписаны' : 'Подписаться'}
                    </Button>
                    <Button variant="outline" size="lg" className="bg-white/10 text-white border-white/20 backdrop-blur-md">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Сообщение
                    </Button>
                </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileSidebar({ user }: { user: UserData }) {
    const skills = ["#Сварка", "#НастройкаECU", "#Детейлинг", "#Винил", "#Покраска"];
    const achievements = [
        { icon: '🏆', label: 'Машина Дня' },
        { icon: '✍️', label: 'Автор 10+ постов' },
        { icon: '🔥', label: 'Топ-10 региона' },
        { icon: '⭐', label: 'Легенда клуба' }
    ]

    return (
        <aside className="w-full lg:w-1/4 lg:sticky top-24 space-y-6">
            <Card>
                <CardHeader><CardTitle>Обо мне</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">{user.bio}</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader><CardTitle>Социальные сети</CardTitle></CardHeader>
                <CardContent className="flex gap-2">
                    <Button variant="outline" size="icon"><Instagram className="h-4 w-4" /></Button>
                    <Button variant="outline" size="icon"><Send className="h-4 w-4" /></Button>
                    <Button variant="outline" size="icon"><Youtube className="h-4 w-4" /></Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Навыки</CardTitle></CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                    {skills.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                </CardContent>
            </Card>
             <Card>
                <CardHeader><CardTitle>Достижения</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-4 gap-2">
                     {achievements.map(ach => (
                         <div key={ach.label} title={ach.label} className="flex items-center justify-center p-2 bg-muted rounded-md text-xl cursor-pointer">
                            {ach.icon}
                         </div>
                     ))}
                </CardContent>
            </Card>
        </aside>
    )
}


export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user: authUser, isUserLoading: isAuthUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const isOwner = authUser && authUser.uid === id;
  
  const [user, setUser] = useState<UserData | null>(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isCarModalOpen, setCarModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);

  const carsQuery = useMemoFirebase(() => {
    if (!id || !firestore) return null;
    return query(collection(firestore, 'users', id, 'cars'));
  }, [id, firestore]);

  const { data: userCars, isLoading: carsLoading } = useCollection<Car>(carsQuery || undefined);
  const userPosts = mockPosts.filter(p => p.authorId === id);
  const favoritePosts = mockPosts.filter(p => ['1', '3'].includes(p.id));

  useEffect(() => {
    const fetchUser = async () => {
        if (!id || !firestore || id === 'undefined') return;
        const userDoc = await getDoc(doc(firestore, 'users', id));
        if (userDoc.exists()) {
            setUser({ id: userDoc.id, ...userDoc.data() } as UserData);
        } else {
            const mockUser = users.find(u => u.id === id);
            setUser(mockUser || null);
            if(!mockUser) notFound();
        }
    }
    if (firestore) {
        fetchUser();
    }
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
  
  if (!user) {
    return notFound();
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
        setIsOpen={(open) => {
          if (!open) setEditingCar(null);
          setCarModalOpen(open);
        }}
        carToEdit={editingCar}
      />
     
      <div className="container mx-auto py-8">
        <ProfileHero user={user} isOwner={isOwner}/>

        <div className="flex flex-col lg:flex-row gap-8">
            <ProfileSidebar user={user} />
            <main className="flex-1">
                <Tabs defaultValue="garage" className="w-full">
                    <TabsList className="mb-6 grid w-full grid-cols-3">
                    <TabsTrigger value="garage"><CarIcon className="w-4 h-4 mr-2" />Гараж</TabsTrigger>
                    <TabsTrigger value="posts"><FileText className="w-4 h-4 mr-2" />Бортжурнал</TabsTrigger>
                    <TabsTrigger value="favorites"><Bookmark className="w-4 h-4 mr-2" />Избранное</TabsTrigger>
                    </TabsList>
                    
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
                            <div className="space-y-4">
                            {userCars.map((car) => (
                                <GarageCard
                                key={car.id} 
                                car={car}
                                user={user!}
                                onEdit={isOwner ? handleEditCar : undefined}
                                onDelete={isOwner ? handleDeleteCar : undefined}
                                variant='compact'
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
                    
                    <TabsContent value="posts">
                        {userPosts && userPosts.length > 0 ? (
                        <div className="space-y-4">
                            {userPosts.map((post) => (
                                <PostCard key={post.id} post={post}/>
                            ))}
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

                    <TabsContent value="favorites">
                    {favoritePosts.length > 0 ? (
                        <div className="space-y-6">
                        {favoritePosts.map(post => <PostCard key={post.id} post={post} />)}
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
            </main>
        </div>
      </div>
      </>
  );
}
