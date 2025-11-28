
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, MessageCircle } from 'lucide-react';
import type { Post as PostData } from '@/lib/data';
import { PostCard } from '@/components/PostCard';
import { Skeleton } from '@/components/ui/skeleton';
import { PostFilters } from '@/components/PostFilters';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, where, limit, Query, getDocs } from 'firebase/firestore';


function PostFeed({ posts, loading }: { posts: PostData[], loading?: boolean }) {
  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="border rounded-xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="aspect-video w-full rounded-lg" />
          </div>
        ))}
      </div>
    )
  }
  
  if (posts.length === 0) {
      return (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <MessageCircle className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Постов нет</h3>
          <p className="text-muted-foreground mb-6">
            Попробуйте изменить фильтры или создайте первый пост!
          </p>
        </div>
      );
  }

  return (
    <div className="space-y-6">
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}

export default function PostsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('Все');
  const [feedType, setFeedType] = useState<'global' | 'following'>('global');
  const firestore = useFirestore();
  const { user } = useUser();
  const [feedPosts, setFeedPosts] = useState<PostData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Global Feed Query
  const globalPostsQuery = useMemoFirebase(() => {
    if (!firestore || feedType !== 'global') return null;
    let q: Query = query(collection(firestore, 'posts'), orderBy('createdAt', 'desc'));
    if (selectedType !== 'Все') {
      q = query(q, where('category', '==', selectedType));
    }
    return q;
  }, [firestore, selectedType, feedType]);

  const { data: globalPosts, isLoading: globalLoading } = useCollection<PostData>(globalPostsQuery);

  // Fetch Following Feed
  useEffect(() => {
    const fetchFollowingFeed = async () => {
      if (feedType !== 'following' || !user || !firestore) {
         if(feedType === 'following') setIsLoading(false);
         return;
      };
      
      setIsLoading(true);
      try {
        const feedRef = collection(firestore, 'users', user.uid, 'feed');
        const q = query(feedRef, orderBy('createdAt', 'desc'), limit(50));
        const feedSnapshot = await getDocs(q);
        
        if (feedSnapshot.empty) {
          setFeedPosts([]);
          setIsLoading(false);
          return;
        }

        const postIds = feedSnapshot.docs.map(doc => doc.data().postId);
        
        // Firestore 'in' query is limited to 30 items
        const postPromises = [];
        for (let i = 0; i < postIds.length; i += 30) {
            const chunk = postIds.slice(i, i + 30);
            if(chunk.length > 0) {
                const postsQuery = query(collection(firestore, 'posts'), where('id', 'in', chunk));
                postPromises.push(getDocs(postsQuery));
            }
        }
        
        const postSnapshots = await Promise.all(postPromises);
        const posts: PostData[] = [];
        postSnapshots.forEach(snap => {
            snap.forEach(doc => posts.push({ id: doc.id, ...doc.data() } as PostData));
        });
        
        // Sort by createdAt descending as 'in' query doesn't guarantee order
        posts.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());

        setFeedPosts(posts);

      } catch (e) {
        console.error("Error fetching following feed: ", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFollowingFeed();
  }, [feedType, user, firestore]);
  
  const postsToDisplay = feedType === 'following' ? feedPosts : (globalPosts || []);
  const currentLoading = feedType === 'following' ? isLoading : globalLoading;

  const filteredPosts = postsToDisplay.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.content || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div>
      {/* Хедер и создание */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Посты пользователей</h1>
          <p className="text-muted-foreground">
            Делитесь опытом, обсуждениями, вопросами и фотоотчётами
          </p>
        </div>
        <Link href="/posts/create">
          <Button size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Создать пост
          </Button>
        </Link>
      </div>
      {/* Поиск/фильтр */}
      <div className="mb-8">
        <PostFilters
          activeType={selectedType}
          onTypeChange={setSelectedType}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          feedType={feedType}
          onFeedTypeChange={setFeedType}
          showFeedToggle={!!user}
        />
      </div>
      
      {/* Лента постов */}
      <PostFeed posts={filteredPosts || []} loading={currentLoading} />
    </div>
  );
}
