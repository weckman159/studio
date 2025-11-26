// src/app/news/page.tsx
// Главная страница раздела новостей
// Лента последних новостей, поиск, фильтрация по категориям, кнопка добавления
// Gemini: список новостей из Firestore, сортировка по дате

'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Newspaper, Calendar } from 'lucide-react';

// Интерфейс новости
interface NewsShort {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  imageUrl?: string;
  authorName: string;
  createdAt: any;
}

// Категории новостей
const categories = [
  'all',
  'Новости сайта',
  'Новые модели',
  'Автоспорт',
  'Обзоры',
  'Рынок',
  'Экология',
  'Объявления',
];

export default function NewsFeedPage() {
  const firestore = useFirestore();
  const [news, setNews] = useState<NewsShort[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsShort[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  // Загрузка новостей из Firestore
  useEffect(() => {
    if (firestore) {
      fetchNews();
    }
  }, [firestore]);

  const fetchNews = async () => {
    if (!firestore) return;
    try {
      setLoading(true);
      const q = query(
        collection(firestore, 'news'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const data: NewsShort[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as NewsShort));
      setNews(data);
      setFilteredNews(data);
    } catch (e) {
      console.error('Ошибка загрузки новостей:', e);
    } finally {
      setLoading(false);
    }
  };

  // Фильтрация новостей
  useEffect(() => {
    let result = [...news];

    if (selectedCategory !== 'all') {
      result = result.filter(n => n.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(n =>
        n.title.toLowerCase().includes(q) ||
        (n.subtitle?.toLowerCase() || '').includes(q)
      );
    }
    setFilteredNews(result);
  }, [news, selectedCategory, searchQuery]);

  // Форматирование даты
  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  // UI loading
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Загрузка новостей...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Хедер и кнопка добавить */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Новости</h1>
          <p className="text-muted-foreground">
            Актуальные новости автосообщества и платформы
          </p>
        </div>
        <Link href="/news/create">
          <Button size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Добавить новость
          </Button>
        </Link>
      </div>
      {/* Поиск и категории */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            type="text"
            placeholder="Поиск по заголовку или анонсу"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 h-12"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(cat)}
              size="sm"
            >
              {cat === 'all' ? 'Все категории' : cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Лента новостей */}
      {filteredNews.length === 0 ? (
        <div className="text-center py-12">
          <Newspaper className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Новостей нет</h3>
          <p className="text-muted-foreground mb-6">
            Все новости будут отображаться здесь
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map(newsItem => (
            <Link key={newsItem.id} href={`/news/${newsItem.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer flex flex-col">
                {newsItem.imageUrl && (
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg relative">
                    <Image
                      src={newsItem.imageUrl}
                      alt={newsItem.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-4 flex flex-col flex-1">
                    <CardHeader className="p-0 mb-2">
                      <CardTitle className="text-lg line-clamp-2">{newsItem.title}</CardTitle>
                      {newsItem.subtitle && (
                        <CardDescription className="line-clamp-2 pt-1">
                          {newsItem.subtitle}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="p-0 flex-1 flex flex-col justify-end">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="secondary">{newsItem.category}</Badge>
                      </div>
                       <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                          <span>{newsItem.authorName}</span>
                          <span className="text-xs">•</span>
                          <span>{formatDate(newsItem.createdAt)}</span>
                      </div>
                    </CardContent>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
