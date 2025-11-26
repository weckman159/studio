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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, MessageCircle, FileText } from 'lucide-react';
import Image from 'next/image';
import { Post as PostData } from '@/lib/data';

// Типы постов для фильтрации
const postTypes = [
  'Все',
  'Блог',
  'Фотоотчет',
  'Вопрос',
  'Мой опыт',
  'Обзор'
];

export default function PostsPage() {
  const firestore = useFirestore();
  const [posts, setPosts] = useState<PostData[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<PostData[]>([]);
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
        setFilteredPosts(data);
      } catch (e) {
        console.error('Ошибка загрузки постов:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [firestore]);

  // Фильтрация постов
  useEffect(() => {
    let result = [...posts];

    // Фильтр по типу
    if (selectedType !== 'Все') {
      result = result.filter(p => p.type === selectedType);
    }

    // Поиск
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q)
      );
    }

    setFilteredPosts(result);
  }, [posts, selectedType, searchQuery]);

  // Форматирование даты (опционально)
  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // UI loading
  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Загрузка постов...</p>
          </div>
        </div>
      </div>
    );
  }

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
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            type="text"
            placeholder="Поиск по заголовку или содержимому"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 h-12"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {postTypes.map(type => (
            <Button
              key={type}
              variant={selectedType === type ? 'default' : 'outline'}
              onClick={() => setSelectedType(type)}
              size="sm"
            >
              {type}
            </Button>
          ))}
        </div>
      </div>
      {/* Лента постов */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Постов нет</h3>
          <p className="text-muted-foreground mb-6">
            Ваш пост может быть первым!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map(post => (
            <Link key={post.id} href={`/posts/${post.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer flex flex-col">
                <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
                    {post.imageUrl && (
                        <Image
                        src={post.imageUrl}
                        alt={post.title}
                        fill
                        className="object-cover"
                        />
                    )}
                </div>
                <CardHeader className="flex-grow">
                  <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                  <CardDescription className="line-clamp-3">
                    {post.content.replace(/<[^>]*>?/gm, '').slice(0, 120)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">{post.type}</Badge>
                  <span>Автор: {post.userId}</span> {/* Assuming authorName is not available on PostData */}
                  <span>{formatDate(post.createdAt)}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
