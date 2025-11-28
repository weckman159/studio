
'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileHero } from '@/components/profile/ProfileHero';
import { ProfileSidebar } from '@/components/profile/ProfileSidebar';
import { CarCard } from '@/components/profile/CarCard';
import { Wrench, Calendar, Camera, ShoppingBag, Loader2 } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Car, User } from '@/lib/types';
import { EditProfileModal } from '@/components/EditProfileModal';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Skeleton } from '@/components/ui/skeleton';
import { UserListDialog } from '@/components/UserListDialog';

function ProfilePageSkeleton() {
    return (
      <div className="min-h-screen -m-8">
        <Skeleton className="h-[500px] w-full" />
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8">
                 <div className="hidden lg:block space-y-6">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-32 w-full" />
                 </div>
                 <div>
                    <Skeleton className="h-12 w-full" />
                 </div>
            </div>
        </div>
      </div>
    )
}


function ProfilePageClient({ userId }: { userId: string }) {
  const { user: authUser } = useUser();
  const firestore = useFirestore();
  
  const { profile, isLoading: isProfileLoading, error: profileError } = useUserProfile(userId);

  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [displayProfileData, setDisplayProfileData] = useState<User | null>(profile);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState<string[]>([]);

  // State for user list dialogs
  const [followersDialogOpen, setFollowersDialogOpen] = useState(false);
  const [followingDialogOpen, setFollowingDialogOpen] = useState(false);
  const [following, setFollowing] = useState<string[]>([]);
  
  const carsQuery = useMemoFirebase(() => {
    if (!userId || !firestore) return null;
    return query(collection(firestore, 'cars'), where('userId', '==', userId));
  }, [userId, firestore]);

  const { data: userCars, isLoading: carsLoading } = useCollection<Car>(carsQuery);
  
  const followingQuery = useMemoFirebase(() => {
    if (!userId || !firestore) return null;
    return collection(firestore, 'users', userId, 'following');
  }, [userId, firestore]);
  const { data: followingData } = useCollection(followingQuery);

  useEffect(() => {
      if (followingData) {
          setFollowing(followingData.map(f => f.id));
      }
  }, [followingData]);

  useEffect(() => {
    setDisplayProfileData(profile);
  }, [profile]);
  
  useEffect(() => {
    if (authUser && firestore) {
      const checkFollowing = async () => {
        const followingRef = doc(firestore, 'users', authUser.uid, 'following', userId);
        const docSnap = await getDoc(followingRef);
        setIsFollowing(docSnap.exists());
      };
      checkFollowing();
    }
  }, [authUser, userId, firestore]);
  
   useEffect(() => {
    if (!firestore || !userId) return;
    const fetchFollowers = async () => {
        const followersQuery = query(collection(firestore, 'users', userId, 'followers'));
        const snapshot = await getDocs(followersQuery);
        setFollowers(snapshot.docs.map(doc => doc.id));
    };
    fetchFollowers();
  }, [firestore, userId]);


  const handleFollow = async () => {
    if (!authUser || !firestore) return;
    const followingRef = doc(firestore, 'users', authUser.uid, 'following', userId);
    try {
      await setDoc(followingRef, { createdAt: serverTimestamp() });
      setIsFollowing(true);
    } catch (e) {
      console.error("Error following user: ", e);
    }
  };

  const handleUnfollow = async () => {
    if (!authUser || !firestore) return;
    const followingRef = doc(firestore, 'users', authUser.uid, 'following', userId);
    try {
      await deleteDoc(followingRef);
      setIsFollowing(false);
    } catch (e) {
      console.error("Error unfollowing user: ", e);
    }
  };


  const isOwner = !!authUser && authUser.uid === userId;
  const totalLoading = isProfileLoading || (userId && !displayProfileData && !profileError);

  if (totalLoading) {
     return <ProfilePageSkeleton />;
  }

  if (!displayProfileData) {
    return <div className="container text-center py-10">Профиль не найден.</div>;
  }
  
  const heroProfile = {
      id: displayProfileData.id,
      displayName: displayProfileData.name || displayProfileData.displayName || 'No Name',
      username: displayProfileData.nickname || displayProfileData.email?.split('@')[0] || 'username',
      avatar: displayProfileData.photoURL || 'https://placehold.co/128x128',
      coverImage: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?q=80&w=2025&auto=format&fit=crop',
      bio: displayProfileData.bio || 'Этот пользователь пока ничего не рассказал о себе.',
      status: displayProfileData.role === 'admin' ? 'Администратор' : 'Участник',
      badges: ['Легенда клуба', 'Фотограф'],
      tier: 'gold' as const,
      stats: { 
        followers: displayProfileData.stats?.followersCount || 0, 
        reputation: displayProfileData.stats?.reputation || 0, 
        cars: userCars?.length || 0 
      },
      socials: {
        instagram: '#',
        youtube: '#',
      },
  };

  return (
    <>
      {displayProfileData && (
        <EditProfileModal 
          isOpen={isEditModalOpen} 
          setIsOpen={setEditModalOpen}
          user={displayProfileData}
          onSave={(updatedUser) => setDisplayProfileData(updatedUser)}
        />
      )}
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
      <div className="min-h-screen -m-8">
        <ProfileHero 
            profile={heroProfile} 
            isOwner={isOwner} 
            isFollowing={isFollowing}
            onFollow={handleFollow}
            onUnfollow={handleUnfollow}
            onEditClick={() => setEditModalOpen(true)}
            loading={totalLoading}
            onFollowersClick={() => setFollowersDialogOpen(true)}
            onFollowingClick={() => setFollowingDialogOpen(true)}
        />
        
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8">
            <div className="hidden lg:block">
              <ProfileSidebar profile={heroProfile} />
            </div>
            
            <div>
              <Tabs defaultValue="garage" className="w-full">
                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                  <TabsTrigger 
                    value="garage" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-4"
                  >
                    <Wrench className="mr-2 h-4 w-4" />
                    Гараж ({userCars?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="journal"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-4"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Бортжурнал
                  </TabsTrigger>
                  <TabsTrigger 
                    value="photos"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-4"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Фотопоток
                  </TabsTrigger>
                  <TabsTrigger 
                    value="shop"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-4"
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Продажа
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="garage" className="mt-8">
                    {carsLoading ? (
                        <div className="flex justify-center items-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : userCars && userCars.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {userCars.map(car => (
                                <CarCard key={car.id} car={car} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">В этом гараже пока нет машин.</div>
                    )}
                </TabsContent>
                
                <TabsContent value="journal" className="mt-8">
                  <div className="text-center py-12 text-muted-foreground">
                    Бортжурнал в разработке.
                  </div>
                </TabsContent>
                
                <TabsContent value="photos" className="mt-8">
                   <div className="text-center py-12 text-muted-foreground">
                    Фотопоток в разработке.
                  </div>
                </TabsContent>
                
                <TabsContent value="shop" className="mt-8">
                  <div className="text-center py-12 text-muted-foreground">
                    Товары не найдены.
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}


export default async function ProfilePage({ params }: { params: { id: string } }) {
    const { id } = params;
    return <ProfilePageClient userId={id} />;
}
