
// src/components/profile/ProfileClientPage.tsx
'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileHero } from '@/components/profile/ProfileHero';
import { ProfileSidebar } from '@/components/profile/ProfileSidebar';
import { CarCard } from '@/components/profile/CarCard';
import { Wrench, Calendar, Camera, ShoppingBag, Loader2 } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { Car, User } from '@/lib/types';
import { EditProfileModal } from '@/components/EditProfileModal';
import { Skeleton } from '@/components/ui/skeleton';
import { UserListDialog } from '@/components/UserListDialog';
import { notFound, useRouter } from 'next/navigation';

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
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Skeleton className="h-48 w-full rounded-2xl" />
                        <Skeleton className="h-48 w-full rounded-2xl" />
                    </div>
                 </div>
            </div>
        </div>
      </div>
    )
}

interface ProfileClientPageProps {
  profileId: string;
}

export function ProfileClientPage({ profileId }: ProfileClientPageProps) {
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const [profile, setProfile] = useState<User | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [followers, setFollowers] = useState<string[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [followersDialogOpen, setFollowersDialogOpen] = useState(false);
  const [followingDialogOpen, setFollowingDialogOpen] = useState(false);

  useEffect(() => {
    if (!firestore || !profileId) return;

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Fetch profile
            const profileRef = doc(firestore, 'users', profileId);
            const profileSnap = await getDoc(profileRef);

            if (!profileSnap.exists()) {
                notFound();
                return;
            }
            const profileData = { id: profileSnap.id, ...profileSnap.data() } as User;
            setProfile(profileData);

            // Fetch cars
            const carsQuery = query(collection(firestore, 'cars'), where('userId', '==', profileId));
            const carsSnap = await getDocs(carsQuery);
            setCars(carsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Car)));

            // Fetch followers
            const followersQuery = query(collection(firestore, 'users', profileId, 'followers'));
            const followersSnapshot = await getDocs(followersQuery);
            setFollowers(followersSnapshot.docs.map(doc => doc.id));
            
            // Fetch following
            const followingQuery = query(collection(firestore, 'users', profileId, 'following'));
            const followingSnapshot = await getDocs(followingQuery);
            setFollowing(followingSnapshot.docs.map(doc => doc.id));

        } catch (error) {
            console.error("Error fetching profile data on client:", error);
            // Handle error, maybe show a toast
        } finally {
            setIsLoading(false);
        }
    };
    
    fetchData();
  }, [firestore, profileId]);

  // Check if current user is following this profile
  useEffect(() => {
    if (authUser && profile) {
        setIsFollowing(followers.includes(authUser.uid));
    }
  }, [authUser, profile, followers]);


  const handleFollow = async () => {
    if (!authUser || !firestore || !profile) return;
    const followingRef = doc(firestore, 'users', authUser.uid, 'following', profile.id);
    const followerRef = doc(firestore, 'users', profile.id, 'followers', authUser.uid);
    try {
      await setDoc(followingRef, { createdAt: serverTimestamp() });
      await setDoc(followerRef, { createdAt: serverTimestamp() });
      setFollowers(prev => [...prev, authUser.uid]);
    } catch (e) {
      console.error("Error following user: ", e);
    }
  };

  const handleUnfollow = async () => {
    if (!authUser || !firestore || !profile) return;
    const followingRef = doc(firestore, 'users', authUser.uid, 'following', profile.id);
    const followerRef = doc(firestore, 'users', profile.id, 'followers', authUser.uid);
    try {
      await deleteDoc(followingRef);
      await deleteDoc(followerRef);
      setFollowers(prev => prev.filter(id => id !== authUser.uid));
    } catch (e) {
      console.error("Error unfollowing user: ", e);
    }
  };

  if (isLoading || isAuthLoading) {
      return <ProfilePageSkeleton />;
  }

  if (!profile) {
    // notFound() must be called in a server component, so we redirect.
    // This case should be handled by the initial fetch logic anyway.
    return <div className="container text-center py-10">Профиль не найден.</div>;
  }
  
  const isOwner = !!authUser && (authUser.uid === profile.id || profile.role === 'admin');

  const heroProfile = {
      id: profile.id,
      displayName: profile.name || profile.displayName || 'No Name',
      username: profile.nickname || profile.email?.split('@')[0] || 'username',
      avatar: profile.photoURL || 'https://placehold.co/128x128',
      coverImage: profile.coverUrl || 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?q=80&w=2025&auto=format&fit=crop',
      bio: profile.bio || 'Этот пользователь пока ничего не рассказал о себе.',
      status: profile.role === 'admin' ? 'Администратор' : 'Участник',
      badges: ['Легенда клуба', 'Фотограф'],
      tier: 'gold' as const,
      stats: { 
        followers: followers.length, 
        following: following.length, 
        cars: cars.length 
      },
      socials: profile.socials || {},
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
      <div className="min-h-screen -m-8">
        <ProfileHero 
            profile={heroProfile} 
            isOwner={isOwner} 
            isFollowing={isFollowing}
            onFollow={handleFollow}
            onUnfollow={handleUnfollow}
            onEditClick={() => setEditModalOpen(true)}
            loading={isLoading}
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
                    Гараж ({cars.length || 0})
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
                    {cars && cars.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {cars.map(car => (
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
