'use client';

import { PostCard } from "@/components/PostCard";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy, where, limit, Query, getDocs } from 'firebase/firestore';
import type { Post } from '@/lib/types';
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { CarOfTheDay } from "@/components/CarOfTheDay";
import { PostFilters } from "@/components/PostFilters";
import { AutoNewsWidget } from "@/components/AutoNewsWidget";
import { MessageCircle } from "lucide-react";
import { User } from "@/lib/types";

export default function Home() {
  const [activeType, setActiveType] = useState('Все');
  const firestore = useFirestore();
  
  const globalPostsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    let q: Query = query(collection(firestore, 'posts'), orderBy('createdAt', 'desc'), limit(20));
    if (activeType !== 'Все') q = query(q, where('category', '==', activeType));
    return q;
  }, [firestore, activeType]);

  const { data: posts, isLoading } = useCollection<Post>(globalPostsQuery);

  return (
    <div className="flex justify-center gap-8 md:pt-4">
       {/* Main Feed Column - Max Width like Instagram */}
      <div className="w-full max-w-[470px] flex flex-col">
        
        {/* Stories / Cars Bar */}
        <CarOfTheDay />
        
        {/* Filters (Optional, maybe hide for pure Insta feel) */}
        <div className="mb-4 px-4 md:px-0">
             <PostFilters activeType={activeType} onTypeChange={setActiveType} searchQuery="" onSearchChange={()=>{}} />
        </div>

        {/* Posts Feed */}
        <div className="flex flex-col gap-4">
          {isLoading ? (
            [1, 2, 3].map(i => <Skeleton key={i} className="h-[500px] w-full rounded-sm" />)
          ) : (
            posts?.map(post => <PostCard key={post.id} post={post} />)
          )}
          {posts?.length === 0 && <div className="p-10 text-center text-muted-foreground">Постов пока нет</div>}
        </div>
      </div>

      {/* Right Sidebar (Suggestions) - Hidden on mobile */}
      <div className="hidden lg:block w-[320px] pl-8">
        <div className="sticky top-24">
             {/* Здесь можно добавить блок "Рекомендации для вас" */}
             <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-muted-foreground">Рекомендации для вас</span>
                <button className="text-xs font-semibold text-primary">Все</button>
             </div>
             {/* Widget News */}
             <AutoNewsWidget />
             
             <div className="mt-8 text-xs text-muted-foreground/50">
                © 2025 AUTOSPHERE FROM META (JK)
             </div>
        </div>
      </div>
    </div>
  );
}
