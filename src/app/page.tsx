import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PostCard } from '@/components/shared/PostCard';
import { Heart, Zap, MessageCircle, Users, BarChart2, Rss } from 'lucide-react';
import images from '@/app/lib/placeholder-images.json';

function GlassCard({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl ${className}`}>
      {children}
    </div>
  );
}

function PrimaryButton({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <Button className={`bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 ${className}`}>
      {children}
    </Button>
  );
}

export default function HomePage() {
  const carOfTheDayImage = images.carOfTheDay;
  const postImage1 = images.postImage1;
  const postImage2 = images.postImage2;
  const postImage3 = images.postImage3;
  const userAvatar1 = images.userAvatar;
  const userAvatar2 = images.userAvatar;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="grid md:grid-cols-2 gap-8 mb-16 items-center">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter leading-tight">
            Твоя история про машины
          </h1>
          <p className="text-lg text-muted-foreground">
            Делись опытом, находи единомышленников и следи за лучшими проектами в автомобильном сообществе AutoSphere.
          </p>
          <PrimaryButton className="px-8 py-6 text-lg">
            Начать публикацию
          </PrimaryButton>
        </div>
        <GlassCard>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <span>Авто дня</span>
              <span className="text-sm font-normal text-muted-foreground">25.07</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-video rounded-xl overflow-hidden mb-4">
              <Image src={carOfTheDayImage.src} alt="Car of the day" fill className="object-cover" data-ai-hint={carOfTheDayImage.hint} />
            </div>
            <h3 className="text-xl font-bold">Project "Shadow"</h3>
            <p className="text-sm text-muted-foreground">Владелец: @max_rtr</p>
            <div className="flex items-center gap-4 mt-4 text-sm">
              <span className="flex items-center gap-1.5"><Heart className="h-4 w-4 text-primary" /> 1,2k</span>
              <span className="flex items-center gap-1.5"><MessageCircle className="h-4 w-4" /> 188</span>
              <span className="flex items-center gap-1.5"><Zap className="h-4 w-4" /> 750 л.с.</span>
            </div>
            <Button variant="outline" className="w-full mt-4">Смотреть</Button>
          </CardContent>
        </GlassCard>
      </section>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Feed */}
        <main className="lg:col-span-2 space-y-8">
          <PostCard
            post={{
              id: '1',
              title: 'Переход на Stage 2: Первые впечатления',
              author: 'DriftKing',
              avatarUrl: `${userAvatar1.src}?u=a042581f4e29026704d`,
              imageUrl: postImage1.src,
              imageHint: postImage1.hint,
              excerpt: 'После долгих месяцев подготовки и выбора компонентов, наконец-то свершилось. Машина получила новый впуск, выпуск и кастомную прошивку...',
              likes: 256,
              comments: 42,
              tags: ['Тюнинг', 'BMW']
            }}
          />
          <PostCard
            post={{
              id: '2',
              title: 'Фотосет в закатных лучах на Воробьевых горах',
              author: 'PhotoCar',
              avatarUrl: `${userAvatar1.src}?u=a042581f4e29026705d`,
              imageUrl: postImage2.src,
              imageHint: postImage2.hint,
              excerpt: 'Поймал идеальный свет в прошедшую субботу. Делюсь лучшими кадрами своей ласточки. Как вам ракурсы? Критика приветствуется!',
              likes: 512,
              comments: 88,
              tags: ['Фото']
            }}
          />
           <PostCard
            post={{
              id: '3',
              title: 'Большое ТО: Замена масла, фильтров и свечей',
              author: 'ServiceMan',
              avatarUrl: `${userAvatar1.src}?u=a042581f4e29026706d`,
              imageUrl: postImage3.src,
              imageHint: postImage3.hint,
              excerpt: 'Подошло время планового обслуживания. Рассказываю, какие расходники выбрал и почему. Полный список с артикулами внутри.',
              likes: 128,
              comments: 15,
              tags: ['Ремонт', 'DIY']
            }}
          />
        </main>

        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-8">
          <GlassCard>
            <CardHeader>
              <CardTitle className="flex items-center"><BarChart2 className="mr-2 h-5 w-5" /> Тренды недели</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">#jdm</p>
              <p className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">#stanced</p>
              <p className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">#гонки</p>
            </CardContent>
          </GlassCard>
          <GlassCard>
            <CardHeader>
              <CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5" /> Топ авторы</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               {/* User Item */}
               <div className="flex items-center gap-3">
                  <Image src={`${userAvatar2.src}?u=a042581f4e29026704d`} alt="author" width={40} height={40} className="rounded-full" />
                  <div className="flex-1">
                      <p className="font-semibold text-sm">DriftKing</p>
                      <p className="text-xs text-muted-foreground">15 постов</p>
                  </div>
                  <Button size="sm" variant="outline">Читать</Button>
               </div>
               {/* User Item */}
               <div className="flex items-center gap-3">
                  <Image src={`${userAvatar2.src}?u=a042581f4e29026705d`} alt="author" width={40} height={40} className="rounded-full" />
                  <div className="flex-1">
                      <p className="font-semibold text-sm">PhotoCar</p>
                      <p className="text-xs text-muted-foreground">8 постов</p>
                  </div>
                  <Button size="sm" variant="outline">Читать</Button>
               </div>
            </CardContent>
          </GlassCard>
        </aside>
      </div>
    </div>
  );
}
