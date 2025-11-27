
'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Newspaper, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

interface AutoNews {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  publishedAt: any;
}

export function AutoNewsWidget() {
  const [news, setNews] = useState<AutoNews[]>([]);
  const [loading, setLoading] = useState(true);
  const firestore = useFirestore();

  useEffect(() => {
    const fetchNews = async () => {
      if (!firestore) return;
      setLoading(true);
      try {
        const q = query(
          collection(firestore, 'autoNews'),
          orderBy('publishedAt', 'desc'),
          limit(5)
        );
        const snapshot = await getDocs(q);
        const newsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AutoNews));
        setNews(newsData);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [firestore]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="h-5 w-5" />
          Автоновости
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {news.map(item => (
              <div key={item.id}>
                <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline line-clamp-2">
                  {item.title}
                </a>
                <div className="text-xs text-muted-foreground flex justify-between mt-1">
                  <span>{item.source}</span>
                  <span>{formatDate(item.publishedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        <Button variant="outline" className="w-full mt-6" asChild>
          <Link href="/news">
            Все новости
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
