
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, getDocs, orderBy, limit, startAfter, DocumentSnapshot } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Post, User, AutoNews } from '@/lib/types';
import { serializeFirestoreData } from '@/lib/utils';
import { PostCard } from '@/components/PostCard';
import { Button } from '@/components/ui/button';
import { TopUsersWidget } from '@/components/TopUsersWidget';
import { AutoNewsWidget } from '@/components/AutoNewsWidget';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const POSTS_PER_PAGE = 15; // 5 rows * 3 columns

function HomePageSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <main className="lg:col-span-3 space-y-8">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-9 w-32" />
                    <Skeleton className="h-10 w-24" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {[...Array(POSTS_PER_PAGE)].map((_, i) => (
                        <Skeleton key={i} className="aspect-square w-full rounded-xl" />
                    ))}
                </div>
            </main>
            <aside className="lg:col-span-1 space-y-6 hidden lg:block">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
            </aside>
        </div>
    );
}

export default function HomePage() {
  const firestore = useFirestore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [latestNews, setLatestNews] = useState<AutoNews[]>([]);
  const [topAuthors, setTopAuthors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchSideWidgetsData = useCallback(async () => {
    if (!firestore) return;
    try {
        const [newsSnap, authorsSnap] = await Promise.all([
            getDocs(query(collection(firestore, 'autoNews'), orderBy('publishedAt', 'desc'), limit(3))),
            getDocs(query(collection(firestore, 'users'), orderBy('stats.postsCount', 'desc'), limit(3))),
        ]);
        setLatestNews(newsSnap.docs.map(doc => serializeFirestoreData({ id: doc.id, ...doc.data() }) as AutoNews));
        setTopAuthors(authorsSnap.docs.map(doc => serializeFirestoreData({ id: doc.id, ...doc.data() }) as User));
    } catch (error) {
        console.error("Error fetching sidebar data:", error);
    }
  }, [firestore]);

  const fetchPosts = useCallback(async (loadMore = false) => {
    if (!firestore || (!hasMore && loadMore)) return;

    const currentLoadingSetter = loadMore ? setLoadingMore : setLoading;
    currentLoadingSetter(true);
    
    try {
        let q = query(collection(firestore, 'posts'), orderBy('createdAt', 'desc'), limit(POSTS_PER_PAGE));
        if (loadMore && lastVisible) {
            q = query(q, startAfter(lastVisible));
        }

        const postsSnap = await getDocs(q);
        const newPosts = postsSnap.docs.map(doc => serializeFirestoreData({ id: doc.id, ...doc.data() }) as Post);
        
        setPosts(prev => loadMore ? [...prev, ...newPosts] : newPosts);
        
        const lastDoc = postsSnap.docs[postsSnap.docs.length - 1];
        setLastVisible(lastDoc || null);

        if (postsSnap.docs.length < POSTS_PER_PAGE) {
            setHasMore(false);
        }
    } catch (error) {
        console.error("Error fetching posts:", error);
    } finally {
        currentLoadingSetter(false);
    }
  }, [firestore, hasMore, lastVisible]);
  
  useEffect(() => {
    fetchSideWidgetsData();
    fetchPosts(false);
  }, [fetchPosts, fetchSideWidgetsData]);

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 overflow-y-auto scroll-effect p-4 md:p-8">
        {loading ? <HomePageSkeleton /> : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <main className="lg:col-span-3 space-y-8">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold">Лента</h1>
                    </div>
                    {posts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {posts.map(post => <PostCard key={post.id} post={post} isSquare={true} />)}
                        </div>
                    ) : (
                        <div className="text-center py-16 border-2 border-dashed rounded-xl">
                        <p className="text-muted-foreground">Публикаций пока нет.</p>
                        </div>
                    )}
                    {hasMore && (
                        <div className="flex justify-center mt-10">
                            <Button variant="outline" size="lg" onClick={() => fetchPosts(true)} disabled={loadingMore} className="bg-[#111] border-[#333] hover:opacity-80 px-8 py-3 h-12">
                                {loadingMore ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'ЕЩЕ'}
                            </Button>
                        </div>
                    )}
                </main>
                <aside className="lg:col-span-1 space-y-6 hidden lg:block">
                    <TopUsersWidget topAuthors={topAuthors} loading={loading} />
                    <AutoNewsWidget news={latestNews} loading={loading} />
                </aside>
            </div>
        )}
      </div>
    </div>
  );
}
