

'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import Link from 'next/link';
import { notFound, useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { FileText, Award, Car as CarIcon, Edit, Users as UsersIcon, Heart, MessageCircle, Plus, AtSign, Bookmark, UserCheck, UserPlus, MapPin, Calendar } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import type { User as UserData, Car, Post } from '@/lib/data';
import { users, cars as mockCars, posts as mockPosts } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { EditProfileModal } from '@/components/EditProfileModal';
import { AddCarForm } from '@/components/AddCarForm';
import { GarageCard } from '@/components/GarageCard';
import { collection, query, where, doc, deleteDoc } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostCard } from '@/components/PostCard';
import { UserListDialog } from '@/components/UserListDialog';


function CompactPostItem({ post }: { post: Post }) {
    const postImage = PlaceHolderImages.find((img) => img.id === post.imageId);
    const car = mockCars.find(c => c.id === post.carId);
    const [formattedDate, setFormattedDate] = useState('');

    useEffect(() => {
        if (post.createdAt) {
            const date = new Date(post.createdAt);
            if (!isNaN(date.getTime())) {
                setFormattedDate(date.toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }));
            }
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
                <Link href={`/car/${post.carId}?postId=${post.id}`} className="hover:underline">
                    <h3 className="font-semibold text-lg leading-tight">{post.title}</h3>
                </Link>
                <p className="text-sm text-muted-foreground mt-1">
                    в бортжурнале <Link href={`/car/${car.id}`} className="text-primary hover:underline">{car.brand} {car.model}</Link>
                </p>
                <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
                    <span>{formattedDate}</span>
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4" /> {post.likesCount}
                        </span>
                        <span className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" /> {post.commentsCount}
                        </span>
                    </div>
                </div>
            </div>
        </Card>
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
  
  // Find user by ID, if it's the owner, fallback to mock user '1'
  const initialUser = users.find(u => u.id === id) || (isOwner ? users.find(u => u.id === '1') : undefined);
  
  const [user, setUser] = useState<UserData | undefined>(initialUser);
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
  const currentCars = userCars?.filter(car => user?.currentCarIds?.includes(car.id)) || [];

  useEffect(() => {
    if (isOwner && authUser && !users.find(u => u.id === authUser.uid)) {
        const ownerUser = users.find(u => u.id === '1');
        if (ownerUser) setUser({...ownerUser, id: authUser.uid});
    } else {
        const foundUser = users.find(u => u.id === id);
        setUser(foundUser);
    }
  }, [id, isOwner, authUser]);

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
  
  const handleSubscribe = () => {
      if (!authUser) return;
      setIsSubscribed(!isSubscribed);
      setUser(prevUser => {
          if (!prevUser) return prevUser;
          return {
              ...prevUser,
              stats: {
                  ...prevUser.stats,
                  followers: prevUser.stats.followers + (isSubscribed ? -1 : 1),
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

  const userAvatar = PlaceHolderImages.find((img) => img.id === user.avatarId);
  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('ru-RU', {
      month: 'long',
      year: 'numeric'
    }).format(date);
  };
  
  return (
      <>
      <EditProfileModal 
        isOpen={isEditModalOpen}
        setIsOpen={setEditModalOpen}
        user={user}
        userCars={userCars || []}
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

      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="h-32 w-32">
                {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt={user.name} data-ai-hint={userAvatar.imageHint} />}
                <AvatarFallback className="text-4xl">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className='flex items-center gap-3'>
                        <h1 className="text-3xl font-bold">{user.name}</h1>
                        {user.nickname && <Badge variant="secondary" className="text-lg"><AtSign className="h-4 w-4 mr-1"/>{user.nickname}</Badge>}
                      </div>
                      {user.location && (
                        <div className="flex items-center gap-2 text-muted-foreground mt-2">
                          <MapPin className="h-4 w-4" />
                          <span>{user.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Calendar className="h-4 w-4" />
                        <span>На платформе с {formatDate(user.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
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
                        </>
                      )}
                    </div>
                </div>

                {user.bio && (
                  <p className="text-muted-foreground mb-4">{user.bio}</p>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{userCars?.length || 0}</div>
                    <p className="text-sm text-muted-foreground">Автомобилей</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{userPosts.length}</div>
                    <p className="text-sm text-muted-foreground">Постов</p>
                  </div>
                  <button onClick={() => setFollowersModalOpen(true)} className="text-center p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                      <div className="text-2xl font-bold">{user.stats.followers}</div>
                      <p className="text-sm text-muted-foreground">Подписчики</p>
                  </button>
                  <button onClick={() => setFollowingModalOpen(true)} className="text-center p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                      <div className="text-2xl font-bold">{user.stats.following}</div>
                      <p className="text-sm text-muted-foreground">Подписки</p>
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="posts">
            <TabsList className="mb-6 grid w-full grid-cols-3">
              <TabsTrigger value="posts"><FileText className="w-4 h-4 mr-2" />Бортжурнал</TabsTrigger>
              <TabsTrigger value="garage"><CarIcon className="w-4 h-4 mr-2" />Гараж</TabsTrigger>
              <TabsTrigger value="favorites"><Bookmark className="w-4 h-4 mr-2" />Избранное</TabsTrigger>
            </TabsList>
            
            <TabsContent value="posts">
                 {userPosts && userPosts.length > 0 ? (
                  <div className="space-y-4">
                    {userPosts.map((post) => (
                       <CompactPostItem key={post.id} post={post} />
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

    