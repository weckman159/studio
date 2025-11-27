
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileHero } from '@/components/profile/ProfileHero';
import { ProfileSidebar } from '@/components/profile/ProfileSidebar';
import { CarCard } from '@/components/profile/CarCard';
import { Wrench, Calendar, Camera, ShoppingBag, Loader2 } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { doc, getDoc, collection, query } from 'firebase/firestore';
import type { Car, User } from '@/lib/data';
import { users as mockUsers } from '@/lib/data';
import { EditProfileModal } from '@/components/EditProfileModal';

export default function ProfilePage({ params }: { params: { id: string } }) {
  const { id: userId } = params;
  const { user: authUser, isUserLoading } = useUser();
  const firestore = useFirestore();

  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  const carsQuery = useMemoFirebase(() => {
    if (!userId || !firestore) return null;
    return query(collection(firestore, 'users', userId, 'cars'));
  }, [userId, firestore]);

  const { data: userCars, isLoading: carsLoading } = useCollection<Car>(carsQuery);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!firestore) {
        // Fallback to mock if firestore is not ready
        setProfile(mockUsers.find(u => u.id === userId) || null);
        setLoading(false);
        return;
      };
      
      try {
        const userDoc = await getDoc(doc(firestore, 'users', userId));
        if (userDoc.exists()) {
          setProfile({ id: userDoc.id, ...userDoc.data() } as User);
        } else {
          // If not found in Firestore, fallback to mock data for demo purposes
          setProfile(mockUsers.find(u => u.id === userId) || null);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        // Fallback on error as well
        setProfile(mockUsers.find(u => u.id === userId) || null);
      } finally {
        setLoading(false);
      }
    };
    
    setLoading(true);
    fetchProfile();
  }, [userId, firestore]);

  useEffect(() => {
    setIsOwner(!!authUser && authUser.uid === userId);
  }, [authUser, userId]);
  
  const totalLoading = loading || isUserLoading;

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
  
  // Create a comprehensive profile object for UI components
  const displayProfile = {
      id: profile.id,
      displayName: profile.name || profile.displayName || 'No Name',
      username: profile.nickname || profile.email?.split('@')[0] || 'username',
      avatar: profile.photoURL || 'https://placehold.co/128x128',
      coverImage: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?q=80&w=2025&auto=format&fit=crop',
      bio: profile.bio || 'Этот пользователь пока ничего не рассказал о себе.',
      status: profile.role === 'admin' ? 'Администратор' : 'Участник',
      badges: ['Легенда клуба', 'Фотограф'], // Mock data for badges
      tier: 'gold' as const, // Mock data for tier
      stats: { 
        followers: profile.stats?.followers || 1200, 
        reputation: profile.stats?.reputation || 45000, 
        cars: userCars?.length || 0 
      },
      socials: { // Mock data for socials
        instagram: '#',
        youtube: '#',
      },
  };

  return (
    <>
      <EditProfileModal 
        isOpen={isEditModalOpen} 
        setIsOpen={setEditModalOpen}
        user={profile}
        onSave={(updatedUser) => setProfile(updatedUser)}
      />
      <div className="min-h-screen -m-8">
        <ProfileHero 
            profile={displayProfile} 
            isOwner={isOwner} 
            onEditClick={() => setEditModalOpen(true)}
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
