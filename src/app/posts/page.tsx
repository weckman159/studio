
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
// ПОЧЕМУ ИСПРАВЛЕНО: Добавлен импорт QueryDocumentSnapshot для явной типизации.
import { collection, query, getDocs, orderBy, where, limit, type QueryDocumentSnapshot, type DocumentSnapshot, startAfter } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { PostCard } from '@/components/PostCard';
import { PostFilters } from '@/components/PostFilters';
import { Post, User, AutoNews } from '@/lib/types';
import { serializeFirestoreData } from '@/lib/utils';
import { MessageSquare, Loader2, Star } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { TopUsersWidget } from '@/components/TopUsersWidget';
import { AutoNewsWidget } from '@/components/AutoNewsWidget';
import { useToast } from '@/hooks/use-toast';

const POSTS_PER_PAGE = 9; // Changed to be a multiple of 3

function FeedSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col gap-4">
                    <Skeleton className="w-full h-56 rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                     <div className="flex items-center gap-3 pt-2">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-1">
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function PostsPage() {
    const firestore = useFirestore();
    const { user } = useUser();
    const { toast } = useToast();
    
    const [posts, setPosts] = useState<Post[]>([]);
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
        
        const currentLoadingSetter = loadMore ? setLoadingMore : setLoading;
        currentLoadingSetter(true);

        if (!loadMore) {
            setPosts([]);
            setLastVisible(null);
            setHasMore(true);
        }

        try {
            let baseQuery;

            if (feedType === 'following' && user) {
                const followingRef = collection(firestore, 'users', user.uid, 'following');
                const followingSnap = await getDocs(followingRef);
                const followingIds = followingSnap.docs.map(doc => doc.id);

                if (followingIds.length > 0) {
                    baseQuery = query(collection(firestore, 'posts'), where('authorId', 'in', followingIds), orderBy('createdAt', 'desc'));
                } else {
                    setPosts([]);
                    setHasMore(false);
                    currentLoadingSetter(false);
                    return;
                }
            } else {
                baseQuery = query(collection(firestore, 'posts'), orderBy('createdAt', 'desc'));
            }

            if (activeCategory !== 'Все') {
                baseQuery = query(baseQuery, where('category', '==', activeCategory));
            }
            
            let finalQuery = query(baseQuery, limit(POSTS_PER_PAGE));

            if (loadMore && lastVisible) {
                finalQuery = query(finalQuery, startAfter(lastVisible));
            }

            const postsSnap = await getDocs(finalQuery);
            // ПОЧЕМУ ИСПРАВЛЕНО: Явно типизируем `doc` как QueryDocumentSnapshot для устранения ошибки `any`.
            const newPosts = postsSnap.docs.map((doc: QueryDocumentSnapshot) => serializeFirestoreData({ id: doc.id, ...doc.data() }) as Post);
            
            setPosts(prev => loadMore ? [...prev, ...newPosts] : newPosts);
            
            const lastDoc = postsSnap.docs[postsSnap.docs.length - 1];
            setLastVisible(lastDoc || null);

            if (postsSnap.docs.length < POSTS_PER_PAGE) {
                setHasMore(false);
            }

        } catch (error) {
            console.error("Error fetching posts:", error);
            toast({
                variant: "destructive",
                title: "Ошибка загрузки постов",
                description: "Не удалось загрузить ленту. Попробуйте обновить страницу.",
            });
        } finally {
            currentLoadingSetter(false);
        }
    }, [firestore, activeCategory, feedType, user, lastVisible, toast]);
    
    useEffect(() => {
        const fetchInitialData = async () => {
             if (!firestore) return;
             setLoading(true);
             try {
                const topAuthorsQuery = query(collection(firestore, 'users'), orderBy('stats.postsCount', 'desc'), limit(3));
                const latestNewsQuery = query(collection(firestore, 'autoNews'), orderBy('publishedAt', 'desc'), limit(3));
                
                const [authorsSnap, newsSnap] = await Promise.all([
                    getDocs(topAuthorsQuery),
                    getDocs(latestNewsQuery),
                ]);

                setTopAuthors(authorsSnap.docs.map((doc: QueryDocumentSnapshot) => serializeFirestoreData({ id: doc.id, ...doc.data() }) as User));
                setLatestNews(newsSnap.docs.map((doc: QueryDocumentSnapshot) => serializeFirestoreData({ id: doc.id, ...doc.data() }) as AutoNews));
                
             } catch(error) {
                 console.error("Error fetching widget data:", error);
             } finally {
                fetchPosts(false);
             }
        }
        fetchInitialData();
    }, [firestore, user, feedType, activeCategory, fetchPosts]);

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
            <h1 className="text-4xl font-bold mb-4 text-white">Лента блогов</h1>
            <p className="text-text-secondary mb-8 max-w-2xl">
                Лучшие публикации от нашего сообщества. Делитесь историями, задавайте вопросы и находите единомышленников.
            </p>
            
            <main className="space-y-12">
                <PostFilters 
                    activeType={activeCategory}
                    onTypeChange={setActiveCategory}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    feedType={feedType}
                    onFeedTypeChange={setFeedType}
                    showFeedToggle={!!user}
                />
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <TopUsersWidget topAuthors={topAuthors} loading={loading} />
                    <AutoNewsWidget news={latestNews} loading={loading} />
                    <div className="holographic-panel p-6 rounded-xl flex flex-col justify-center items-center text-center">
                         <h3 className="font-bold text-white text-lg">Хочешь поделиться?</h3>
                         <p className="text-text-secondary text-sm my-2">Создай свою публикацию и стань частью сообщества.</p>
                         <Button asChild className="mt-2">
                             <Link href="/posts/create">Начать писать</Link>
                         </Button>
                    </div>
                </div>

                <div>
                    {loading ? (
                        <FeedSkeleton />
                    ) : filteredPosts.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredPosts.map(post => <PostCard key={post.id} post={post} />)}
                            </div>
                             {hasMore && !loading && (
                                <div className="flex justify-center mt-12">
                                    <Button onClick={() => fetchPosts(true)} disabled={loadingMore} variant="outline" size="lg">
                                        {loadingMore ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Загрузить ещё'}
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="holographic-panel rounded-xl text-center py-16">
                            <MessageSquare className="mx-auto h-12 w-12 text-text-muted mb-4"/>
                            <h3 className="text-xl font-semibold text-white">Публикаций не найдено</h3>
                            <p className="text-text-secondary mt-2">
                                {feedType === 'following' ? 'Подпишитесь на авторов, чтобы видеть их посты здесь.' : 'Попробуйте изменить фильтры или стать первым автором!'}
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
