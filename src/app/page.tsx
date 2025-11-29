
'use client';

import { PostCard } from "@/components/PostCard";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy, where, limit, Query, getDocs } from 'firebase/firestore';
import type { Post } from '@/lib/data';
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { CarOfTheDay } from "@/components/CarOfTheDay";
import { PostFilters } from "@/components/PostFilters";
import { AutoNewsWidget } from "@/components/AutoNewsWidget";
import { MessageCircle } from "lucide-react";

function PostFeed({ posts, loading }: { posts: Post[], loading?: boolean }) {
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
          <h3 className="text-xl font-semibold mb-2">Постов пока нет</h3>
          <p className="text-muted-foreground">
            Попробуйте изменить фильтры или стать первым автором!
          </p>
        </div>
      );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}


export default function Home() {
  const [activeType, setActiveType] = useState('Все');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedType, setFeedType] = useState<'global' | 'following'>('global');
  const firestore = useFirestore();
  const { user } = useUser();

  const [feedPosts, setFeedPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);


  // Global Feed Query
  const globalPostsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    let q: Query = query(collection(firestore, 'posts'), orderBy('createdAt', 'desc'), limit(20));
    if (activeType !== 'Все') {
      q = query(q, where('category', '==', activeType));
    }
    return q;
  }, [firestore, activeType]);

  const { data: globalPosts, isLoading: globalLoading } = useCollection<Post>(globalPostsQuery);

  // Fetch Following Feed
  useEffect(() => {
    const fetchFollowingFeed = async () => {
      if (feedType !== 'following' || !user || !firestore) {
         if(feedType === 'following' || !user) setIsLoading(false);
         return;
      };
      
      setIsLoading(true);
      try {
        // This query now requires an index: users(userId asc, feed asc)
        const feedRef = collection(firestore, 'users', user.uid, 'feed');
        const q = query(feedRef, orderBy('createdAt', 'desc'), limit(50));
        const feedSnapshot = await getDocs(q);
        
        if (feedSnapshot.empty) {
          setFeedPosts([]);
          setIsLoading(false);
          return;
        }

        const postIds = feedSnapshot.docs.map(doc => doc.data().postId);
        
        if (postIds.length === 0) {
            setFeedPosts([]);
            setIsLoading(false);
            return;
        }

        const postPromises = [];
        for (let i = 0; i < postIds.length; i += 30) {
            const chunk = postIds.slice(i, i + 30);
            if(chunk.length > 0) {
                const postsQuery = query(collection(firestore, 'posts'), where('id', 'in', chunk));
                postPromises.push(getDocs(postsQuery));
            }
        }
        
        const postSnapshots = await Promise.all(postPromises);
        const posts: Post[] = [];
        postSnapshots.forEach(snap => {
            snap.forEach(doc => posts.push({ id: doc.id, ...doc.data() } as Post));
        });
        
        posts.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());

        setFeedPosts(posts);

      } catch (e) {
        console.error("Error fetching following feed: ", e);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
        fetchFollowingFeed();
    } else {
        // If user logs out, switch to global feed
        setFeedType('global');
    }
  }, [feedType, user, firestore]);
  
  const postsToDisplay = (feedType === 'following' && user) ? feedPosts : (globalPosts || []);
  const currentLoading = (feedType === 'following' && user) ? isLoading : globalLoading;
  
  const filteredPosts = postsToDisplay.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (post.content || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-8">
      <div className="space-y-8">
        <PostFilters 
          activeType={activeType}
          onTypeChange={setActiveType}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          feedType={feedType}
          onFeedTypeChange={setFeedType}
          showFeedToggle={!!user}
        />
        <div>
          <h1 className="text-3xl font-bold mb-6">
            {feedType === 'following' && user ? 'Лента подписок' : 'Глобальная лента'}
          </h1>
          <PostFeed posts={filteredPosts || []} loading={currentLoading} />
        </div>
      </div>
       <div className="hidden xl:block space-y-8">
          <CarOfTheDay />
          <AutoNewsWidget />
        </div>
    </div>
  );
}
