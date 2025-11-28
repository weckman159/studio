
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
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

function ProfilePageClient({ userId }: { userId: string }) {
  const { user: authUser } = useUser();
  const firestore = useFirestore();
  
  const { profile: liveProfile, isLoading: isProfileLoading, error: profileError } = useUserProfile(userId);

  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [profile, setProfile] = useState<User | null>(liveProfile);

  useEffect(() => {
    setProfile(liveProfile);
  }, [liveProfile]);

  const carsQuery = useMemoFirebase(() => {
    if (!userId || !firestore) return null;
    return query(collection(firestore, 'cars'), where('userId', '==', userId));
  }, [userId, firestore]);

  const { data: userCars, isLoading: carsLoading } = useCollection<Car>(carsQuery);
  
  const isOwner = !!authUser && authUser.uid === userId;
  const totalLoading = isProfileLoading || (userId && !profile && !profileError);

  if (totalLoading) {
     return (
        <div className="flex justify-center items-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  if (!profile) {
    return <div className="container text-center py-10">Профиль не найден.</div>;
  }
  
  const displayProfile = {
      id: profile.id,
      displayName: profile.name || profile.displayName || 'No Name',
      username: profile.nickname || profile.email?.split('@')[0] || 'username',
      avatar: profile.photoURL || 'https://placehold.co/128x128',
      coverImage: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?q=80&w=2025&auto=format&fit=crop',
      bio: profile.bio || 'Этот пользователь пока ничего не рассказал о себе.',
      status: profile.role === 'admin' ? 'Администратор' : 'Участник',
      badges: ['Легенда клуба', 'Фотограф'],
      tier: 'gold' as const,
      stats: { 
        followers: profile.stats?.followers || 0, 
        reputation: profile.stats?.reputation || 0, 
        cars: userCars?.length || 0 
      },
      socials: {
        instagram: '#',
        youtube: '#',
      },
  };

  return (
    <>
      {profile && (
        <EditProfileModal 
          isOpen={isEditModalOpen} 
          setIsOpen={setEditModalOpen}
          user={profile}
          onSave={(updatedUser) => setProfile(updatedUser)}
        />
      )}
      <div className="min-h-screen -m-8">
        <ProfileHero 
            profile={displayProfile} 
            isOwner={isOwner} 
            onEditClick={() => setEditModalOpen(true)}
            loading={totalLoading}
        />
        
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8">
            <div className="hidden lg:block">
              <ProfileSidebar profile={displayProfile} />
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
                        <p>Загрузка гаража...</p>
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
                    Бортжурнал загружается...
                  </div>
                </TabsContent>
                
                <TabsContent value="photos" className="mt-8">
                   <div className="text-center py-12 text-muted-foreground">
                    Фотопоток в разработке.
                  </div>
                </TabsContent>
                
                <TabsContent value="shop" className="mt-8">
                  <div className="text-center py-12 text-muted-foreground">
                    Товары не найдены
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


export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <ProfilePageClient userId={id} />;
}
