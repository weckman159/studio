// src/app/marketplace/page.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, query, orderBy, getDocs, where, limit, type Query, type DocumentData, type DocumentSnapshot, startAfter } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Loader2, ShoppingCart } from 'lucide-react';
import { MarketplaceItem } from '@/lib/types';
import { serializeFirestoreData } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';
import { MarketplaceFilters } from '@/components/MarketplaceFilters';
import { MarketplaceItemCard } from '@/components/MarketplaceItemCard';

const ITEMS_PER_PAGE = 12;

function MarketplaceSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
                <div key={i} className="holographic-panel rounded-xl animate-pulse">
                    <div className="aspect-square w-full bg-surface/50 rounded-t-xl"></div>
                    <div className="p-4 space-y-3">
                        <div className="h-5 w-3/4 bg-surface/50 rounded"></div>
                        <div className="h-8 w-1/2 bg-surface/50 rounded"></div>
                        <div className="h-4 w-1/4 bg-surface/50 rounded"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function MarketplaceGrid() {
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // --- Получение и дебаунсинг параметров из URL ---
  const searchQuery = searchParams.get('q') || '';
  const debouncedQuery = useDebounce(searchQuery, 300);
  const brand = searchParams.get('brand') || '';
  const model = searchParams.get('model') || '';
  const priceFrom = searchParams.get('priceFrom');
  const priceTo = searchParams.get('priceTo');
  const yearFrom = searchParams.get('yearFrom');
  const sortBy = searchParams.get('sortBy') || 'createdAt_desc';

  const buildQuery = useCallback((forLoadMore = false) => {
    if (!firestore) return null;

    let q: Query<DocumentData> = collection(firestore, 'marketplace');
    
    // Фильтрация
    if (brand) q = query(q, where('brand', '==', brand));
    if (model) q = query(q, where('model', '==', model));
    if (priceFrom) q = query(q, where('price', '>=', Number(priceFrom)));
    if (priceTo) q = query(q, where('price', '<=', Number(priceTo)));
    if (yearFrom) q = query(q, where('year', '>=', Number(yearFrom)));
    if (debouncedQuery) q = query(q, where('title', '>=', debouncedQuery), where('title', '<=', debouncedQuery + '\uf8ff'));

    // Сортировка
    if (sortBy === 'price_asc') q = query(q, orderBy('price', 'asc'));
    else if (sortBy === 'price_desc') q = query(q, orderBy('price', 'desc'));
    else q = query(q, orderBy('createdAt', 'desc'));

    q = query(q, limit(ITEMS_PER_PAGE));

    if (forLoadMore && lastVisible) {
      q = query(q, startAfter(lastVisible));
    }
    
    return q;
  }, [firestore, brand, model, priceFrom, priceTo, yearFrom, sortBy, debouncedQuery, lastVisible]);
  
  const fetchItems = useCallback(async (loadMore = false) => {
    const q = buildQuery(loadMore);
    if (!q) return;

    const loader = loadMore ? setLoadingMore : setLoading;
    loader(true);

    try {
        const snapshot = await getDocs(q);
        const newItems = snapshot.docs.map(doc => serializeFirestoreData({ id: doc.id, ...doc.data() }) as MarketplaceItem);
        
        setItems(prev => loadMore ? [...prev, ...newItems] : newItems);
        
        const lastDoc = snapshot.docs[snapshot.docs.length - 1];
        setLastVisible(lastDoc || null);
        setHasMore(snapshot.docs.length === ITEMS_PER_PAGE);

    } catch (error) {
        console.error("Ошибка загрузки объявлений:", error);
    } finally {
        loader(false);
    }
  }, [buildQuery]);

  // Эффект для перезагрузки данных при смене фильтров
  useEffect(() => {
    setLastVisible(null); // Сбрасываем пагинацию при смене фильтров
    fetchItems(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brand, model, priceFrom, priceTo, yearFrom, sortBy, debouncedQuery]); // Нет `fetchItems` в зависимостях, чтобы избежать лишних перезагрузок

  return (
    <div className="space-y-8">
      {loading ? <MarketplaceSkeleton /> : (
          items.length === 0 ? (
            <div className="text-center py-12 holographic-panel rounded-xl">
              <ShoppingCart className="mx-auto h-16 w-16 text-text-muted mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-white">Объявления не найдены</h3>
              <p className="text-text-secondary">Попробуйте изменить параметры поиска.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map(item => <MarketplaceItemCard key={item.id} item={item} />)}
            </div>
          )
      )}
      {hasMore && !loading && (
          <div className="flex justify-center">
              <Button onClick={() => fetchItems(true)} disabled={loadingMore} variant="outline" size="lg">
                  {loadingMore ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Загрузить ещё'}
              </Button>
          </div>
      )}
    </div>
  );
}

export default function MarketplacePage() {
    return (
        <div className="p-4 md:p-8">
             <Suspense fallback={<MarketplaceSkeleton />}>
                <MarketplaceFilters />
                <MarketplaceGrid />
            </Suspense>
        </div>
    );
}
