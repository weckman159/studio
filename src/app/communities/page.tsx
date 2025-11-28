
'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Search, Plus } from 'lucide-react';
import Image from 'next/image';
import type { Community } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';


function CommunitiesPageSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="h-full flex flex-col">
          <Skeleton className="aspect-video w-full rounded-t-lg" />
          <div className="flex flex-col flex-1 p-4">
            <CardHeader className="p-0 mb-2">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <Skeleton className="h-6 w-24" />
            </CardContent>
            <CardFooter className="p-0 pt-4">
              <Skeleton className="h-5 w-28" />
            </CardFooter>
          </div>
        </Card>
      ))}
    </div>
  )
}

export default function CommunitiesPage() {
  const firestore = useFirestore();
  const [communities, setCommunities] = useState < Community[] > ([]);
  const [filteredCommunities, setFilteredCommunities] = useState < Community[] > ([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState < string > ('all');
  const [loading, setLoading] = useState(true);

  const categories = ['all', 'Тюнинг', 'Ремонт', 'Путешествия', 'Гонки', 'Классика', 'Электромобили'];

  useEffect(() => {
    if(firestore) {
      fetchCommunities();
    }
  }, [firestore]);


  const fetchCommunities = async () => {
    if (!firestore) return;
    setLoading(true);
    try {
      const q = query(collection(firestore, 'communities'), orderBy('membersCount', 'desc'));
      const querySnapshot = await getDocs(q);
      const communitiesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Community));
      setCommunities(communitiesData);
      setFilteredCommunities(communitiesData);
    } catch (e) {
      console.error("Error fetching communities: ", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = communities;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(c => c.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query)
      );
    }

    setFilteredCommunities(filtered);
  }, [searchQuery, selectedCategory, communities]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Сообщества</h1>
          <p className="text-muted-foreground">
            Найдите единомышленников и присоединяйтесь к интересным сообществам
          </p>
        </div>

        <Link href="/communities/create">
          <Button size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Создать сообщество
          </Button>
        </Link>
      </div>

      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            type="text"
            placeholder="Поиск сообществ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
              size="sm"
            >
              {category === 'all' ? 'Все категории' : category}
            </Button>
          ))}
        </div>
      </div>

      {loading ? <CommunitiesPageSkeleton /> :
      filteredCommunities.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Сообщества не найдены</h3>
          <p className="text-muted-foreground mb-6">
            Попробуйте изменить параметры поиска или создайте новое сообщество
          </p>
          <Link href="/communities/create">
            <Button>
              <Plus className="mr-2 h-5 w-5" />
              Создать сообщество
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCommunities.map(community => (
            <Link key={community.id} href={`/communities/${community.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer flex flex-col">
                <div className="aspect-video w-full overflow-hidden rounded-t-lg relative">
                    {community.imageUrl ? (
                      <Image 
                        src={community.imageUrl} 
                        alt={community.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="bg-muted h-full flex items-center justify-center">
                          <Users className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                </div>
                
                <div className="flex flex-col flex-1 p-4">
                    <CardHeader className="p-0 mb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-xl">{community.name}</CardTitle>
                        {community.isPrivate && (
                          <Badge variant="secondary">Приватное</Badge>
                        )}
                      </div>
                      <CardDescription className="line-clamp-2 pt-1">
                        {community.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="p-0 flex-1">
                      <Badge variant="outline">{community.category}</Badge>
                    </CardContent>

                    <CardFooter className="p-0 pt-4 text-sm text-muted-foreground">
                      <Users className="mr-2 h-4 w-4" />
                      {community.membersCount.toLocaleString('ru-RU')} участников
                    </CardFooter>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
