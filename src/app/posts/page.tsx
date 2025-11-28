
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, MessageCircle } from 'lucide-react';
import type { Post as PostData } from '@/lib/data';
import { PostCard } from '@/components/PostCard';
import { Skeleton } from '@/components/ui/skeleton';
import { PostFilters } from '@/components/PostFilters';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, where, limit, Query } from 'firebase/firestore';


function PostFeed({ posts, loading }: { posts: PostData[], loading?: boolean }) {
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
          <h3 className="text-xl font-semibold mb-2">Постов нет</h3>
          <p className="text-muted-foreground mb-6">
            Попробуйте изменить фильтры или создайте первый пост!
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

export default function PostsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('Все');
  const firestore = useFirestore();
  
  const postsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    let q: Query = query(collection(firestore, 'posts'), orderBy('createdAt', 'desc'));
    if (selectedType !== 'Все') {
      q = query(q, where('category', '==', selectedType));
    }
    return q;
  }, [firestore, selectedType]);

  const { data: posts, isLoading } = useCollection<PostData>(postsQuery);

  const filteredPosts = posts?.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.content || '').toLowerCase().includes(searchQuery.toLowerCase())
    );


  return (
    <div>
      {/* Хедер и создание */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Посты пользователей</h1>
          <p className="text-muted-foreground">
            Делитесь опытом, обсуждениями, вопросами и фотоотчётами
          </p>
        </div>
        <Link href="/posts/create">
          <Button size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Создать пост
          </Button>
        </Link>
      </div>
      {/* Поиск/фильтр */}
      <div className="mb-8">
        <PostFilters
          activeType={selectedType}
          onTypeChange={setSelectedType}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>
      
      {/* Лента постов */}
      <PostFeed posts={filteredPosts || []} loading={isLoading} />
    </div>
  );
}
