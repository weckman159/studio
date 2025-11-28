// src/app/events/page.tsx
// Страница всех событий: список, поиск, фильтрация, создание нового
'use client';

import { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Search, Plus, MapPin, Users } from 'lucide-react';
import type { Event } from '@/lib/types';


export default function EventsPage() {
  const firestore = useFirestore();
  // Состояния для списка событий и фильтрации
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  // Категории событий
  const categories = [
    'all',
    'Встречи',
    'Пробеги',
    'Слеты',
    'Гонки',
    'Выставки',
    'Образование'
  ];

  // Загрузка событий из Firestore
  useEffect(() => {
    if(firestore) {
      fetchEvents();
    }
  }, [firestore]);

  const fetchEvents = async () => {
    if (!firestore) return;
    setLoading(true);
    try {
      const q = query(
        collection(firestore, 'events'),
        orderBy('startDate', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const data: Event[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Event));
      setEvents(data);
      setFilteredEvents(data);
    } catch (e) {
      // Показываем ошибку в консоли
      console.error('Ошибка загрузки событий:', e);
    } finally {
      setLoading(false);
    }
  };

  // Фильтрация (поиск, категория)
  useEffect(() => {
    let result = events;

    if (selectedCategory !== 'all') {
      result = result.filter(e => e.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q)
      );
    }
    setFilteredEvents(result);
  }, [events, selectedCategory, searchQuery]);

  // Приведение времени к строке
  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  // UI
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Шапка и создание */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">События</h1>
          <p className="text-muted-foreground">
            Актуальные встречи, автопробеги, гонки и другие мероприятия автосообщества
          </p>
        </div>
        <Link href="/events/create">
          <Button size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Добавить событие
          </Button>
        </Link>
      </div>
      
      {/* Фильтры и поиск */}
      <div className="mb-8 space-y-4">
        {/* Поиск */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            type="text"
            placeholder="Поиск по названию или месту проведения"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 h-12"
          />
        </div>
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
      </div>

      {/* Список событий */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Загрузка событий...</p>
          </div>
        </div>
      ) : (
        filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Событий нет</h3>
            <p className="text-muted-foreground mb-6">
              Нет событий по вашему запросу. Попробуйте изменить фильтры или добавьте новое мероприятие.
            </p>
            <Link href="/events/create">
              <Button>
                <Plus className="mr-2 h-5 w-5" />
                Добавить событие
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(ev => (
              <Link key={ev.id} href={`/events/${ev.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer flex flex-col">
                  {ev.imageUrl && (
                    <div className="aspect-video w-full overflow-hidden rounded-t-lg relative">
                      <Image 
                        src={ev.imageUrl}
                        alt={ev.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <CardHeader className="flex-grow">
                    <div className="mb-2">
                      <Badge variant="secondary">{ev.category}</Badge>
                    </div>
                    <CardTitle className="text-xl">{ev.title}</CardTitle>
                    <CardDescription>
                      <span>{formatDate(ev.startDate)}</span>
                      {ev.endDate && (
                        <> - <span>{formatDate(ev.endDate)}</span></>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" /> 
                      <span>{ev.location}</span>
                    </div>
                  </CardContent>
                   <CardContent>
                     <div className="flex gap-2 items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4" /> 
                      <span>{ev.participantsCount} участников</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  );
}
