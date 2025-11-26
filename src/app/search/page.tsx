'use client';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Users } from 'lucide-react';
import type { Post, User } from '@/lib/data';

function SearchResultsComponent() {
  const params = useSearchParams();
  const q = params.get('q')?.trim().toLowerCase() || '';
  const firestore = useFirestore();

  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (q && firestore) {
      setLoading(true);
      Promise.all([
        getDocs(query(collection(firestore, 'posts'))),
        getDocs(query(collection(firestore, 'users')))
      ]).then(([postsSnap, usersSnap]) => {
        
        const filteredPosts = postsSnap.docs
          .map(d => ({ id: d.id, ...d.data() } as Post))
          .filter(p => p.title?.toLowerCase()?.includes(q) || p.content?.toLowerCase()?.includes(q));
        setPosts(filteredPosts);

        const filteredUsers = usersSnap.docs
          .map(d => ({ id: d.id, ...d.data() } as User))
          .filter(u => u.name?.toLowerCase()?.includes(q) || u.nickname?.toLowerCase()?.includes(q));
        setUsers(filteredUsers);
        
        setLoading(false);
      }).catch(err => {
        console.error("Search failed:", err);
        setLoading(false);
      });
    }
  }, [q, firestore]);

  if (!q) {
    return (
        <Card>
            <CardContent className='p-8 text-center text-muted-foreground'>
                Введите поисковый запрос.
            </CardContent>
        </Card>
    );
  }

  if (loading) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-48" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-48" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </CardContent>
            </Card>
        </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Результаты поиска: <span className="text-primary">{q}</span></h1>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center'><FileText className='mr-2 h-5 w-5'/> Посты ({posts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <p className="text-muted-foreground">Посты не найдены.</p>
          ) : (
            <div className='space-y-3'>
              {posts.map(post => (
                <Link key={post.id} href={`/posts/${post.id}`}>
                    <div className="p-3 rounded-md hover:bg-muted">
                        <p className="font-semibold">{post.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2" dangerouslySetInnerHTML={{ __html: post.content }}></p>
                    </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center'><Users className='mr-2 h-5 w-5'/> Пользователи ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-muted-foreground">Пользователи не найдены.</p>
          ) : (
            <div className='space-y-2'>
              {users.map(user => (
                <Link key={user.id} href={`/profile/${user.id}`}>
                    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
                        <Avatar>
                            <AvatarImage src={user.photoURL} />
                            <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{user.name}</p>
                            {user.nickname && <p className="text-sm text-muted-foreground">@{user.nickname}</p>}
                        </div>
                    </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


export default function SearchPage() {
    return (
        <Suspense fallback={<div>Загрузка...</div>}>
            <SearchResultsComponent />
        </Suspense>
    )
}
