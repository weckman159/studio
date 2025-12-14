
// src/components/profile/ProfileClientPage.tsx
'use client';

import { useState, useEffect } from 'react';
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileHero } from '@/components/profile/ProfileHero';
import { ProfileSidebar } from '@/components/profile/ProfileSidebar';
import { CarCard } from '@/components/profile/CarCard';
import { Wrench, Calendar, Camera, ShoppingBag } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import type { Car, User, Post } from '@/lib/types';
import { EditProfileModal } from '@/components/EditProfileModal';
import { UserListDialog } from '@/components/UserListDialog';
import { PostCard } from '@/components/PostCard';
import { ProfilePageSkeleton } from './ProfilePageSkeleton';
import { PhotoGrid } from './PhotoGrid';


interface ProfileClientPageProps {
  profileId: string;
  initialProfile: User;
  initialCars: Car[];
  initialPosts: Post[];
  initialFollowers: string[];
  initialFollowing: string[];
}

function ComingSoonPlaceholder({ title, icon: Icon }: { title: string, icon: React.ElementType }) {
    return (
        <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-xl flex flex-col items-center justify-center h-64">
            <Icon className="h-12 w-12 mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p>Этот раздел скоро появится.</p>
        </div>
    );
}

export function ProfileClientPage({ 
    profileId, 
    initialProfile, 
    initialCars, 
    initialPosts, 
    initialFollowers, 
    initialFollowing 
}: ProfileClientPageProps) {
  const { user: authUser } = useUser();
  const firestore = useFirestore();

  const [profile, setProfile] = useState<User>(initialProfile);
  const [cars] = useState<Car[]>(initialCars);
  const [posts] = useState<Post[]>(initialPosts);
  const [followers, setFollowers] = useState<string[]>(initialFollowers);
  const [following, setFollowing] = useState<string[]>(initialFollowing);
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [followersDialogOpen, setFollowersDialogOpen] = useState(false);
  const [followingDialogOpen, setFollowingDialogOpen] = useState(false);

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
    } catch (e) {
      console.error("Error following user: ", e);
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
    } catch (e) {
      console.error("Error unfollowing user: ", e);
    } finally {
        setLoadingAction(false);
    }
  };

  if (!profile) {
    return <ProfilePageSkeleton />;
  }
  
  const isOwner = !!authUser && (authUser.uid === profile.id);

  // Update profile stats for Hero component
  profile.stats = {
      ...profile.stats,
      followersCount: followers.length,
      followingCount: following.length,
      carsCount: cars.length,
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
            profile={profile} 
            isOwner={isOwner} 
            isFollowing={isFollowing}
            onFollow={handleFollow}
            onUnfollow={handleUnfollow}
            onEditClick={() => setEditModalOpen(true)}
            loading={loadingAction}
            onFollowersClick={() => setFollowersDialogOpen(true)}
            onFollowingClick={() => setFollowingDialogOpen(true)}
        />
        
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="hidden lg:block lg:col-span-1">
              <ProfileSidebar profile={profile} />
            </div>
            
            <div className="lg:col-span-3">
              <Tabs defaultValue="journal" className="w-full">
                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                   <TabsTrigger 
                    value="journal"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-4"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Бортжурнал ({posts.length})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="garage" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-4"
                  >
                    <Wrench className="mr-2 h-4 w-4" />
                    Гараж ({cars.length})
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
                
                <TabsContent value="journal" className="mt-8 space-y-6">
                  {posts.length > 0 ? (
                    posts.map(post => <PostCard key={post.id} post={post} />)
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">У пользователя еще нет постов.</div>
                  )}
                </TabsContent>

                <TabsContent value="garage" className="mt-8">
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
                
                <TabsContent value="photos" className="mt-8">
                   <PhotoGrid userId={profile.id} />
                </TabsContent>
                
                <TabsContent value="shop" className="mt-8">
                  <ComingSoonPlaceholder title="Объявления пользователя" icon={ShoppingBag} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
