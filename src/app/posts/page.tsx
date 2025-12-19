
'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { PostCard } from '@/components/PostCard';
import { PostFilters } from '@/components/PostFilters';
import { AutoNewsWidget } from '@/components/AutoNewsWidget';
import { TopUsersWidget } from '@/components/TopUsersWidget';
import { FeedLayout } from '@/components/posts/FeedLayout'; // This is now obsolete
import { Post } from '@/lib/types';
import { serializeFirestoreData } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare } from 'lucide-react';
import { useUser } from '@/firebase/provider';

function FeedSkeleton() {
    return (
        <div className="space-y-8">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="flex flex-col md:flex-row gap-6 p-4 border border-border rounded-xl holographic-panel">
                    <Skeleton className="w-full md:w-2/5 h-56 rounded-lg" />
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

export default function PostsPage() {
    const firestore = useFirestore();
    const { user } = useUser();
    const [posts, setPosts] = useState<Post[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Filter states
    const [activeCategory, setActiveCategory] = useState('Все');
    const [searchQuery, setSearchQuery] = useState('');
    const [feedType, setFeedType] = useState<'global' | 'following'>('global');

    useEffect(() => {
        const fetchPosts = async () => {
            if (!firestore) return;
            setLoading(true);
            try {
                const postsQuery = query(collection(firestore, 'posts'), orderBy('createdAt', 'desc'), limit(50));
                const snapshot = await getDocs(postsQuery);
                const postsData = snapshot.docs.map(doc => serializeFirestoreData({ id: doc.id, ...doc.data() }) as Post);
                setPosts(postsData);
            } catch (error) {
                console.error("Error fetching posts:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, [firestore]);

    useEffect(() => {
        let tempPosts = [...posts];

        if (feedType === 'following') {
            // Placeholder for following feed logic
            // In a real app, this would require fetching posts from users the current user follows
            // For now, we can simulate by filtering or showing a message
            tempPosts = []; // Or filter based on a list of followed user IDs
        }

        if (activeCategory !== 'Все') {
            tempPosts = tempPosts.filter(p => p.category === activeCategory);
        }

        if (searchQuery.trim()) {
            const lowercasedQuery = searchQuery.toLowerCase();
            tempPosts = tempPosts.filter(p => 
                p.title.toLowerCase().includes(lowercasedQuery) ||
                (p.content && p.content.toLowerCase().includes(lowercasedQuery))
            );
        }

        setFilteredPosts(tempPosts);
    }, [posts, activeCategory, searchQuery, feedType]);


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
                        filteredPosts.map(post => <PostCard key={post.id} post={post} />)
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
