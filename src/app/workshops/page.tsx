
'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, where, limit } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Wrench, MapPin, Star, MessageSquare, Plus } from 'lucide-react';
import Image from 'next/image';

// Интерфейс мастерской
interface Workshop {
  id: string;
  name: string;
  address: string;
  city: string;
  specialization: string;
  rating: number;
  reviewsCount: number;
  imageUrl?: string;
}

// Города для фильтрации
const CITIES = ['Все города', 'Москва', 'Санкт-Петербург', 'Казань'];

export default function WorkshopsPage() {
  const firestore = useFirestore();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [filteredWorkshops, setFilteredWorkshops] = useState<Workshop[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('Все города');
  const [loading, setLoading] = useState(true);

  // Загрузка мастерских из Firestore
  useEffect(() => {
    if (firestore) {
      fetchWorkshops();
    }
  }, [firestore]);

  const fetchWorkshops = async () => {
    if (!firestore) return;
    try {
      setLoading(true);
      const q = query(
        collection(firestore, 'workshops'),
        orderBy('rating', 'desc'),
        limit(50)
      );
      const querySnapshot = await getDocs(q);
      const data: Workshop[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Workshop));
      setWorkshops(data);
      setFilteredWorkshops(data);
    } catch (e) {
      console.error('Ошибка загрузки мастерских:', e);
    } finally {
      setLoading(false);
    }
  };

  // Фильтрация
  useEffect(() => {
    let result = [...workshops];

    if (selectedCity !== 'Все города') {
      result = result.filter(w => w.city === selectedCity);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(w =>
        w.name.toLowerCase().includes(q) ||
        w.address.toLowerCase().includes(q)
      );
    }
    setFilteredWorkshops(result);
  }, [workshops, selectedCity, searchQuery]);

  // UI загрузки
  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Загрузка мастерских...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Хедер */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
            <h1 className="text-4xl font-bold mb-2">Мастерские</h1>
            <p className="text-muted-foreground">
                Найдите проверенный автосервис в вашем городе
            </p>
        </div>
        <Link href="/workshops/create">
            <Button size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Добавить мастерскую
            </Button>
        </Link>
      </div>


      {/* Поиск и фильтры */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            type="text"
            placeholder="Поиск по названию или адресу..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 h-12"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {CITIES.map(city => (
            <Button
              key={city}
              variant={selectedCity === city ? 'default' : 'outline'}
              onClick={() => setSelectedCity(city)}
              size="sm"
            >
              {city}
            </Button>
          ))}
        </div>
      </div>

      {/* Список мастерских */}
      {filteredWorkshops.length === 0 ? (
        <div className="text-center py-12">
          <Wrench className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Мастерские не найдены</h3>
          <p className="text-muted-foreground">
            Попробуйте изменить параметры поиска или выберите другой город
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredWorkshops.map(ws => (
            <Link key={ws.id} href={`/workshops/${ws.id}`}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
                  {ws.imageUrl ? (
                    <div className="relative w-full sm:w-48 h-40 sm:h-auto flex-shrink-0">
                      <Image
                        src={ws.imageUrl}
                        alt={ws.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                  ) : (
                    <div className="w-full sm:w-48 h-40 sm:h-auto flex-shrink-0 bg-muted rounded-md flex items-center justify-center">
                      <Wrench className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Badge variant="secondary" className="mb-2">{ws.specialization}</Badge>
                    <h3 className="text-xl font-bold">{ws.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-4 w-4" />
                      {ws.address}
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                        <span className="font-bold">{ws.rating.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MessageSquare className="h-4 w-4" />
                        <span>{ws.reviewsCount} отзывов</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
