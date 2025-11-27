import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileHero } from '@/components/profile/ProfileHero'
import { ProfileSidebar } from '@/components/profile/ProfileSidebar'
import { CarCard } from '@/components/profile/CarCard'
import { Wrench, Calendar, Camera, ShoppingBag } from 'lucide-react'

export default function ProfilePage({ params }: { params: { userId: string } }) {
  // TODO: Загрузить из Firestore
  const mockProfile = {
    id: params.userId,
    displayName: 'Alexey Novikov',
    username: 'novikov_m3',
    avatar: 'https://images.unsplash.com/photo-1607031542107-f6f46b5d54e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxtYW4lMjBwb3J0cmFpdHxlbnwwfHx8fDE3NjM5MjU3NzF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    coverImage: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?q=80&w=2025&auto=format&fit=crop',
    bio: 'Строю корчи, ломаю стереотипы. BMW энтузиаст с 15-летним стажем.',
    status: 'PRO Tuner',
    badges: ['Фотограф', 'Легенда клуба'],
    tier: 'gold' as const,
    stats: { followers: 1200, reputation: 45000, cars: 5 },
    socials: {
      instagram: 'https://instagram.com/novikov_m3',
      youtube: 'https://youtube.com/@novikov_m3',
    },
  }

  const cars = [
    {
      id: '1',
      brand: 'BMW',
      model: 'M3 G80',
      image: 'https://images.unsplash.com/photo-1628519592419-bf288f08cef5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxzcG9ydHMlMjBjYXJ8ZW58MHx8fHwxNzYzOTc2NTgyfDA&ixlib=rb-4.1.0&q=80&w=1080',
      status: 'daily' as const,
      specs: { hp: 510, stage: 'Stage 2', wheels: 'R20' },
    },
     {
      id: '2',
      brand: 'Nissan',
      model: 'Silvia S15',
      image: 'https://images.unsplash.com/photo-1605906457463-5eb60f753738?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxqZG0lMjBjYXJ8ZW58MHx8fHwxNzYzOTE5NTE0fDA&ixlib=rb-4.1.0&q=80&w=1080',
      status: 'project' as const,
      specs: { hp: 450, stage: 'Stage 3', wheels: 'R18' },
    },
  ]

  return (
    <div className="min-h-screen -m-8">
      {/* Hero */}
      <ProfileHero profile={mockProfile} isOwner={false} />
      
      {/* Контент */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8">
          {/* Sidebar */}
          <div className="hidden lg:block">
            <ProfileSidebar profile={mockProfile} />
          </div>
          
          {/* Основной контент */}
          <div>
            <Tabs defaultValue="garage" className="w-full">
              <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                <TabsTrigger 
                  value="garage" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-4"
                >
                  <Wrench className="mr-2 h-4 w-4" />
                  Гараж
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {cars.map(car => (
                    <CarCard key={car.id} car={car} />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="journal" className="mt-8">
                <div className="text-center py-12 text-muted-foreground">
                  Бортжурнал загружается...
                </div>
              </TabsContent>
              
              <TabsContent value="photos" className="mt-8">
                <div className="grid grid-cols-3 gap-2">
                  {/* Сетка фото */}
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
  )
}
