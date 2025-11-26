// src/app/news/[id]/page.tsx
// Детальная страница конкретной новости
// Отображает полный текст, автора, дату, изображение
// Gemini: динамический роут - [id] это ID новости из Firestore

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Share2,
  Edit3,
  AlertCircle 
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Интерфейс полной новости
// Gemini: расширенная структура с полным текстом и информацией об авторе
interface NewsArticle {
  id: string;
  title: string;
  subtitle?: string;
  content: string; // Полный текст новости (может быть HTML из CKEditor)
  category: string;
  imageUrl?: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: any;
  updatedAt?: any;
  views?: number;
}

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const newsId = params.id as string;

  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);

  // Загрузка новости
  useEffect(() => {
    if (newsId && firestore) {
      fetchArticle();
    }
  }, [newsId, firestore]);

  // Функция загрузки новости из Firestore
  // Gemini: получаем документ новости по ID
  const fetchArticle = async () => {
    if (!firestore) return;
    try {
      setLoading(true);
      const articleDoc = await getDoc(doc(firestore, 'news', newsId));

      if (!articleDoc.exists()) {
        router.push('/news');
        return;
      }

      const articleData = {
        id: articleDoc.id,
        ...articleDoc.data()
      } as NewsArticle;

      setArticle(articleData);

      // TODO: Увеличить счетчик просмотров (опционально)
      // await updateDoc(doc(firestore, 'news', newsId), {
      //   views: increment(1)
      // });

    } catch (error) {
      console.error('Ошибка загрузки новости:', error);
    } finally {
      setLoading(false);
    }
  };

  // Форматирование даты
  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Функция "Поделиться"
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title,
          text: article?.subtitle,
          url: window.location.href
        });
      } catch (error) {
        console.log('Ошибка при попытке поделиться:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Ссылка скопирована в буфер обмена');
    }
  };

  // Проверка, является ли текущий пользователь автором
  const isAuthor = article && user && article.authorId === user.uid;

  // UI загрузки
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Загрузка новости...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Новость не найдена.
            <Link href="/news" className="ml-2 underline">
              Вернуться к новостям
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Обложка новости */}
      {article.imageUrl && (
        <div className="relative w-full h-[400px] overflow-hidden bg-muted">
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Кнопка назад */}
        <Link href="/news">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            К новостям
          </Button>
        </Link>

        {/* Основной контент */}
        <article>
          {/* Категория */}
          <div className="mb-4">
            <Badge>{article.category}</Badge>
          </div>

          {/* Заголовок */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              {article.title}
            </h1>
            {isAuthor && (
              <Link href={`/news/edit/${newsId}`}>
                <Button variant="outline" size="icon">
                  <Edit3 className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>

          {/* Подзаголовок */}
          {article.subtitle && (
            <p className="text-xl text-muted-foreground mb-6">
              {article.subtitle}
            </p>
          )}

          {/* Мета-информация */}
          <div className="flex flex-wrap items-center gap-6 mb-8 pb-6 border-b">
            {/* Автор */}
            <Link href={`/profile/${article.authorId}`}>
              <div className="flex items-center gap-3 hover:opacity-80 cursor-pointer">
                <Avatar>
                  {article.authorAvatar && <AvatarImage src={article.authorAvatar} />}
                  <AvatarFallback>{article.authorName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{article.authorName}</p>
                  <p className="text-xs text-muted-foreground">Автор</p>
                </div>
              </div>
            </Link>

            {/* Дата публикации */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(article.createdAt)}</span>
            </div>

            {/* Просмотры */}
            {article.views !== undefined && (
              <div className="text-sm text-muted-foreground">
                👁 {article.views} просмотров
              </div>
            )}

            {/* Кнопка "Поделиться" */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="ml-auto"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Поделиться
            </Button>
          </div>

          {/* Текст новости */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div 
                className="prose prose-lg dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </CardContent>
          </Card>

          {/* Информация об авторе */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Об авторе</h3>
            </CardHeader>
            <CardContent>
              <Link href={`/profile/${article.authorId}`}>
                <div className="flex items-center gap-4 hover:bg-accent p-4 rounded-lg cursor-pointer">
                  <Avatar className="h-16 w-16">
                    {article.authorAvatar && <AvatarImage src={article.authorAvatar} />}
                    <AvatarFallback className="text-xl">
                      {article.authorName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-lg">{article.authorName}</p>
                    <p className="text-sm text-muted-foreground">
                      Перейти к профилю автора
                    </p>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>

          {/* Дата обновления */}
          {article.updatedAt && (
            <div className="mt-6 text-sm text-muted-foreground text-center">
              Последнее обновление: {formatDate(article.updatedAt)}
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
