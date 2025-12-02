'use client';

import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, getDocs, startAfter, where, DocumentSnapshot } from 'firebase/firestore';
import { useFirestore, useUser } from "@/firebase";
import { PostCard } from "@/components/PostCard";
import { Post } from "@/lib/types";
import { useInView } from 'react-intersection-observer';
import { Loader2, AlertCircle } from "lucide-react";
import { CarOfTheDay } from "@/components/CarOfTheDay";
import { PostFilters } from "@/components/PostFilters";
import { AutoNewsWidget } from "@/components/AutoNewsWidget";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const firestore = useFirestore();
  const { user } = useUser();
  
  // State
  const [posts, setPosts] = useState<Post[]>([]);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  // Filters
  const [activeType, setActiveType] = useState('Все');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedType, setFeedType] = useState<'global' | 'following'>('global');

  // Infinite Scroll Trigger
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '100px', // Начинаем грузить за 100px до конца
  });

  // 1. Первичная загрузка (при смене фильтров)
  useEffect(() => {
    if (!firestore) return;
    
    const loadInitial = async () => {
      setLoading(true);
      setHasMore(true);
      setLastDoc(null);
      setPosts([]); // Очищаем старые посты

      try {
        let q;
        
        if (feedType === 'following' && user) {
            // Логика для подписок (требует индекса!)
            // Упрощенно: берем коллекцию feed пользователя
            const feedRef = collection(firestore, 'users', user.uid, 'feed');
            q = query(feedRef, orderBy('createdAt', 'desc'), limit(10));
            
            // Примечание: Здесь нужно будет догружать сами посты по ID, 
            // для MVP пока оставим глобальную ленту как основную, 
            // так как лента подписок требует сложной логики (batch get).
            // Переключаем на глобальную для стабильности если нет логики batch:
            // setFeedType('global'); 
            // return;
        } 
        
        // Глобальная лента
        const postsRef = collection(firestore, 'posts');
        
        if (activeType !== 'Все') {
            q = query(postsRef, where('category', '==', activeType), orderBy('createdAt', 'desc'), limit(10));
        } else {
            q = query(postsRef, orderBy('createdAt', 'desc'), limit(10));
        }

        const snap = await getDocs(q);
        
        if (feedType === 'following' && user) {
             // Если это лента подписок, нам нужно получить сами посты
             // (Этот код сработает, только если вы реализовали Cloud Function onPostCreated из прошлого шага)
             const postIds = snap.docs.map(d => d.data().postId);
             if(postIds.length > 0) {
                 // Firestore 'in' query limits to 10 (or 30 depending on usage)
                 const postsQ = query(postsRef, where('id', 'in', postIds.slice(0, 10)));
                 const postsSnap = await getDocs(postsQ);
                 const loadedPosts = postsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Post));
                 // Сортируем обратно по дате, т.к. 'in' ломает порядок
                 loadedPosts.sort((a,b) => b.createdAt?.seconds - a.createdAt?.seconds);
                 setPosts(loadedPosts);
             } else {
                 setPosts([]);
             }
        } else {
             // Обычная лента
             const loadedPosts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
             setPosts(loadedPosts);
             setLastDoc(snap.docs[snap.docs.length - 1]);
             if (snap.size < 10) setHasMore(false);
        }

      } catch (error) {
        console.error("Error loading posts:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInitial();
  }, [firestore, activeType, feedType, user]);


  // 2. Подгрузка (Infinite Scroll)
  const loadMore = async () => {
    if (!firestore || !lastDoc || loadingMore || !hasMore || feedType === 'following') return;
    
    setLoadingMore(true);
    try {
        const postsRef = collection(firestore, 'posts');
        let q;

        if (activeType !== 'Все') {
            q = query(
                postsRef, 
                where('category', '==', activeType), 
                orderBy('createdAt', 'desc'), 
                startAfter(lastDoc), 
                limit(10)
            );
        } else {
            q = query(
                postsRef, 
                orderBy('createdAt', 'desc'), 
                startAfter(lastDoc), 
                limit(10)
            );
        }

        const snap = await getDocs(q);

        if (snap.empty) {
            setHasMore(false);
        } else {
            const newPosts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
            setPosts(prev => [...prev, ...newPosts]);
            setLastDoc(snap.docs[snap.docs.length - 1]);
            if (snap.size < 10) setHasMore(false);
        }
    } catch (error) {
        console.error("Error loading more:", error);
    } finally {
        setLoadingMore(false);
    }
  };

  // Триггер прокрутки
  useEffect(() => {
    if (inView) {
      loadMore();
    }
  }, [inView]);

  // Фильтрация поиском (Client side для уже загруженных)
  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex justify-center gap-8 md:pt-4">
      <div className="w-full max-w-[470px] flex flex-col">
        
        <CarOfTheDay />
        
        <div className="mb-6 px-2">
             <PostFilters 
                activeType={activeType} 
                onTypeChange={setActiveType} 
                searchQuery={searchQuery} 
                onSearchChange={setSearchQuery} 
                feedType={feedType}
                onFeedTypeChange={setFeedType}
                showFeedToggle={!!user}
             />
        </div>

        <div className="flex flex-col gap-6">
          {loading ? (
            // Skeletons
            [1, 2, 3].map(i => (
                <div key={i} className="bg-background rounded-xl border h-[400px] animate-pulse p-4">
                    <div className="flex gap-3 mb-4">
                        <div className="w-10 h-10 bg-muted rounded-full" />
                        <div className="space-y-2">
                            <div className="w-32 h-4 bg-muted rounded" />
                            <div className="w-20 h-3 bg-muted rounded" />
                        </div>
                    </div>
                    <div className="w-full h-[250px] bg-muted rounded" />
                </div>
            ))
          ) : filteredPosts.length === 0 ? (
             <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    {feedType === 'following' 
                        ? "В ваших подписках пока пусто. Подпишитесь на кого-нибудь!" 
                        : "Постов по этому запросу не найдено."}
                </AlertDescription>
             </Alert>
          ) : (
            <>
                {filteredPosts.map(post => <PostCard key={post.id} post={post} />)}
                
                {/* Невидимый элемент для триггера загрузки */}
                {hasMore && feedType !== 'following' && (
                    <div ref={ref} className="flex justify-center py-6">
                        <Loader2 className="animate-spin h-8 w-8 text-muted-foreground/50" />
                    </div>
                )}
                
                {!hasMore && filteredPosts.length > 0 && (
                    <div className="text-center text-muted-foreground text-sm py-8 border-t mt-4">
                        🎉 Вы посмотрели всё! Время выйти на улицу.
                    </div>
                )}
            </>
          )}
        </div>
      </div>

      {/* Right Sidebar (Desktop) */}
      <div className="hidden lg:block w-[320px] pl-8">
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
