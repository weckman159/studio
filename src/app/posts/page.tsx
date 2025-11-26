
// src/app/posts/page.tsx
// Лента пользовательских постов: публикации блогов, вопросы и фотоотчёты
// Поиск, фильтрация по типу поста (обсуждение, отчет, отзыв)
// Gemini: посты подтягиваются из Firestore, сортируются по дате

'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import { useFirestore, useMemoFirebase } from '@/firebase';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, MessageCircle, FileText } from 'lucide-react';
import type { Post as PostData, User, Car } from '@/lib/data';
import { users, cars } from '@/lib/data'; // Using mock users/cars for now
import { PostCard } from '@/components/PostCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { PostFilters } from '@/components/PostFilters';

export default function PostsPage() {
  const firestore = useFirestore();
  const [posts, setPosts] = useState<PostData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('Все');
  const [loading, setLoading] = useState(true);

  // Загрузка постов из Firestore
  useEffect(() => {
    if (!firestore) return;
    
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const q = query(
          collection(firestore, 'posts'),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const data: PostData[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as PostData));
        setPosts(data);
      } catch (e) {
        console.error('Ошибка загрузки постов:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [firestore]);

  // Фильтрация постов
  const filteredPosts = posts
    .filter(p => selectedType === 'Все' || p.type === selectedType)
    .filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase())
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
      {loading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
             <Card key={i}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-64" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-6 w-3/4 mb-4" />
                   <Skeleton className="aspect-video w-full rounded-lg" />
                </CardContent>
                 <CardFooter className="flex justify-between">
                   <Skeleton className="h-8 w-24" />
                   <Skeleton className="h-8 w-24" />
                </CardFooter>
              </Card>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Постов нет</h3>
          <p className="text-muted-foreground mb-6">
            Ваш пост может быть первым!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredPosts.map(post => {
            const user = users.find(u => u.id === post.authorId) || users[0];
            const car = cars.find(c => c.id === post.carId) || cars[0];
            if (!user || !car) return null;
            return <PostCard key={post.id} post={post} user={user} car={car} />;
          })}
        </div>
      )}
    </div>
  );
}
