// src/app/page.tsx - SERVER ONLY (НЕТ useFirestore!)
import { getAdminDb } from '@/lib/firebase-admin';
import { PostCard } from '@/components/PostCard';
import { Car } from 'lucide-react';
import type { Post } from '@/lib/types';
import { PostFilters } from '@/components/PostFilters';
import { AutoNewsWidget } from '@/components/AutoNewsWidget';
import { CarOfTheDay } from '@/components/CarOfTheDay';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const adminDb = getAdminDb();
  
  // ✅ Серверный запрос - НЕ БЛОКИРУЕТСЯ
  const postsSnapshot = await adminDb.collection('posts')
    .orderBy('createdAt', 'desc')
    .limit(20) // Увеличим лимит для серверной страницы
    .get();
    
  const posts: Post[] = postsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as Post));

  return (
    <div className="flex justify-center gap-8 md:pt-4">
      <div className="w-full max-w-[640px] flex flex-col">
        
        <CarOfTheDay />
        
        <div className="mb-6 px-2">
             <PostFilters 
                activeType={'Все'} 
                onTypeChange={() => {}} 
                searchQuery={''} 
                onSearchChange={() => {}} 
                feedType={'global'}
                onFeedTypeChange={() => {}}
                showFeedToggle={false} // Скрываем на серверной версии
             />
        </div>

        <div className="flex flex-col gap-6">
          {posts.length > 0 ? (
            posts.map(post => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="text-center py-20 border-2 border-dashed rounded-xl">
              <Car className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Постов пока нет</h3>
              <p className="text-muted-foreground">Будьте первым!</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar (Desktop) */}
      <div className="hidden xl:block w-[350px] pl-4">
        <div className="sticky top-24 space-y-6">
             <AutoNewsWidget />
             
             <div className="text-xs text-muted-foreground/50 text-center">
                AutoSphere © 2025 <br/> Сделано автолюбителями для автолюбителей
             </div>
        </div>
      </div>
    </div>
  )
}
