
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { collection, query, getDocs, orderBy, where, limit, QueryDocumentSnapshot, DocumentSnapshot, startAfter } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { PostCard } from '@/components/PostCard';
import { PostFilters } from '@/components/PostFilters';
import { Post, User, AutoNews } from '@/lib/types';
import { serializeFirestoreData } from '@/lib/utils';
import { MessageSquare, Star } from 'lucide-react';
import Link from 'next/link';

// Import new reusable widgets
import { TopUsersWidget } from '@/components/TopUsersWidget';
import { AutoNewsWidget } from '@/components/AutoNewsWidget';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

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


// --- MAIN PAGE COMPONENT ---
export default function PostsPage() {
    const firestore = useFirestore();
    const { user } = useUser();
    
    // States for data
    const [posts, setPosts] = useState<Post[]>([]);
    const [popularPosts, setPopularPosts] = useState<Post[]>([]);
    const [topAuthors, setTopAuthors] = useState<User[]>([]);
    const [latestNews, setLatestNews] = useState<AutoNews[]>([]);
    
    // States for loading and pagination
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [lastVisible, setLastVisible] = useState<DocumentSnapshot | null>(null);
    const [hasMore, setHasMore] = useState(true);
    
    // States for filters
    const [activeCategory, setActiveCategory] = useState('Все');
    const [searchQuery, setSearchQuery] = useState('');
    const [feedType, setFeedType] = useState<'global' | 'following'>('global');

    const fetchPosts = useCallback(async (loadMore = false) => {
        if (!firestore) return;
        
        const currentLoadingStateSetter = loadMore ? setLoadingMore : setLoading;
        currentLoadingStateSetter(true);

        if (!loadMore) {
            setPosts([]);
            setLastVisible(null);
            setHasMore(true);
        }

        try {
            let postsQuery;
            if (feedType === 'following' && user) {
                const followingRef = collection(firestore, 'users', user.uid, 'following');
                const followingSnap = await getDocs(followingRef);
                const followingIds = followingSnap.docs.map(doc => doc.id);

                if (followingIds.length > 0) {
                    postsQuery = query(collection(firestore, 'posts'), where('authorId', 'in', followingIds), orderBy('createdAt', 'desc'));
                } else {
                    setPosts([]);
                    setHasMore(false);
                    currentLoadingStateSetter(false);
                    return;
                }
            } else {
                postsQuery = query(collection(firestore, 'posts'), orderBy('createdAt', 'desc'));
            }

            if (activeCategory !== 'Все') {
                postsQuery = query(postsQuery, where('category', '==', activeCategory));
            }
            
            postsQuery = query(postsQuery, limit(POSTS_PER_PAGE));

            if (loadMore && lastVisible) {
                postsQuery = query(postsQuery, startAfter(lastVisible));
            }

            const postsSnap = await getDocs(postsQuery);
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
            currentLoadingStateSetter(false);
        }
    }, [firestore, activeCategory, feedType, user, lastVisible]);
    
    useEffect(() => {
        const fetchInitialData = async () => {
             if (!firestore) return;
             try {
                const topAuthorsQuery = query(collection(firestore, 'users'), orderBy('stats.postsCount', 'desc'), limit(3));
                const latestNewsQuery = query(collection(firestore, 'autoNews'), orderBy('publishedAt', 'desc'), limit(3));
                const popularPostsQuery = query(collection(firestore, 'posts'), orderBy('likesCount', 'desc'), limit(4));
                
                const [authorsSnap, newsSnap, popularSnap] = await Promise.all([
                    getDocs(topAuthorsQuery),
                    getDocs(latestNewsQuery),
                    getDocs(popularPostsQuery)
                ]);

                setTopAuthors(authorsSnap.docs.map((doc: QueryDocumentSnapshot) => serializeFirestoreData({ id: doc.id, ...doc.data() }) as User));
                setLatestNews(newsSnap.docs.map((doc: QueryDocumentSnapshot) => serializeFirestoreData({ id: doc.id, ...doc.data() }) as AutoNews));
                setPopularPosts(popularSnap.docs.map((doc: QueryDocumentSnapshot) => serializeFirestoreData({ id: doc.id, ...doc.data() }) as Post));
             } catch(error) {
                 console.error("Error fetching widget data:", error)
             }
        }
        fetchInitialData();
    }, [firestore]);

    useEffect(() => {
        fetchPosts(false);
    }, [activeCategory, feedType, fetchPosts]);


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
                             {hasMore && !loading && (
                                <div className="flex justify-center mt-8">
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
                                {feedType === 'following' ? 'Подпишитесь на авторов, чтобы видеть их посты здесь.' : 'Попробуйте изменить фильтры или стать первым автором!'}
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
                    <TopUsersWidget topAuthors={topAuthors} loading={loading && topAuthors.length === 0} />
                    <AutoNewsWidget news={latestNews} loading={loading && latestNews.length === 0} />
                </aside>
            </div>
        </div>
    );
}
