import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PostCard } from '@/components/PostCard';
import { Heart, Zap, MessageCircle, Users, BarChart2 } from 'lucide-react';
import { getAdminDb } from '@/lib/firebase-admin';
import { serializeFirestoreData } from '@/lib/utils';
import type { Post, Car, FeaturedCar, User } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

async function getHomepageData() {
  try {
    const db = getAdminDb();
    
    // Get 3 recent posts
    const postsSnap = await db.collection('posts')
      .where('status', '==', 'published')
      .orderBy('createdAt', 'desc')
      .limit(3)
      .get();
    const posts = postsSnap.docs.map(doc => serializeFirestoreData({id: doc.id, ...doc.data()}) as Post);

    // Get Car of the Day
    const todayStr = new Date().toISOString().split('T')[0];
    const featuredCarSnap = await db.collection('featuredCars').doc(todayStr).get();
    let carOfTheDay: { car: Car; user: User } | null = null;
    if (featuredCarSnap.exists()) {
      const featuredData = featuredCarSnap.data() as FeaturedCar;
      if (featuredData.carId && featuredData.userId) {
        const [carSnap, userSnap] = await Promise.all([
          db.collection('cars').doc(featuredData.carId).get(),
          db.collection('users').doc(featuredData.userId).get(),
        ]);
        if (carSnap.exists() && userSnap.exists()) {
          carOfTheDay = {
            car: serializeFirestoreData({id: carSnap.id, ...carSnap.data()}) as Car,
            user: serializeFirestoreData({id: userSnap.id, ...userSnap.data()}) as User
          };
        }
      }
    }

    // Get Top Authors
    const topAuthorsSnap = await db.collection('users').orderBy('stats.postsCount', 'desc').limit(2).get();
    const topAuthors = topAuthorsSnap.docs.map(doc => serializeFirestoreData({id: doc.id, ...doc.data()}) as User);

    // Get Trends from recent post categories
    const trendsSnap = await db.collection('posts')
      .where('status', '==', 'published')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();
      
    const categoryCounts: Record<string, number> = {};
    trendsSnap.docs.forEach(doc => {
      const category = doc.data().category;
      if (category) {
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      }
    });

    const trends = Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([name]) => name);

    return { posts, carOfTheDay, topAuthors, trends };
  } catch (error) {
    console.error("Error fetching homepage data:", error);
    return { posts: [], carOfTheDay: null, topAuthors: [], trends: [] };
  }
}


function GlassCard({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl ${className}`}>
      {children}
    </div>
  );
}

function PrimaryButton({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <Button asChild className={`bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 ${className}`}>
      <Link href="/posts/create">
        {children}
      </Link>
    </Button>
  );
}


export default async function HomePage() {
  const { posts, carOfTheDay, topAuthors, trends } = await getHomepageData();

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
        
        {carOfTheDay ? (
          <Link href={`/car/${carOfTheDay.car.id}`}>
            <GlassCard>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <span>Авто дня</span>
                  <span className="text-sm font-normal text-muted-foreground">{new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-video rounded-xl overflow-hidden mb-4">
                  <Image 
                    src={carOfTheDay.car.photoUrl || 'https://placehold.co/600x400'} 
                    alt="Car of the day" 
                    fill 
                    className="object-cover" 
                  />
                </div>
                <h3 className="text-xl font-bold">{carOfTheDay.car.brand} {carOfTheDay.car.model}</h3>
                <p className="text-sm text-muted-foreground">Владелец: {carOfTheDay.user.name}</p>
                <div className="flex items-center gap-4 mt-4 text-sm">
                  <span className="flex items-center gap-1.5"><Heart className="h-4 w-4 text-primary" /> {carOfTheDay.car.likes || 0}</span>
                  <span className="flex items-center gap-1.5"><MessageCircle className="h-4 w-4" /> {carOfTheDay.car.comments || 0}</span>
                  {carOfTheDay.car.specs?.currentHP && <span className="flex items-center gap-1.5"><Zap className="h-4 w-4" /> {carOfTheDay.car.specs.currentHP} л.с.</span>}
                </div>
                <Button variant="outline" className="w-full mt-4">Смотреть</Button>
              </CardContent>
            </GlassCard>
          </Link>
        ) : (
           <GlassCard>
              <CardContent className="p-6 flex flex-col items-center justify-center h-full aspect-video">
                  <Zap className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-bold mb-2">Авто дня</h3>
                  <p className="text-muted-foreground text-center">Голосование за автомобиль дня еще не завершено. Загляните позже!</p>
              </CardContent>
           </GlassCard>
        )}
      </section>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Feed */}
        <main className="lg:col-span-2 space-y-8">
           {posts.length > 0 ? (
             posts.map(post => <PostCard key={post.id} post={post} />)
           ) : (
             <p className="text-muted-foreground">Постов пока нет.</p>
           )}
        </main>

        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-8">
          <GlassCard>
            <CardHeader>
              <CardTitle className="flex items-center"><BarChart2 className="mr-2 h-5 w-5" /> Тренды недели</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {trends.length > 0 ? trends.map(trend => (
                <Link key={trend} href={`/posts?category=${encodeURIComponent(trend)}`}>
                  <Badge variant="secondary" className="hover:bg-primary/20 cursor-pointer text-sm">
                    #{trend}
                  </Badge>
                </Link>
              )) : (
                <p className="text-sm text-muted-foreground">Трендов пока нет.</p>
              )}
            </CardContent>
          </GlassCard>
          <GlassCard>
            <CardHeader>
              <CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5" /> Топ авторы</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topAuthors.length > 0 ? topAuthors.map(author => (
                 <div key={author.id} className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={author.photoURL} />
                        <AvatarFallback>{author.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <p className="font-semibold text-sm">{author.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {author.stats?.postsCount || 0} постов
                        </p>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/profile/${author.id}`}>Читать</Link>
                    </Button>
                 </div>
              )) : (
                [...Array(2)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </GlassCard>
        </aside>
      </div>
    </div>
  );
}
