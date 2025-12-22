'use client';

import { useState, useEffect } from 'react';
import { PostCard } from '@/components/shared/PostCard';
import { GlassCard } from '@/components/shared/GlassCard';
import { Loader2, TrendingUp, Sparkles } from 'lucide-react';
import type { Post } from '@/lib/types';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { PageShell } from '@/components/shared/PageShell';

export default function FeedPage() {
  const [newPosts, setNewPosts] = useState<Post[]>([]);
  const [popularPosts, setPopularPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const firestore = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    if (!firestore) return;

    async function fetchPosts() {
      try {
        setLoading(true);
        
        // Динамический импорт Firebase функций
        const { collection, query, orderBy, limit, where, getDocs } = await import('firebase/firestore');
        
        // Новые посты
        const newPostsQuery = query(
          collection(firestore, 'posts'),
          where('status', '==', 'published'),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        
        // Популярные посты
        const popularQuery = query(
          collection(firestore, 'posts'),
          where('status', '==', 'published'),
          orderBy('likesCount', 'desc'),
          limit(3)
        );

        const [newSnap, popularSnap] = await Promise.all([
          getDocs(newPostsQuery),
          getDocs(popularQuery)
        ]);

        setNewPosts(newSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post)));
        setPopularPosts(popularSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post)));
      } catch (error) {
        console.error('Ошибка загрузки постов:', error);
        toast({
            variant: "destructive",
            title: "Ошибка сети",
            description: "Не удалось загрузить ленту постов. Попробуйте обновить страницу.",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [firestore, toast]);

  if (loading) {
    return (
      <PageShell>
        <GlassCard className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </GlassCard>
      </PageShell>
    );
  }

  return (
    <PageShell>
      {/* Новые посты */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
            <Sparkles className="h-7 w-7 text-secondary" />
            <h2 className="text-2xl font-bold text-foreground">Новые посты</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {newPosts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              className="h-[450px] hover:scale-[1.02] transition-transform duration-300"
            />
          ))}
        </div>
      </section>

      {/* Популярные посты */}
      <GlassCard className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-bold text-foreground">Самые популярные</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularPosts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              className="h-[300px] hover:scale-[1.02] transition-transform duration-200" 
            />
          ))}
        </div>
      </GlassCard>
    </PageShell>
  );
}
