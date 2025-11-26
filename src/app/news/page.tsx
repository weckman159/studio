// src/app/news/page.tsx
// Лента автомобильных новостей с автоматической загрузкой из внешних источников
// Новости подтягиваются через RSS-ленты или API автомобильных изданий
// Gemini: автоматическая агрегация новостей, без возможности создания пользователями

'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Newspaper, Calendar, ExternalLink, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Интерфейс автоновости
// Gemini: структура новости, загруженной из внешнего источника
interface AutoNews {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  source: string; // Источник новости (например: "Autoweek.ru", "Drom.ru")
  sourceUrl: string; // Ссылка на оригинал
  category: string; // Автоматически определённая категория
  publishedAt: any; // Дата публикации на источнике
  fetchedAt: any; // Дата загрузки в нашу БД
}

// Источники новостей для отображения
const newsSources = [
  'Все источники',
  'Autoweek.ru',
  'Kolesa.ru', 
  'Drive.ru',
  'Drom.ru',
  'Autovzglyad.ru',
  'Motor.ru',
];

const categories = [
  'Все категории',
  'Новые модели',
  'Автоспорт',
  'Тест-драйвы',
  'Технологии',
  'Рынок',
  'Электромобили',
  'Тюнинг'
];

export default function AutoNewsFeedPage() {
  const firestore = useFirestore();
  const [news, setNews] = useState<AutoNews[]>([]);
  const [filteredNews, setFilteredNews] = useState<AutoNews[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState('Все источники');
  const [selectedCategory, setSelectedCategory] = useState('Все категории');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Загрузка новостей при монтировании
  useEffect(() => {
    if (firestore) {
        fetchNews();
    }
  }, [firestore]);

  // Функция загрузки новостей из Firestore
  // Gemini: загружаем новости, которые были автоматически импортированы фоновым процессом
  const fetchNews = async () => {
    if (!firestore) return;
    try {
      setLoading(true);
      const q = query(
        collection(firestore, 'autoNews'),
        orderBy('publishedAt', 'desc'),
        limit(50)
      );
      const querySnapshot = await getDocs(q);
      const data: AutoNews[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AutoNews));
      setNews(data);
      setFilteredNews(data);
    } catch (e) {
      console.error('Ошибка загрузки новостей:', e);
    } finally {
      setLoading(false);
    }
  };

  // Функция принудительного обновления новостей
  // Gemini: вызывает Cloud Function для загрузки свежих новостей из RSS
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      
      // TODO: Вызов Cloud Function для обновления новостей
      // const response = await fetch('/api/refresh-news', { method: 'POST' });
      // if (response.ok) {
      //   await fetchNews();
      // }
      
      // Временное решение - просто перезагружаем из Firestore
      await new Promise(resolve => setTimeout(resolve, 1000)); // имитация задержки
      await fetchNews();
      
    } catch (error) {
      console.error('Ошибка обновления новостей:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Фильтрация новостей
  useEffect(() => {
    let result = [...news];

    // Фильтр по источнику
    if (selectedSource !== 'Все источники') {
      result = result.filter(n => n.source === selectedSource);
    }

    // Фильтр по категории
    if (selectedCategory !== 'Все категории') {
      result = result.filter(n => n.category === selectedCategory);
    }

    // Поиск
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q)
      );
    }

    setFilteredNews(result);
  }, [news, selectedSource, selectedCategory, searchQuery]);

  // Форматирование даты
  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 3600) {
      const minutes = Math.floor(diff / 60);
      return `${minutes} мин. назад`;
    } else if (diff < 86400) {
      const hours = Math.floor(diff / 3600);
      return `${hours} ч. назад`;
    } else if (diff < 604800) {
      const days = Math.floor(diff / 86400);
      return `${days} дн. назад`;
    }
    
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  // UI загрузки
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
                <Skeleton className="h-10 w-64 mb-2" />
                <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-12 w-36" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
                <Card key={i}>
                    <Skeleton className="aspect-video w-full rounded-t-lg" />
                    <CardHeader>
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-6 w-full mb-1" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                </Card>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Хедер */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Автоновости</h1>
          <p className="text-muted-foreground">
            Последние новости автомобильного мира из проверенных источников
          </p>
        </div>
        <Button 
          size="lg" 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`mr-2 h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          Обновить
        </Button>
      </div>

      {/* Поиск и фильтры */}
      <div className="mb-8 space-y-4">
        {/* Поиск */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            type="text"
            placeholder="Поиск новостей..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 h-12"
          />
        </div>

        {/* Фильтр по источникам */}
        <div>
          <p className="text-sm font-medium mb-2">Источники:</p>
          <div className="flex flex-wrap gap-2">
            {newsSources.map(source => (
              <Button
                key={source}
                variant={selectedSource === source ? 'default' : 'outline'}
                onClick={() => setSelectedSource(source)}
                size="sm"
              >
                {source}
              </Button>
            ))}
          </div>
        </div>

        {/* Фильтр по категориям */}
        <div>
          <p className="text-sm font-medium mb-2">Категории:</p>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(cat)}
                size="sm"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Лента новостей */}
      {filteredNews.length === 0 ? (
        <div className="text-center py-12">
          <Newspaper className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Новостей не найдено</h3>
          <p className="text-muted-foreground mb-6">
            Попробуйте изменить параметры поиска или обновите ленту
          </p>
          <Button onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-5 w-5" />
            Обновить новости
          </Button>
        </div>
      ) : (
        <>
          {/* Счетчик */}
          <div className="mb-4 text-sm text-muted-foreground">
            Найдено: {filteredNews.length} новостей
          </div>

          {/* Сетка карточек */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map(item => (
              <Card key={item.id} className="h-full hover:shadow-lg transition-shadow flex flex-col">
                <div className="aspect-video w-full overflow-hidden rounded-t-lg relative bg-muted">
                    {item.imageUrl ? (
                        <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <Newspaper className="h-16 w-16 text-muted-foreground/50"/>
                        </div>
                    )}
                </div>

                <CardHeader className='flex-grow'>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="outline">{item.category}</Badge>
                    <span className="text-xs text-muted-foreground text-right shrink-0">
                      {formatDate(item.publishedAt)}
                    </span>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {item.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {item.source}
                    </span>
                    <a 
                      href={item.sourceUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="ghost" size="sm">
                        Читать
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
