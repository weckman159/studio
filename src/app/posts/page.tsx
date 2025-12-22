
'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, orderBy, limit, where, getDocs, QueryDocumentSnapshot } from 'firebase/firestore';
import { PostCard } from '@/components/shared/PostCard';
import { GlassCard } from '@/components/shared/GlassCard';
import { cn } from '@/lib/utils';
import { Loader2, TrendingUp } from 'lucide-react';
import type { Post as PostType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

// Define the shape PostCard expects, based on analysis
interface PostCardPost {
  id: string;
  title: string;
  author: string;
  avatarUrl: string;
  imageUrl: string;
  excerpt: string;
  likes: number;
  comments: number;
  tags: string[];
}

export default function FeedPage() {
  const [newPosts, setNewPosts] = useState<PostCardPost[]>([]);
  const [popularPosts, setPopularPosts] = useState<PostCardPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchPosts() {
      if (!firestore) return;

      try {
        setLoading(true);
        
        const newPostsQuery = query(
          collection(firestore, 'posts'),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        
        const popularQuery = query(
          collection(firestore, 'posts'),
          orderBy('likesCount', 'desc'),
          limit(3)
        );

        const [newSnap, popularSnap] = await Promise.all([
          getDocs(newPostsQuery),
          getDocs(popularQuery)
        ]);

        const transformPost = (doc: QueryDocumentSnapshot): PostCardPost => {
          const postData = doc.data() as PostType;
          return {
            id: doc.id,
            title: postData.title || 'Без названия',
            author: postData.authorName || 'Неизвестный автор',
            avatarUrl: postData.authorAvatar || '',
            imageUrl: postData.imageUrl || '',
            excerpt: postData.content?.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...' || '',
            likes: postData.likesCount || 0,
            comments: postData.commentsCount || 0,
            tags: postData.tags || [],
          };
        };

        setNewPosts(newSnap.docs.map(transformPost));
        setPopularPosts(popularSnap.docs.map(transformPost));
      } catch (error) {
        console.error('Ошибка загрузки постов:', error);
        toast({
            variant: "destructive",
            title: "Ошибка загрузки",
            description: "Не удалось загрузить посты. Пожалуйста, попробуйте обновить страницу.",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [firestore, toast]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <GlassCard className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12">
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-8 text-foreground">Новые посты</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {newPosts.map((post) => (
            <PostCard key={post.id} post={post} className="h-full md:h-[450px]" />
          ))}
        </div>
      </section>

      <GlassCard className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="h-6 w-6 text-accent" />
          <h3 className="text-xl font-bold text-foreground">Самые популярные</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularPosts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              className="h-full md:h-[300px] hover:scale-[1.02] transition-transform duration-200" 
            />
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
