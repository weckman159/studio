// src/app/voting/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, BarChart, Calendar, Archive } from 'lucide-react';
import { Voting } from '@/lib/types';


export default function VotingPage() {
  const firestore = useFirestore();
  const [polls, setPolls] = useState<Voting[]>([]);
  const [filteredPolls, setFilteredPolls] = useState<Voting[]>([]);
  const [showArchive, setShowArchive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if(firestore) fetchPolls();
  }, [firestore]);

  const fetchPolls = async () => {
    if (!firestore) return;
    setLoading(true);
    try {
      const q = query(collection(firestore, 'votings'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const arr: Voting[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Voting));
      setPolls(arr);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    let arr = showArchive ? polls.filter(p => !p.isActive) : polls.filter(p => p.isActive);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      arr = arr.filter(p => p.question.toLowerCase().includes(q));
    }
    setFilteredPolls(arr);
  }, [polls, showArchive, searchQuery]);


  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('ru-RU');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Голосования</h1>
          <p className="text-muted-foreground">Актуальные опросы автосообщества</p>
        </div>
        <Link href="/voting/create">
          <Button size="lg"><Plus className="mr-2 h-5 w-5" /> Создать опрос</Button>
        </Link>
      </div>

      <div className="mb-6 flex gap-4 flex-wrap">
        <Button variant={!showArchive ? 'default' : 'outline'} onClick={() => setShowArchive(false)} size="sm">
          <BarChart className="h-4 w-4 mr-2" /> Активные
        </Button>
        <Button variant={showArchive ? 'default' : 'outline'} onClick={() => setShowArchive(true)} size="sm">
          <Archive className="h-4 w-4 mr-2" /> Архив
        </Button>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input className="pl-10 h-12" placeholder="Поиск опросов..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
      </div>

      {loading ? (
        <div className="text-center py-12">Загрузка...</div>
      ) : filteredPolls.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Опросов не найдено</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPolls.map(poll => (
            <Link key={poll.id} href={`/voting/${poll.id}`}>
              <Card className="h-full hover:shadow-lg cursor-pointer transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-2">{poll.question}</CardTitle>
                  <div className="flex flex-wrap gap-2 my-2">
                    {poll.options.slice(0, 3).map((opt, i) => (
                      <Badge key={i} variant="secondary" className="truncate max-w-[150px]">{opt}</Badge>
                    ))}
                    {poll.options.length > 3 && <Badge variant="outline">+{poll.options.length - 3}</Badge>}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(poll.createdAt)}
                    <span>• {poll.totalVotes} голосов</span>
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
