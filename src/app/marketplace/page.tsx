
'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, ShoppingCart, MapPin, Loader2 } from 'lucide-react';
import { MarketplaceItem } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const categories = ['all', 'Запчасти', 'Аксессуары', 'Шины и диски', 'Электроника', 'Тюнинг', 'Автомобили', 'Инструменты', 'Другое'];

function MarketplaceSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
                <Card key={i} className="holographic-panel">
                    <Skeleton className="aspect-square w-full" />
                    <CardHeader><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-1/2" /></CardHeader>
                    <CardContent><Skeleton className="h-8 w-2/4 mb-2" /><Skeleton className="h-5 w-1/4" /></CardContent>
                    <CardFooter><Skeleton className="h-4 w-full" /></CardFooter>
                </Card>
            ))}
        </div>
    );
}

export default function MarketplacePage() {
  const firestore = useFirestore();
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt_desc');

  useEffect(() => {
    if (firestore) {
        fetchItems();
    }
  }, [firestore]);

  const fetchItems = async () => {
    if (!firestore) return;
    try {
      setLoading(true);
      const q = query(collection(firestore, 'marketplace'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const itemsData: MarketplaceItem[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MarketplaceItem));
      setItems(itemsData);
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    let result = [...items];
    if (selectedCategory !== 'all') {
      result = result.filter(item => item.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q));
    }
    if (sortBy === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.price - a.price);
    } 
    return result;
  }, [searchQuery, selectedCategory, sortBy, items]);

  const formatPrice = (price: number, currency: string) => `${price.toLocaleString('ru-RU')} ${currency === 'RUB' ? '₽' : currency}`;

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-white">Маркетплейс</h1>
          <p className="text-text-secondary">Покупайте и продавайте автозапчасти, аксессуары и автомобили</p>
        </div>
        <Link href="/marketplace/create"><Button size="lg"><Plus className="mr-2 h-5 w-5" />Разместить объявление</Button></Link>
      </div>

      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted h-5 w-5" />
          <Input type="text" placeholder="Поиск товаров..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 h-12 bg-surface border-border"/>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => <Button key={cat} variant={selectedCategory === cat ? 'default' : 'outline'} onClick={() => setSelectedCategory(cat)} size="sm">{cat === 'all' ? 'Все категории' : cat}</Button>)}
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[200px] bg-surface border-border"><SelectValue placeholder="Сортировать" /></SelectTrigger>
            <SelectContent><SelectItem value="createdAt_desc">По дате</SelectItem><SelectItem value="price_asc">Цена: по возрастанию</SelectItem><SelectItem value="price_desc">Цена: по убыванию</SelectItem></SelectContent>
          </Select>
        </div>
      </div>

      {loading ? <MarketplaceSkeleton /> : (
          filteredItems.length === 0 ? (
            <div className="text-center py-12 holographic-panel rounded-xl">
              <ShoppingCart className="mx-auto h-16 w-16 text-text-muted mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-white">Товары не найдены</h3>
              <p className="text-text-secondary mb-6">Попробуйте изменить параметры поиска или разместите первое объявление</p>
              <Link href="/marketplace/create"><Button><Plus className="mr-2 h-5 w-5" />Разместить объявление</Button></Link>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-text-secondary">Найдено: {filteredItems.length} {filteredItems.length === 1 ? 'товар' : 'товаров'}</div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map(item => (
                  <Link key={item.id} href={`/marketplace/${item.id}`}>
                    <Card className="holographic-panel h-full hover:border-primary/50 transition-all cursor-pointer flex flex-col">
                      <div className="relative aspect-square w-full overflow-hidden">
                        {item.imageUrl ? <Image src={item.imageUrl} alt={item.title} fill className="object-cover"/> : <div className="bg-surface h-full flex items-center justify-center"><ShoppingCart className="h-16 w-16 text-text-muted" /></div>}
                      </div>
                      <CardHeader className="flex-grow"><CardTitle className="text-lg line-clamp-2 text-white">{item.title}</CardTitle><CardDescription className="line-clamp-2 text-text-secondary">{item.description}</CardDescription></CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="text-2xl font-bold text-primary">{formatPrice(item.price, item.currency)}</div>
                          <div className="flex gap-2 flex-wrap"><Badge variant="outline">{item.category}</Badge><Badge variant="secondary">{item.condition}</Badge></div>
                        </div>
                      </CardContent>
                      <CardFooter className="text-sm text-text-secondary"><div className="flex items-center gap-1"><MapPin className="h-4 w-4" /><span>{item.location}</span></div></CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            </>
          )
        )
      }
    </div>
  );
}
