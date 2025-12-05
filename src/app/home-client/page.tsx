'use client';

import { useState, useEffect } from 'react';
import { PostCard } from '@/components/PostCard';
import { Car } from 'lucide-react';
import type { Post } from '@/lib/types';
import { PostFilters } from '@/components/PostFilters';
import { AutoNewsWidget } from '@/components/AutoNewsWidget';
import { CarOfTheDay } from '@/components/CarOfTheDay';
import { useFirestore } from '@/firebase';
import { serializeFirestoreData } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default function HomeClientPage() {
  const firestore = useFirestore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [activeType, setActiveType] = useState('Все');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Load posts
  useEffect(() => {
    const loadPosts = async () => {
      if (!firestore) return;
      
      try {
        setLoading(true);
        // Using client-side Firestore for interactivity
        const { collection, query, orderBy, limit, getDocs } = await import('firebase/firestore');
        const postsRef = collection(firestore, 'posts');
        const postsQuery = query(postsRef, orderBy('createdAt', 'desc'), limit(20));
        const snapshot = await getDocs(postsQuery);
        
        const loadedPosts = snapshot.docs.map((doc: any) => serializeFirestoreData({
          id: doc.id,
          ...doc.data()
        } as Post));
        
        setPosts(loadedPosts);
        setFilteredPosts(loadedPosts);
      } catch (error) {
        console.error('Error loading posts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [firestore]);

  // Filter posts
  useEffect(() => {
    let result = posts;
    
    // Filter by type
    if (activeType !== 'Все') {
      result = result.filter((post: Post) => post.type === activeType);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((post: Post) => 
        post.title?.toLowerCase().includes(query) || 
        post.content?.toLowerCase().includes(query)
      );
    }
    
    setFilteredPosts(result);
  }, [posts, activeType, searchQuery]);

  if (loading) {
    return (
      <div className="flex justify-center gap-8 md:pt-4">
        <div className="w-full max-w-[640px] flex flex-col">
          <div className="mb-6 px-2">
            <div className="h-32 bg-muted rounded-xl animate-pulse" />
          </div>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
        <div className="hidden xl:block w-[350px] pl-4">
          <div className="sticky top-24 space-y-6">
            <div className="h-96 bg-muted rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center gap-8 md:pt-4">
      <div className="w-full max-w-[640px] flex flex-col">
        
        <CarOfTheDay />
        
        <div className="mb-6 px-2">
          <PostFilters 
            activeType={activeType} 
            onTypeChange={setActiveType} 
            searchQuery={searchQuery} 
            onSearchChange={setSearchQuery} 
            feedType={'global'}
            showFeedToggle={false}
          />
        </div>

        <div className="flex flex-col gap-6">
          {filteredPosts.length > 0 ? (
            filteredPosts.map(post => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="text-center py-20 border-2 border-dashed rounded-xl">
              <Car className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Постов не найдено</h3>
              <p className="text-muted-foreground">Попробуйте изменить фильтры</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar (Desktop) */}
      <div className="hidden xl:block w-[350px] pl-4">
        <div className="sticky top-24 space-y-6">
          <AutoNewsWidget />
          
          <div className="text-xs text-muted-foreground/50 text-center">
            AutoSphere © 2025 <br/> Сделано автолюбителями для автолюбителей
          </div>
        </div>
      </div>
    </div>
  );
}