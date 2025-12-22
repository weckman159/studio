// src/components/profile/ProfileTabs.tsx
'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CarCard } from '@/components/profile/CarCard';
import { PostCard } from '@/components/PostCard';
import { PhotoGrid } from './PhotoGrid';
import { Button } from '@/components/ui/button';
import { Calendar, Wrench, Camera, ShoppingBag, MessageSquare } from 'lucide-react';
import type { Car, Post } from '@/lib/types';
import Link from 'next/link';

/**
 * ПОЧЕМУ ИСПРАВЛЕНО:
 * Компонент переименован и полностью переписан. Теперь это "глупый" клиентский компонент.
 * 1. НЕТ ЗАПРОСОВ К ДАННЫМ: Вся информация (посты, машины) приходит через props.
 * 2. ТОЛЬКО UI-ЛОГИКА: Управляет только состоянием активной вкладки.
 * 3. ПЕРЕИСПОЛЬЗУЕМОСТЬ: Может быть использован где угодно, не привязан к логике загрузки.
 */

interface ProfileTabsProps {
  posts: Post[];
  cars: Car[];
  profileId: string;
  isOwner: boolean;
}

export function ProfileTabs({ posts, cars, profileId, isOwner }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState('journal');

  return (
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
                          Создать первый пост
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
         <PhotoGrid userId={profileId} />
      </TabsContent>
      
      <TabsContent value="shop">
        <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-xl flex flex-col items-center justify-center h-64 bg-surface">
            <ShoppingBag className="h-12 w-12 mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Объявления пользователя</h3>
            <p>Этот раздел скоро появится.</p>
        </div>
      </TabsContent>
    </Tabs>
  );
}
