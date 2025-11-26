// src/app/marketplace/page.tsx
// Главная страница маркетплейса с автозапчастями, аксессуарами, автомобилями
// Поиск, фильтрация по категориям, сортировка по цене
// Gemini: это торговая площадка для автолюбителей

'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, ShoppingCart, MapPin } from 'lucide-react';

// Интерфейс товара
// Gemini: структура объявления на маркетплейсе
interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string; // например: RUB, EUR
  category: string;
  condition: string; // новое, б/у, отличное и т.д.
  location: string; // город продавца
  imageUrl?: string;
  sellerId: string;
  sellerName: string;
  createdAt: any;
}

export default function MarketplacePage() {
  const firestore = useFirestore();
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MarketplaceItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date'); // date, price-asc, price-desc
  const [loading, setLoading] = useState(true);

  // Категории товаров
  // Gemini: предустановленные категории для фильтрации
  const categories = [
    'all',
    'Запчасти',
    'Аксессуары',
    'Шины и диски',
    'Электроника',
    'Тюнинг',
    'Автомобили',
    'Инструменты',
    'Другое'
  ];

  // Загрузка товаров при монтировании
  useEffect(() => {
    if (firestore) {
        fetchItems();
    }
  }, [firestore]);

  // Функция загрузки товаров из Firestore
  // Gemini: получаем все объявления, сортируем по дате создания (новые первыми)
  const fetchItems = async () => {
    if (!firestore) return;
    try {
      setLoading(true);
      const q = query(
        collection(firestore, 'marketplace'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const itemsData: MarketplaceItem[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as MarketplaceItem));
      setItems(itemsData);
      setFilteredItems(itemsData);
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
    } finally {
      setLoading(false);
    }
  };

  // Фильтрация и сортировка
  // Gemini: применяем фильтры в реальном времени без запроса к БД
  useEffect(() => {
    let result = [...items];

    // Фильтр по категории
    if (selectedCategory !== 'all') {
      result = result.filter(item => item.category === selectedCategory);
    }

    // Поиск по названию и описанию
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    }

    // Сортировка
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else {
      // по умолчанию по дате (уже отсортировано)
    }

    setFilteredItems(result);
  }, [searchQuery, selectedCategory, sortBy, items]);

  // Форматирование цены
  const formatPrice = (price: number, currency: string) => {
    return `${price.toLocaleString('ru-RU')} ${currency === 'RUB' ? '₽' : currency}`;
  };

  // UI загрузки
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Загрузка товаров...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Заголовок */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Маркетплейс</h1>
          <p className="text-muted-foreground">
            Покупайте и продавайте автозапчасти, аксессуары и автомобили
          </p>
        </div>
        <Link href="/marketplace/create">
          <Button size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Разместить объявление
          </Button>
        </Link>
      </div>

      {/* Панель поиска и фильтров */}
      <div className="mb-8 space-y-4">
        {/* Поиск */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            type="text"
            placeholder="Поиск товаров..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 h-12"
          />
        </div>

        {/* Фильтры и сортировка */}
        <div className="flex flex-wrap gap-3">
          {/* Категории */}
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(cat)}
                size="sm"
              >
                {cat === 'all' ? 'Все категории' : cat}
              </Button>
            ))}
          </div>

          {/* Сортировка */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Сортировать" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">По дате</SelectItem>
              <SelectItem value="price-asc">Цена: по возрастанию</SelectItem>
              <SelectItem value="price-desc">Цена: по убыванию</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Список товаров */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Товары не найдены</h3>
          <p className="text-muted-foreground mb-6">
            Попробуйте изменить параметры поиска или разместите первое объявление
          </p>
          <Link href="/marketplace/create">
            <Button>
              <Plus className="mr-2 h-5 w-5" />
              Разместить объявление
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Счетчик результатов */}
          <div className="mb-4 text-sm text-muted-foreground">
            Найдено: {filteredItems.length} {filteredItems.length === 1 ? 'товар' : 'товаров'}
          </div>

          {/* Сетка карточек */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map(item => (
              <Link key={item.id} href={`/marketplace/${item.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer flex flex-col">
                  {/* Изображение товара */}
                  <div className="relative aspect-square w-full overflow-hidden rounded-t-lg">
                  {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                  ) : (
                    <div className="bg-muted h-full flex items-center justify-center">
                      <ShoppingCart className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                  </div>

                  <CardHeader className="flex-grow">
                    <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {item.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-2">
                      {/* Цена */}
                      <div className="text-2xl font-bold text-primary">
                        {formatPrice(item.price, item.currency)}
                      </div>

                      {/* Категория и состояние */}
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="outline">{item.category}</Badge>
                        <Badge variant="secondary">{item.condition}</Badge>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{item.location}</span>
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
