
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, getDocs, orderBy, limit, DocumentData, startAfter, where } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { PostCard } from '@/components/PostCard';
import { PostFilters } from '@/components/PostFilters';
import { Post } from '@/lib/types';
import { serializeFirestoreData } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Users, Newspaper, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";


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

function TopUsersWidget() {
  const topAuthors = [
    { id: '1', name: 'Alex Driver', photoURL: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', stats: { postsCount: 128 } },
    { id: '2', name: 'Julia Stevens', photoURL: 'https://i.pravatar.cc/150?u=a042581f4e29026705d', stats: { postsCount: 94 } },
    { id: '3', name: 'Max Power', photoURL: 'https://i.pravatar.cc/150?u=maxpower', stats: { postsCount: 81 } }
  ];

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

function AutoNewsWidget() {
  const news = [
    { id: 1, title: "Производство твердотельных аккумуляторов началось на заводе в Неваде.", source: 'EV TECH', sourceUrl: '#' },
    { id: 2, title: "Новый рекорд круга на Нюрбургринге установлен загадочным прототипом.", source: 'RACING', sourceUrl: '#' },
    { id: 3, title: "Глобальный стандарт зарядки ускоряет внедрение в ЕС.", source: 'INDUSTRY', sourceUrl: '#' },
  ];
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
    const [lastDoc, setLastDoc] = useState<DocumentData | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    
    const [activeCategory, setActiveCategory] = useState('Все');
    const [searchQuery, setSearchQuery] = useState('');
    const [feedType, setFeedType] = useState<'global' | 'following'>('global');

    const POSTS_PER_PAGE = 10;

    useEffect(() => {
        const fetchPosts = async () => {
            if (!firestore) return;
            setLoading(true);
            setPosts([]);
            setLastDoc(null);
            
            try {
                let baseQuery = collection(firestore, 'posts');
                let conditions: any[] = [orderBy('createdAt', 'desc'), limit(POSTS_PER_PAGE)];
                
                if (activeCategory !== 'Все') {
                    conditions.unshift(where('category', '==', activeCategory));
                }

                // TODO: Add logic for 'following' feedType

                const postsQuery = query(baseQuery, ...conditions);
                const snapshot = await getDocs(postsQuery);
                const postsData = snapshot.docs.map(doc => serializeFirestoreData({ id: doc.id, ...doc.data() }) as Post);
                
                setPosts(postsData);
                setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
                setHasMore(snapshot.docs.length === POSTS_PER_PAGE);

            } catch (error) {
                console.error("Error fetching posts:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, [firestore, activeCategory, feedType]);

    const handleLoadMore = async () => {
        if (!firestore || !lastDoc || !hasMore) return;
        setLoadingMore(true);
        try {
            let baseQuery = collection(firestore, 'posts');
            let conditions: any[] = [
                orderBy('createdAt', 'desc'),
                startAfter(lastDoc),
                limit(POSTS_PER_PAGE)
            ];

            if (activeCategory !== 'Все') {
                conditions.unshift(where('category', '==', activeCategory));
            }
            
            const postsQuery = query(baseQuery, ...conditions);
            const snapshot = await getDocs(postsQuery);
            const newPostsData = snapshot.docs.map(doc => serializeFirestoreData({ id: doc.id, ...doc.data() }) as Post);

            setPosts(prevPosts => [...prevPosts, ...newPostsData]);
            setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
            setHasMore(snapshot.docs.length === POSTS_PER_PAGE);

        } catch (error) {
            console.error("Error fetching more posts:", error);
        } finally {
            setLoadingMore(false);
        }
    }

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
                                <div className="flex justify-end mt-8">
                                    <Button onClick={handleLoadMore} disabled={loadingMore} variant="outline" size="lg">
                                        {loadingMore ? (
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        ) : null}
                                        ЕЩЕ
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="holographic-panel rounded-xl text-center py-16">
                            <MessageSquare className="mx-auto h-12 w-12 text-text-muted mb-4"/>
                            <h3 className="text-xl font-semibold text-white">Публикаций не найдено</h3>
                            <p className="text-text-secondary mt-2">Попробуйте изменить фильтры или стать первым автором!</p>
                        </div>
                    )}
                </main>
                <aside className="lg:col-span-1 space-y-6 hidden lg:block">
                    <TopUsersWidget />
                    <AutoNewsWidget />
                </aside>
            </div>
        </div>
    );
}
