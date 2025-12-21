
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { collection, query, getDocs, orderBy, where, limit, QueryDocumentSnapshot, DocumentSnapshot, startAfter } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { PostCard } from '@/components/PostCard';
import { PostFilters } from '@/components/PostFilters';
import { Post, User, AutoNews } from '@/lib/types';
import { serializeFirestoreData } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Users, Newspaper, Loader2, Star } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const POSTS_PER_PAGE = 8;

function FeedSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="flex flex-col gap-6 p-4 border border-border rounded-xl holographic-panel">
                    <Skeleton className="w-full h-56 rounded-lg" />
                    <div className="flex-1 space-y-4">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <div className="flex items-center justify-between pt-4">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-1">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                            </div>
                            <Skeleton className="h-6 w-16" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function TopUsersWidget({ topAuthors, loading }: { topAuthors: User[], loading: boolean }) {
  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5" /> Топ авторы</CardTitle></CardHeader>
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

function AutoNewsWidget({ news, loading }: { news: AutoNews[], loading: boolean }) {
  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle className="flex items-center"><Newspaper className="mr-2 h-5 w-5" /> Автоновости</CardTitle></CardHeader>
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
      </CardContent>
    </Card>
  );
}


export default function PostsPage() {
    const firestore = useFirestore();
    const { user } = useUser();
    
    const [posts, setPosts] = useState<Post[]>([]);
    const [popularPosts, setPopularPosts] = useState<Post[]>([]);
    const [topAuthors, setTopAuthors] = useState<User[]>([]);
    const [latestNews, setLatestNews] = useState<AutoNews[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [lastVisible, setLastVisible] = useState<DocumentSnapshot | null>(null);
    const [hasMore, setHasMore] = useState(true);

    const [activeCategory, setActiveCategory] = useState('Все');
    const [searchQuery, setSearchQuery] = useState('');
    const [feedType, setFeedType] = useState<'global' | 'following'>('global');

    const fetchPosts = useCallback(async (loadMore = false) => {
        if (!firestore) return;
        
        let queryRef;
        if (loadMore) {
            setLoadingMore(true);
            if (!lastVisible) { // Should not happen if hasMore is true, but as a safeguard
                setLoadingMore(false);
                return;
            }
            queryRef = query(collection(firestore, 'posts'), orderBy('createdAt', 'desc'), startAfter(lastVisible), limit(POSTS_PER_PAGE));
        } else {
            setLoading(true);
            setPosts([]);
            setLastVisible(null);
            queryRef = query(collection(firestore, 'posts'), orderBy('createdAt', 'desc'), limit(POSTS_PER_PAGE));
        }

        try {
            const documentSnapshots = await getDocs(queryRef);
            const newPosts = documentSnapshots.docs.map(doc => serializeFirestoreData({ id: doc.id, ...doc.data() }) as Post);

            setPosts(prevPosts => loadMore ? [...prevPosts, ...newPosts] : newPosts);
            
            const lastDoc = documentSnapshots.docs[documentSnapshots.docs.length - 1];
            setLastVisible(lastDoc || null);

            setHasMore(documentSnapshots.docs.length === POSTS_PER_PAGE);
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [firestore, lastVisible]);


    useEffect(() => {
        const fetchInitialData = async () => {
            if (!firestore) return;
            setLoading(true);

            try {
                // Initial post fetch
                let basePostsQuery = query(collection(firestore, 'posts'), orderBy('createdAt', 'desc'));
                
                if (feedType === 'following' && user) {
                    const followingRef = collection(firestore, 'users', user.uid, 'following');
                    const followingSnap = await getDocs(followingRef);
                    const followingIds = followingSnap.docs.map(doc => doc.id);

                    if (followingIds.length > 0) {
                        basePostsQuery = query(basePostsQuery, where('authorId', 'in', followingIds));
                    } else {
                        setPosts([]);
                        setHasMore(false);
                        // Don't return yet, still need to fetch widgets
                    }
                }

                if (activeCategory !== 'Все') {
                    basePostsQuery = query(basePostsQuery, where('category', '==', activeCategory));
                }

                const finalPostsQuery = query(basePostsQuery, limit(POSTS_PER_PAGE));

                // Widget queries
                const popularPostsQuery = query(collection(firestore, 'posts'), orderBy('likesCount', 'desc'), limit(4));
                const topAuthorsQuery = query(collection(firestore, 'users'), orderBy('stats.postsCount', 'desc'), limit(3));
                const latestNewsQuery = query(collection(firestore, 'autoNews'), orderBy('publishedAt', 'desc'), limit(3));

                const [postsSnap, popularPostsSnap, authorsSnap, newsSnap] = await Promise.all([
                    getDocs(finalPostsQuery),
                    getDocs(popularPostsQuery),
                    getDocs(topAuthorsQuery),
                    getDocs(latestNewsQuery)
                ]);

                // Set posts and pagination state
                const postsData = postsSnap.docs.map(doc => serializeFirestoreData({ id: doc.id, ...doc.data() }) as Post);
                setPosts(postsData);
                setLastVisible(postsSnap.docs[postsSnap.docs.length - 1] || null);
                setHasMore(postsSnap.docs.length === POSTS_PER_PAGE);

                // Set widget data
                setPopularPosts(popularPostsSnap.docs.map(doc => serializeFirestoreData({ id: doc.id, ...doc.data() }) as Post));
                setTopAuthors(authorsSnap.docs.map(doc => serializeFirestoreData({ id: doc.id, ...doc.data() }) as User));
                setLatestNews(newsSnap.docs.map(doc => serializeFirestoreData({ id: doc.id, ...doc.data() }) as AutoNews));

            } catch (error) {
                console.error("Error fetching initial page data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [firestore, user, feedType, activeCategory]);

    const filteredPosts = useMemo(() => {
        if (!searchQuery) return posts;
        const lowercasedQuery = searchQuery.toLowerCase();
        return posts.filter(p => 
            p.title.toLowerCase().includes(lowercasedQuery) ||
            (p.content && p.content.toLowerCase().includes(lowercasedQuery))
        );
    }, [posts, searchQuery]);

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-4xl font-bold mb-8 text-white">Лента блогов</h1>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <main className="lg:col-span-3 space-y-6">
                    <PostFilters 
                        activeType={activeCategory}
                        onTypeChange={setActiveCategory}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        feedType={feedType}
                        onFeedTypeChange={setFeedType}
                        showFeedToggle={!!user}
                    />

                    {loading ? (
                        <FeedSkeleton />
                    ) : filteredPosts.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {filteredPosts.map(post => <PostCard key={post.id} post={post} />)}
                            </div>
                             {hasMore && (
                                <div className="flex justify-center pt-8">
                                    <Button onClick={() => fetchPosts(true)} disabled={loadingMore}>
                                        {loadingMore ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Ещё'}
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="holographic-panel rounded-xl text-center py-16">
                            <MessageSquare className="mx-auto h-12 w-12 text-text-muted mb-4"/>
                            <h3 className="text-xl font-semibold text-white">Публикаций не найдено</h3>
                            <p className="text-text-secondary mt-2">
                                {feedType === 'following' && posts.length === 0 ? 'Подпишитесь на авторов, чтобы видеть их посты здесь.' : 'Попробуйте изменить фильтры или стать первым автором!'}
                            </p>
                        </div>
                    )}

                    {!loading && popularPosts.length > 0 && (
                        <div className="pt-8 mt-8 border-t border-border/20">
                            <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                                <Star className="text-primary" /> Популярные публикации
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {popularPosts.map(post => <PostCard key={post.id} post={post} />)}
                            </div>
                        </div>
                    )}
                </main>
                <aside className="lg:col-span-1 space-y-6 hidden lg:block">
                    <TopUsersWidget topAuthors={topAuthors} loading={loading} />
                    <AutoNewsWidget news={latestNews} loading={loading} />
                </aside>
            </div>
        </div>
    );
}
