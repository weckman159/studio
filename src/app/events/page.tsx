
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
import { Calendar, Search, Plus, MapPin, Users, Loader2 } from 'lucide-react';
import type { Event } from '@/lib/types';


export default function EventsPage() {
  const firestore = useFirestore();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  const categories = ['all', 'Встречи', 'Пробеги', 'Слеты', 'Гонки', 'Выставки', 'Образование'];

  useEffect(() => {
    if(firestore) {
      fetchEvents();
    }
  }, [firestore]);

  const fetchEvents = async () => {
    if (!firestore) return;
    setLoading(true);
    try {
      const q = query(collection(firestore, 'events'), orderBy('startDate', 'desc'));
      const querySnapshot = await getDocs(q);
      const data: Event[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
      setEvents(data);
      setFilteredEvents(data);
    } catch (e) {
      console.error('Ошибка загрузки событий:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = events;
    if (selectedCategory !== 'all') {
      result = result.filter(e => e.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e => e.title.toLowerCase().includes(q) || e.location.toLowerCase().includes(q));
    }
    setFilteredEvents(result);
  }, [events, selectedCategory, searchQuery]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-white">События</h1>
          <p className="text-text-secondary">
            Актуальные встречи, автопробеги, гонки и другие мероприятия автосообщества
          </p>
        </div>
        <Link href="/events/create">
          <Button size="lg"><Plus className="mr-2 h-5 w-5" />Добавить событие</Button>
        </Link>
      </div>
      
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted h-5 w-5" />
          <Input type="text" placeholder="Поиск по названию или месту проведения" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 h-12 bg-surface border-border"/>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <Button key={cat} variant={selectedCategory === cat ? 'default' : 'outline'} onClick={() => setSelectedCategory(cat)} size="sm">
              {cat === 'all' ? 'Все категории' : cat}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        filteredEvents.length === 0 ? (
          <div className="text-center py-12 holographic-panel rounded-xl">
            <Calendar className="mx-auto h-16 w-16 text-text-muted mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-white">Событий нет</h3>
            <p className="text-text-secondary mb-6">Нет событий по вашему запросу. Попробуйте изменить фильтры или добавьте новое мероприятие.</p>
            <Link href="/events/create"><Button><Plus className="mr-2 h-5 w-5" />Добавить событие</Button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(ev => (
              <Link key={ev.id} href={`/events/${ev.id}`}>
                <Card className="holographic-panel h-full hover:border-primary/50 transition-all cursor-pointer flex flex-col">
                  {ev.imageUrl && (
                    <div className="aspect-video w-full overflow-hidden relative"><Image src={ev.imageUrl} alt={ev.title} fill className="object-cover"/></div>
                  )}
                  <CardHeader className="flex-grow">
                    <div className="mb-2"><Badge variant="secondary">{ev.category}</Badge></div>
                    <CardTitle className="text-xl text-white">{ev.title}</CardTitle>
                    <CardDescription className="text-text-secondary">
                      <span>{formatDate(ev.startDate)}</span>{ev.endDate && <> - <span>{formatDate(ev.endDate)}</span></>}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex gap-2 items-center text-sm text-text-secondary"><MapPin className="h-4 w-4" /> <span>{ev.location}</span></div>
                    <div className="flex gap-2 items-center text-sm text-text-secondary"><Users className="h-4 w-4" /> <span>{ev.participantsCount} участников</span></div>
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
