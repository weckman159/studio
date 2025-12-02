
'use client';

import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, getDocs, startAfter, where, Query } from 'firebase/firestore';
import { useFirestore, useUser } from "@/firebase";
import { PostCard } from "@/components/PostCard";
import { Post } from "@/lib/types";
import { useInView } from 'react-intersection-observer'; // Импорт
import { Loader2 } from "lucide-react";
import { CarOfTheDay } from "@/components/CarOfTheDay";
import { PostFilters } from "@/components/PostFilters";
import { AutoNewsWidget } from "@/components/AutoNewsWidget";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [activeType, setActiveType] = useState('Все');
  const firestore = useFirestore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [lastDoc, setLastDoc] = useState<any>(null); // Курсор для пагинации
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  // Хук для отслеживания прокрутки до низа
  const { ref, inView } = useInView();

  // Первая загрузка
  useEffect(() => {
    if (!firestore) return;
    
    const loadInitial = async () => {
      setLoading(true);
      setHasMore(true);
      let q: Query = query(collection(firestore, 'posts'), orderBy('createdAt', 'desc'), limit(10));
      if (activeType !== 'Все') {
        q = query(q, where('category', '==', activeType));
      }
      const snap = await getDocs(q);
      
      const newPosts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      setPosts(newPosts);
      setLastDoc(snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null);
      if (snap.empty || snap.docs.length < 10) {
        setHasMore(false);
      }
      setLoading(false);
    };

    loadInitial();
  }, [firestore, activeType]);

  // Загрузка следующих постов
  const loadMore = async () => {
    if (!firestore || !lastDoc || loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    let q: Query = query(
        collection(firestore, 'posts'), 
        orderBy('createdAt', 'desc'), 
        startAfter(lastDoc), 
        limit(10)
    );
    if (activeType !== 'Все') {
      q = query(q, where('category', '==', activeType));
    }
    const snap = await getDocs(q);

    if (snap.empty) {
        setHasMore(false);
    } else {
        const newPosts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
        setPosts(prev => [...prev, ...newPosts]); // Добавляем к старым
        setLastDoc(snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null);
        if (snap.docs.length < 10) {
            setHasMore(false);
        }
    }
    setLoadingMore(false);
  };

  // Триггер при прокрутке
  useEffect(() => {
    if (inView) {
      loadMore();
    }
  }, [inView]);

  return (
    <div className="flex justify-center gap-8 md:pt-4">
       {/* Main Feed Column - Max Width like Instagram */}
      <div className="w-full max-w-[470px] flex flex-col">
        
        {/* Stories / Cars Bar */}
        <CarOfTheDay />
        
        {/* Filters (Optional, maybe hide for pure Insta feel) */}
        <div className="mb-4 px-4 md:px-0">
             <PostFilters activeType={activeType} onTypeChange={setActiveType} searchQuery="" onSearchChange={()=>{}} />
        </div>

        {/* Posts Feed */}
        <div className="flex flex-col gap-4">
          {loading ? (
            [1, 2, 3].map(i => <Skeleton key={i} className="h-[500px] w-full rounded-sm" />)
          ) : (
            posts.map(post => <PostCard key={post.id} post={post} />)
          )}
          {posts.length === 0 && !loading && <div className="p-10 text-center text-muted-foreground">Постов пока нет</div>}
          
          {/* Элемент-невидимка для триггера загрузки */}
          {!loading && hasMore && (
              <div ref={ref} className="flex justify-center p-4">
                  <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
              </div>
          )}
          {!loading && !hasMore && posts.length > 0 && <p className="text-center text-muted-foreground py-4">Вы посмотрели всё 🎉</p>}
        </div>
      </div>

      {/* Right Sidebar (Suggestions) - Hidden on mobile */}
      <div className="hidden lg:block w-[320px] pl-8">
        <div className="sticky top-24">
             {/* Здесь можно добавить блок "Рекомендации для вас" */}
             <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-muted-foreground">Рекомендации для вас</span>
                <button className="text-xs font-semibold text-primary">Все</button>
             </div>
             {/* Widget News */}
             <AutoNewsWidget />
             
             <div className="mt-8 text-xs text-muted-foreground/50">
                © 2025 AUTOSPHERE FROM META (JK)
             </div>
        </div>
      </div>
    </div>
  );
}
