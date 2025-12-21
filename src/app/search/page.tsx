
'use client';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { collection, query, getDocs, limit, where, orderBy } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Users, Search as SearchIcon, Loader2 } from 'lucide-react';
import type { Post, User } from '@/lib/types';
import { serializeFirestoreData } from '@/lib/utils';

function SearchResultsComponent() {
  const params = useSearchParams();
  const q = params.get('q')?.trim().toLowerCase() || '';
  const firestore = useFirestore();

  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (q.length >= 2 && firestore) {
      setLoading(true);
      
      const fetchResults = async () => {
        try {
            // Оптимизация: Запрашиваем ограниченное количество записей
            // Fetching users
            const usersRef = collection(firestore, 'users');
            const usersQ = query(usersRef, limit(20)); 
            const usersSnap = await getDocs(usersQ);
            
            const filteredUsers = usersSnap.docs
                .map((d: any) => serializeFirestoreData({ id: d.id, ...d.data() } as User))
                .filter((u: User) => 
                    u.name?.toLowerCase().includes(q) || 
                    u.displayName?.toLowerCase().includes(q) ||
                    u.nickname?.toLowerCase().includes(q)
                );
            setUsers(filteredUsers);

            // Fetching posts
            const postsRef = collection(firestore, 'posts');
            const postsQ = query(postsRef, orderBy('createdAt', 'desc'), limit(50));
            const postsSnap = await getDocs(postsQ);

            const filteredPosts = postsSnap.docs
                .map((d: any) => serializeFirestoreData({ id: d.id, ...d.data() } as Post))
                .filter((p: Post) => 
                    p.title?.toLowerCase().includes(q) || 
                    (p.content && p.content.toLowerCase().includes(q))
                );
            setPosts(filteredPosts);

        } catch (e) {
            console.error("Search error:", e);
        } finally {
            setLoading(false);
        }
      };

      fetchResults();
    } else {
        setPosts([]);
        setUsers([]);
    }
  }, [q, firestore]);

  if (!q) {
    return (
        <Card className="mt-8">
            <CardContent className='p-12 text-center text-muted-foreground flex flex-col items-center'>
                <SearchIcon className="h-12 w-12 mb-4 opacity-20" />
                Введите поисковый запрос (минимум 2 символа).
            </CardContent>
        </Card>
    );
  }

  if (loading) {
    return (
        <div className="space-y-6 mt-8">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
        </div>
    );
  }
  
  return (
    <div className="space-y-8 mt-8">
      <h1 className="text-3xl font-bold">Результаты для: <span className="text-primary">{q}</span></h1>

      {users.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'><Users className='mr-2 h-5 w-5'/> Пользователи ({users.length})</CardTitle>
            </CardHeader>
            <CardContent>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {users.map(user => (
                    <Link key={user.id} href={`/profile/${user.id}`}>
                        <div className="flex items-center gap-3 p-3 rounded-md hover:bg-muted border">
                            <Avatar>
                                <AvatarImage src={user.photoURL} />
                                <AvatarFallback>{user.displayName?.[0] || 'U'}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{user.displayName || user.name}</p>
                                {user.nickname && <p className="text-sm text-muted-foreground">@{user.nickname}</p>}
                            </div>
                        </div>
                    </Link>
                  ))}
                </div>
            </CardContent>
          </Card>
      )}

      {posts.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'><FileText className='mr-2 h-5 w-5'/> Посты ({posts.length})</CardTitle>
            </CardHeader>
            <CardContent>
                <div className='space-y-4'>
                  {posts.map(post => (
                    <Link key={post.id} href={`/posts/${post.id}`}>
                        <div className="p-4 rounded-lg hover:bg-muted border transition-colors">
                            <p className="font-semibold text-lg">{post.title}</p>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                {post.content.replace(/<[^>]*>?/gm, '').substring(0, 150)}...
                            </p>
                        </div>
                    </Link>
                  ))}
                </div>
            </CardContent>
          </Card>
      ) : (
          users.length === 0 && <p className="text-muted-foreground text-center py-10">Ничего не найдено.</p>
      )}
    </div>
  );
}

export default function SearchPage() {
    return (
        <div className="p-4 md:p-8">
            <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="animate-spin"/></div>}>
                <SearchResultsComponent />
            </Suspense>
        </div>
    )
}
