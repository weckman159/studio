
'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Newspaper } from 'lucide-react';
import type { AutoNews } from '@/lib/types';

interface AutoNewsWidgetProps {
  news: AutoNews[];
  loading: boolean;
}

export function AutoNewsWidget({ news, loading }: AutoNewsWidgetProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Newspaper className="mr-2 h-5 w-5" /> Автоновости</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
             <div key={i} className="space-y-1.5">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
             </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="holographic-panel">
      <CardHeader>
        <CardTitle className="flex items-center text-white"><Newspaper className="mr-2 h-5 w-5" /> Автоновости</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {news.map(item => (
          <div key={item.id}>
            <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-white hover:text-primary line-clamp-2 text-sm">
              {item.title}
            </a>
            <div className="text-xs text-text-secondary flex justify-between mt-1">
              <span>{item.source}</span>
            </div>
          </div>
        ))}
        <div className="text-center pt-2">
            <Link href="/news" className="text-sm text-primary hover:underline">Все новости</Link>
        </div>
      </CardContent>
    </Card>
  );
}
