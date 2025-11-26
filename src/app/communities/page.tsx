
'use client';

import { useState, useEffect }
from 'react';
import { collection, query, orderBy, getDocs }
from 'firebase/firestore';
import { useFirestore }
from '@/firebase';
import Link from 'next/link';
import { Button }
from '@/components/ui/button';
import { Input }
from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle }
from '@/components/ui/card';
import { Badge }
from '@/components/ui/badge';
import { Users, Search, Plus }
from 'lucide-react';
import Image from 'next/image';

// Интерфейс для типизации данных сообщества
interface Community {
  id: string;
  name: string; // Название сообщества
  description: string; // Краткое описание
  category: string; // Категория (например, "Тюнинг", "Ремонт", "Путешествия")
  membersCount: number; // Количество участников
  imageUrl?: string; // URL изображения сообщества (опционально)
  createdAt: any; // Дата создания
  isPrivate: boolean; // Приватное ли сообщество
}

// Моковые данные для демонстрации
const mockCommunities: Community[] = [
    {
      id: '1',
      name: 'BMW M Club',
      description: 'Все о мощных автомобилях BMW M-серии. Обсуждаем тюнинг, делимся опытом и организуем встречи.',
      category: 'Тюнинг',
      membersCount: 12500,
      imageUrl: 'https://images.unsplash.com/photo-1560382798-8e2b8a73a6e3?q=80&w=2070&auto=format&fit=crop',
      createdAt: new Date(),
      isPrivate: false,
    },
    {
      id: '2',
      name: 'JDM Legends',
      description: 'Сообщество ценителей японского автопрома. Supra, Skyline, RX-7 и другие легенды JDM.',
      category: 'Классика',
      membersCount: 23450,
      imageUrl: 'https://images.unsplash.com/photo-1617013735327-94a31a3d3cce?q=80&w=2070&auto=format&fit=crop',
      createdAt: new Date(),
      isPrivate: false,
    },
    {
      id: '3',
      name: 'Автопутешественники',
      description: 'Планируем маршруты, делимся лайфхаками и отчетами о поездках на автомобилях по всему миру.',
      category: 'Путешествия',
      membersCount: 8750,
      imageUrl: 'https://images.unsplash.com/photo-1532931795-65d351619448?q=80&w=1974&auto=format&fit=crop',
      createdAt: new Date(),
      isPrivate: false,
    },
    {
      id: '4',
      name: 'Off-Road 4x4',
      description: 'Покоряем бездорожье! Все о внедорожниках, подготовке к экспедициям и лучшему снаряжению.',
      category: 'Ремонт',
      membersCount: 15200,
      imageUrl: 'https://images.unsplash.com/photo-1528543606781-4f6e6b35cc49?q=80&w=1974&auto=format&fit=crop',
      createdAt: new Date(),
      isPrivate: true,
    }
];


export default function CommunitiesPage() {
  const firestore = useFirestore();
  const [communities, setCommunities] = useState < Community[] > ([]);
  const [filteredCommunities, setFilteredCommunities] = useState < Community[] > ([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState < string > ('all');
  const [loading, setLoading] = useState(true);

  const categories = ['all', 'Тюнинг', 'Ремонт', 'Путешествия', 'Гонки', 'Классика', 'Электромобили'];

  useEffect(() => {
    fetchCommunities();
  }, [firestore]);


  const fetchCommunities = async () => {
    // Используем моковые данные, пока Firestore не настроен для этого раздела
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Имитация загрузки
    setCommunities(mockCommunities);
    setFilteredCommunities(mockCommunities);
    setLoading(false);
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Загрузка сообществ...</p>
          </div>
        </div>
      </div>
    );
  }

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

      {filteredCommunities.length === 0 ? (
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
                {community.imageUrl && (
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg relative">
                    <Image 
                      src={community.imageUrl} 
                      alt={community.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                
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

