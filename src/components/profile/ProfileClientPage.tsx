// src/components/profile/ProfileClientPage.tsx
'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, orderBy, getDocs, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileSidebar } from '@/components/profile/ProfileSidebar';
import { CarCard } from '@/components/profile/CarCard';
import { Wrench, Calendar, Camera, ShoppingBag, Edit, UserPlus, UserCheck, MessageSquare, Plus } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import type { Car, User, Post } from '@/lib/types';
import { EditProfileModal } from '@/components/EditProfileModal';
import { UserListDialog } from '@/components/UserListDialog';
import { PostCard } from '@/components/PostCard';
import { ProfilePageSkeleton } from './ProfilePageSkeleton';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { serializeFirestoreData } from '@/lib/utils';
import { PhotoGrid } from './PhotoGrid';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface ProfileClientPageProps {
  profileId: string;
}

function ComingSoonPlaceholder({ title, icon: Icon }: { title: string, icon: React.ElementType }) {
    return (
        <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-xl flex flex-col items-center justify-center h-64 bg-surface">
            <Icon className="h-12 w-12 mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p>Этот раздел скоро появится.</p>
        </div>
    );
}

export function ProfileClientPage({ profileId }: ProfileClientPageProps) {
  const { user: authUser } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [profile, setProfile] = useState<User | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [followers, setFollowers] = useState<string[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('journal');
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [followersDialogOpen, setFollowersDialogOpen] = useState(false);
  const [followingDialogOpen, setFollowingDialogOpen] = useState(false);

  const onFollowersClick = () => setFollowersDialogOpen(true);
  const onFollowingClick = () => setFollowingDialogOpen(true);
  const onEditClick = () => setEditModalOpen(true);

  // Data fetching effect
  useEffect(() => {
    if (!firestore || !profileId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const userRef = doc(firestore, 'users', profileId);
        
        const [userSnap, carsSnap, postsSnap, followersSnap, followingSnap] = await Promise.all([
          getDoc(userRef),
          getDocs(query(collection(firestore, 'cars'), where('userId', '==', profileId))),
          getDocs(query(collection(firestore, 'posts'), where('authorId', '==', profileId), orderBy('createdAt', 'desc'))),
          getDocs(collection(userRef, 'followers')),
          getDocs(collection(userRef, 'following'))
        ]);

        if (!userSnap.exists()) {
          setProfile(null);
          return;
        }

        setProfile(serializeFirestoreData({ id: userSnap.id, ...userSnap.data() }) as User);
        setCars(carsSnap.docs.map(d => serializeFirestoreData({ id: d.id, ...d.data() }) as Car));
        setPosts(postsSnap.docs.map(d => serializeFirestoreData({ id: d.id, ...d.data() }) as Post));
        setFollowers(followersSnap.docs.map(d => d.id));
        setFollowing(followingSnap.docs.map(d => d.id));

      } catch (error) {
        console.error("Error fetching profile data on client:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [firestore, profileId]);

  useEffect(() => {
    if (authUser) {
        setIsFollowing(followers.includes(authUser.uid));
    }
  }, [authUser, followers]);


  const handleFollow = async () => {
    if (!authUser || !firestore || !profile) return;
    setLoadingAction(true);
    const followingRef = doc(firestore, 'users', authUser.uid, 'following', profile.id);
    try {
      await setDoc(followingRef, { createdAt: serverTimestamp() });
      setFollowers(prev => [...prev, authUser.uid]);
      setIsFollowing(true);
      toast({ title: 'Вы подписались на', description: profile.displayName });
    } catch (e) {
      console.error("Error following user: ", e);
      toast({ title: 'Ошибка', variant: 'destructive' });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleUnfollow = async () => {
    if (!authUser || !firestore || !profile) return;
    setLoadingAction(true);
    const followingRef = doc(firestore, 'users', authUser.uid, 'following', profile.id);
    try {
      await deleteDoc(followingRef);
      setFollowers(prev => prev.filter(id => id !== authUser.uid));
      setIsFollowing(false);
      toast({ title: 'Вы отписались от', description: profile.displayName, variant: 'default' });
    } catch (e) {
      console.error("Error unfollowing user: ", e);
      toast({ title: 'Ошибка', variant: 'destructive' });
    } finally {
        setLoadingAction(false);
    }
  };

  if (loading) {
    return <ProfilePageSkeleton />;
  }
  
  if (!profile) {
      return <div>Профиль не найден.</div>
  }
  
  const isOwner = !!authUser && (authUser.uid === profile.id);

  // Combine fetched stats with any existing stats on the profile object
  const profileStats = {
      ...profile.stats,
      followersCount: followers.length,
      followingCount: following.length,
      carsCount: cars.length,
      postsCount: posts.length,
  };


  return (
    <>
      <EditProfileModal 
        isOpen={isEditModalOpen} 
        setIsOpen={setEditModalOpen}
        user={profile}
        onSave={(updatedUser) => setProfile(updatedUser)}
      />
      <UserListDialog 
        isOpen={followersDialogOpen} 
        onOpenChange={setFollowersDialogOpen}
        title="Подписчики"
        userIds={followers}
      />
      <UserListDialog 
        isOpen={followingDialogOpen} 
        onOpenChange={setFollowingDialogOpen}
        title="Подписки"
        userIds={following}
      />
      <div className="min-h-screen">
          {/* Simplified Hero */}
          <div className="p-6 md:p-8 rounded-2xl holographic-panel mb-8">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <Avatar className="h-24 w-24 md:h-32 md:w-32 rounded-2xl ring-4 ring-offset-4 ring-offset-background bg-primary/20 p-1">
                    <AvatarImage src={profile.photoURL} className="rounded-xl" />
                    <AvatarFallback className="rounded-xl text-4xl">{profile.displayName?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-white">{profile.displayName}</h1>
                    <p className="text-text-secondary mb-4">@{profile.nickname || profile.email?.split('@')[0]}</p>
                    <div className="flex flex-wrap items-center gap-6 text-white mb-4">
                        <button onClick={onFollowersClick} className="hover:text-primary"><span className="font-bold text-xl">{profileStats.followersCount}</span><span className="text-text-secondary text-sm ml-2">Подписчиков</span></button>
                        <button onClick={onFollowingClick} className="hover:text-primary"><span className="font-bold text-xl">{profileStats.followingCount}</span><span className="text-text-secondary text-sm ml-2">Подписок</span></button>
                        <div><span className="font-bold text-xl">{profileStats.carsCount}</span><span className="text-text-secondary text-sm ml-2">Машин</span></div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {isOwner ? (
                            <Button size="sm" onClick={onEditClick}><Edit className="mr-2 h-4 w-4"/>Редактировать</Button>
                        ) : (
                            <>
                                <Button size="sm" onClick={isFollowing ? handleUnfollow : handleFollow} disabled={loadingAction}>{isFollowing ? <UserCheck className="mr-2 h-4 w-4"/> : <UserPlus className="mr-2 h-4 w-4"/>}{isFollowing ? 'Отписаться' : 'Подписаться'}</Button>
                                <Button size="sm" variant="outline"><MessageCircle className="mr-2 h-4 w-4"/>Написать</Button>
                            </>
                        )}
                    </div>
                </div>
              </div>
          </div>
        
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="hidden lg:block lg:col-span-1">
              <ProfileSidebar profile={{...profile, stats: profileStats}} />
            </div>
            
            <div className="lg:col-span-3">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent mb-6">
                   <TabsTrigger value="journal" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-4"><Calendar className="mr-2 h-4 w-4" />Бортжурнал ({posts.length})</TabsTrigger>
                  <TabsTrigger value="garage" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-4"><Wrench className="mr-2 h-4 w-4" />Гараж ({cars.length})</TabsTrigger>
                  <TabsTrigger value="photos" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-4"><Camera className="mr-2 h-4 w-4" />Фотопоток</TabsTrigger>
                  <TabsTrigger value="shop" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-4"><ShoppingBag className="mr-2 h-4 w-4" />Продажа</TabsTrigger>
                </TabsList>
                
                <TabsContent value="journal" className="space-y-6">
                  {posts.length > 0 ? (
                    posts.map(post => <PostCard key={post.id} post={post} />)
                  ) : (
                    <div className="text-center py-16 border-2 border-dashed border-border/30 rounded-xl bg-card/50">
                        <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold text-foreground">Публикаций пока нет</h3>
                        <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                            {isOwner ? "Ваш первый пост появится здесь после его создания." : "У этого пользователя еще нет публикаций."}
                        </p>
                        {isOwner && (
                            <Button asChild size="lg" className="mt-6">
                                <Link href="/posts/create">
                                    <Plus className="mr-2 h-4 w-4" /> Создать первый пост
                                </Link>
                            </Button>
                        )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="garage">
                    {cars.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {cars.map(car => (
                                <CarCard key={car.id} car={car} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">В этом гараже пока нет машин.</div>
                    )}
                </TabsContent>
                
                <TabsContent value="photos">
                   <PhotoGrid userId={profile.id} />
                </TabsContent>
                
                <TabsContent value="shop">
                  <ComingSoonPlaceholder title="Объявления пользователя" icon={ShoppingBag} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
      </div>
    </>
  )
}
