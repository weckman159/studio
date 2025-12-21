
'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Users } from 'lucide-react';
import type { User } from '@/lib/types';

interface TopUsersWidgetProps {
  topAuthors: User[];
  loading: boolean;
}

export function TopUsersWidget({ topAuthors, loading }: TopUsersWidgetProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5" /> Топ авторы</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="holographic-panel">
      <CardHeader>
        <CardTitle className="flex items-center text-white"><Users className="mr-2 h-5 w-5" /> Топ авторы</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {topAuthors.map(author => (
          <div key={author.id} className="flex items-center gap-3">
            <Avatar>
                <AvatarImage src={author.photoURL} />
                <AvatarFallback>{author.name?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <p className="font-semibold text-sm text-white">{author.name}</p>
                <p className="text-xs text-text-secondary">{author.stats?.postsCount || 0} постов</p>
            </div>
            <Button size="sm" variant="outline" asChild>
              <Link href={`/profile/${author.id}`}>Читать</Link>
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
