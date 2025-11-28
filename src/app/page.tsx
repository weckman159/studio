
'use client';

import { PostCard } from "@/components/PostCard";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, where, limit, Query } from 'firebase/firestore';
import type { Post } from '@/lib/data';
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { CarOfTheDay } from "@/components/CarOfTheDay";
import { PostFilters } from "@/components/PostFilters";
import { AutoNewsWidget } from "@/components/AutoNewsWidget";
import { MessageCircle } from "lucide-react";

function PostFeed({ posts, loading }: { posts: Post[], loading?: boolean }) {
  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="border rounded-xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="aspect-video w-full rounded-lg" />
          </div>
        ))}
      </div>
    )
  }
  
  if (posts.length === 0) {
      return (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <MessageCircle className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Постов пока нет</h3>
          <p className="text-muted-foreground">
            Попробуйте изменить фильтры или стать первым автором!
          </p>
        </div>
      );
  }

  return (
    <div className="space-y-6">
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}


export default function Home() {
  const [activeType, setActiveType] = useState('Все');
  const [searchQuery, setSearchQuery] = useState('');
  const firestore = useFirestore();

  const postsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    
    let q: Query = query(collection(firestore, 'posts'), orderBy('createdAt', 'desc'), limit(20));
    
    if (activeType !== 'Все') {
      q = query(q, where('category', '==', activeType));
    }
    
    // Firestore не поддерживает полнотекстовый поиск по части строки.
    // Полноценный поиск требует внешних сервисов (Algolia, Typesense).
    // Пока что фильтруем на клиенте.
    
    return q;
  }, [firestore, activeType]);

  const { data: posts, isLoading } = useCollection<Post>(postsQuery);

  const filteredPosts = posts?.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (post.content || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CarOfTheDay />
        </div>
        <div className="lg:col-span-1">
          <AutoNewsWidget />
        </div>
      </div>
      <PostFilters 
        activeType={activeType}
        onTypeChange={setActiveType}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <div>
        <h1 className="text-3xl font-bold mb-6">Лента постов</h1>
        <PostFeed posts={filteredPosts || []} loading={isLoading} />
      </div>
    </div>
  );
}
