// src/app/voting/page.tsx
// Страница всех опросов/голосований
// Можно увидеть активные/архивные опросы, перейти к деталям или создать свой опрос
// Gemini: опросы хранятся в Firestore, сортируются по дате и активности

'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, BarChart, Calendar, Archive } from 'lucide-react';

// Интерфейс опроса
interface VotingShort {
  id: string;
  question: string;
  isActive: boolean;
  options: string[]; // ["BMW", "Toyota",...]
  totalVotes: number;
  createdAt: any;
  endsAt?: any;
}

export default function VotingPage() {
  const firestore = useFirestore();
  const [polls, setPolls] = useState<VotingShort[]>([]);
  const [filteredPolls, setFilteredPolls] = useState<VotingShort[]>([]);
  const [showArchive, setShowArchive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if(firestore) {
        fetchPolls();
    }
  }, [firestore]);

  // Загрузка опросов из Firestore
  const fetchPolls = async () => {
    if (!firestore) return;
    setLoading(true);
    try {
      const q = query(
        collection(firestore, 'votings'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const arr: VotingShort[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as VotingShort));
      setPolls(arr);
      setFilteredPolls(arr);
    } catch (e) {
      console.error('Ошибка загрузки опросов:', e);
    } finally {
      setLoading(false);
    }
  };

  // Фильтрация и поиск
  useEffect(() => {
    let arr = showArchive ? polls.filter(p => !p.isActive) : polls.filter(p => p.isActive);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      arr = arr.filter(p =>
        p.question.toLowerCase().includes(q) ||
        p.options.some(opt => opt.toLowerCase().includes(q))
      );
    }
    setFilteredPolls(arr);
  }, [polls, showArchive, searchQuery]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Хедер */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Голосования</h1>
          <p className="text-muted-foreground">
            Актуальные и завершённые опросы автосообщества
          </p>
        </div>
        <Link href="/voting/create">
          <Button size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Создать опрос
          </Button>
        </Link>
      </div>

      {/* Фильтры */}
      <div className="mb-6 flex gap-4 flex-wrap">
        <Button
          variant={!showArchive ? 'default' : 'outline'}
          onClick={() => setShowArchive(false)}
          size="sm"
        >
          <BarChart className="h-4 w-4 mr-2" />
          Активные опросы
        </Button>
        <Button
          variant={showArchive ? 'default' : 'outline'}
          onClick={() => setShowArchive(true)}
          size="sm"
        >
          <Archive className="h-4 w-4 mr-2" />
          Архив
        </Button>
      </div>
      {/* Поиск */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input
          type="text"
          placeholder="Поиск по вопросу или вариантам"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-10 h-12"
        />
      </div>
      {/* Лента опросов */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[250px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Загрузка опросов...</p>
          </div>
        </div>
      ) : filteredPolls.length === 0 ? (
        <div className="text-center py-12">
          <BarChart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            {showArchive ? 'Опросов в архиве нет' : 'Активных опросов нет'}
          </h3>
          <p className="text-muted-foreground mb-6">
            Попробуйте другой фильтр/поиск или создайте новый опрос
          </p>
          <Link href="/voting/create">
            <Button>
              <Plus className="mr-2 h-5 w-5" />
              Новый опрос
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPolls.map(poll => (
            <Link key={poll.id} href={`/voting/${poll.id}`}>
              <Card className="h-full hover:shadow-lg cursor-pointer transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{poll.question}</CardTitle>
                  <div className="flex flex-wrap gap-2 my-2">
                    {poll.options.map((opt, i) => (
                      <Badge key={i} variant="secondary">{opt}</Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {formatDate(poll.createdAt)}
                    {poll.totalVotes > 0 && <span>• проголосовало {poll.totalVotes}</span>}
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
    