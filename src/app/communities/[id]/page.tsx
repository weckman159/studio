
// src/app/communities/[id]/page.tsx
// Детальная страница конкретного сообщества
// Показывает полную информацию о сообществе, список постов, участников
// Позволяет вступить/выйти из сообщества, создавать посты (если участник)

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, collection, query, where, orderBy, getDocs, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase'; // Используем хуки из нашего модуля
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, Lock, Globe, Settings, UserPlus, UserMinus, MessageSquare, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Интерфейсы для типизации данных
interface Community {
  id: string;
  name: string;
  description: string;
  fullDescription?: string; // Полное описание (может быть длинным)
  category: string;
  membersCount: number;
  imageUrl?: string;
  coverUrl?: string; // URL обложки сообщества
  createdAt: any;
  isPrivate: boolean;
  adminId: string; // ID администратора сообщества
  memberIds: string[]; // Массив ID участников
  rules?: string; // Правила сообщества
}

interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  communityId: string;
  createdAt: any;
  likesCount: number;
  commentsCount: number;
}

interface Member {
  id: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'member'; // Роль в сообществе
  joinedAt: any;
}

function CommunityDetailClient({ communityId }: { communityId: string }) {
  const router = useRouter();
  const { user } = useUser(); // Получаем текущего пользователя через хук
  const firestore = useFirestore(); // Получаем экземпляр Firestore

  // Состояния компонента
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false); // Является ли пользователь участником
  const [isAdmin, setIsAdmin] = useState(false); // Является ли пользователь администратором
  const [activeTab, setActiveTab] = useState('posts'); // Активная вкладка

  // Загрузка данных сообщества при монтировании
  useEffect(() => {
    if (communityId && firestore) {
      fetchCommunityData();
    }
  }, [communityId, user, firestore]);

  // Функция загрузки всех данных сообщества
  const fetchCommunityData = async () => {
    if (!firestore) return;
    try {
      setLoading(true);
      
      const communityDoc = await getDoc(doc(firestore, 'communities', communityId));
      
      if (!communityDoc.exists()) {
        router.push('/404');
        return;
      }

      const communityData = {
        id: communityDoc.id,
        ...communityDoc.data()
      } as Community;

      setCommunity(communityData);

      if (user) {
        setIsMember(communityData.memberIds?.includes(user.uid) || false);
        setIsAdmin(communityData.adminId === user.uid);
      }

      await fetchPosts();
      await fetchMembers(communityData.memberIds || []);

    } catch (error) {
      console.error('Ошибка загрузки сообщества:', error);
    } finally {
      setLoading(false);
    }
  };

  // Функция загрузки постов сообщества
  const fetchPosts = async () => {
     if (!firestore) return;
    try {
      const q = query(
        collection(firestore, 'posts'),
        where('communityId', '==', communityId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const postsData: Post[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Post));

      setPosts(postsData);
    } catch (error) {
      console.error('Ошибка загрузки постов:', error);
    }
  };

  // Функция загрузки информации об участниках
  const fetchMembers = async (memberIds: string[]) => {
    if (!firestore) return;
    try {
      if (memberIds.length === 0) {
        setMembers([]);
        return;
      }

      const membersData: Member[] = [];
      const chunks = [];
      
      for (let i = 0; i < Math.min(memberIds.length, 50); i += 10) {
        chunks.push(memberIds.slice(i, i + 10));
      }

      for (const chunk of chunks) {
        const q = query(
          collection(firestore, 'users'),
          where('__name__', 'in', chunk)
        );
        
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(doc => {
          membersData.push({
            id: doc.id,
            displayName: doc.data().displayName || 'Пользователь',
            photoURL: doc.data().photoURL,
            role: doc.id === community?.adminId ? 'admin' : 'member',
            joinedAt: doc.data().joinedAt
          });
        });
      }

      setMembers(membersData);
    } catch (error) {
      console.error('Ошибка загрузки участников:', error);
    }
  };

  // Функция вступления в сообщество
  const handleJoinCommunity = async () => {
    if (!user || !community || !firestore) return;

    try {
      const communityRef = doc(firestore, 'communities', communityId);
      
      await updateDoc(communityRef, {
        memberIds: arrayUnion(user.uid), 
        membersCount: increment(1)
      });

      setIsMember(true);
      setCommunity({
        ...community,
        membersCount: community.membersCount + 1,
        memberIds: [...(community.memberIds || []), user.uid]
      });

      setMembers([...members, {
        id: user.uid,
        displayName: user.displayName || 'Пользователь',
        photoURL: user.photoURL || undefined,
        role: 'member',
        joinedAt: new Date()
      }]);

    } catch (error) {
      console.error('Ошибка при вступлении в сообщество:', error);
    }
  };

  // Функция выхода из сообщества
  const handleLeaveCommunity = async () => {
    if (!user || !community || isAdmin || !firestore) return;

    try {
      const communityRef = doc(firestore, 'communities', communityId);
      
      await updateDoc(communityRef, {
        memberIds: arrayRemove(user.uid),
        membersCount: increment(-1)
      });

      setIsMember(false);
      setCommunity({
        ...community,
        membersCount: community.membersCount - 1,
        memberIds: community.memberIds.filter(id => id !== user.uid)
      });

      setMembers(members.filter(m => m.id !== user.uid));

    } catch (error) {
      console.error('Ошибка при выходе из сообщества:', error);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-12 w-12 animate-spin" />
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Сообщество не найдено</h2>
          <Link href="/communities">
            <Button>Вернуться к списку</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="w-full h-64 md:h-80 relative overflow-hidden">
        {community.coverUrl ? (
          <Image 
            src={community.coverUrl} 
            alt={community.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-muted"></div>
        )}
      </div>


      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6 mb-8 -mt-20">
          <div className="flex-shrink-0">
             <div className="relative w-32 h-32 rounded-lg border-4 border-background shadow-lg">
                 {community.imageUrl ? (
                    <Image 
                        src={community.imageUrl} 
                        alt={community.name}
                        fill
                        className="object-cover rounded-md"
                    />
                 ) : (
                    <div className="w-full h-full bg-muted rounded-md flex items-center justify-center">
                        <Users className="w-16 h-16 text-muted-foreground"/>
                    </div>
                 )}
            </div>
          </div>

          <div className="flex-1 pt-24 md:pt-12">
            <div className="flex flex-wrap items-start gap-3 mb-3">
              <h1 className="text-3xl md:text-4xl font-bold">{community.name}</h1>
              {community.isPrivate ? (
                <Badge variant="secondary" className="gap-1">
                  <Lock className="h-3 w-3" />
                  Приватное
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1">
                  <Globe className="h-3 w-3" />
                  Открытое
                </Badge>
              )}
              <Badge>{community.category}</Badge>
            </div>
            <p className="text-muted-foreground mb-4">{community.description}</p>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{community.membersCount.toLocaleString('ru-RU')} участников</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Создано {formatDate(community.createdAt)}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {user ? (
                <>
                  {!isMember ? (
                    <Button onClick={handleJoinCommunity} size="lg">
                      <UserPlus className="mr-2 h-5 w-5" />
                      Вступить
                    </Button>
                  ) : (
                    <>
                      {!isAdmin && (
                        <Button onClick={handleLeaveCommunity} variant="outline" size="lg">
                          <UserMinus className="mr-2 h-5 w-5" />
                          Выйти
                        </Button>
                      )}
                      <Link href={`/communities/${communityId}/create-post`}>
                        <Button size="lg">
                          <MessageSquare className="mr-2 h-5 w-5" />
                          Создать пост
                        </Button>
                      </Link>
                    </>
                  )}
                  {isAdmin && (
                    <Link href={`/communities/${communityId}/settings`}>
                      <Button variant="outline" size="lg">
                        <Settings className="mr-2 h-5 w-5" />
                        Настройки
                      </Button>
                    </Link>
                  )}
                </>
              ) : (
                <Link href="/auth">
                  <Button size="lg">
                    <UserPlus className="mr-2 h-5 w-5" />
                    Войти, чтобы вступить
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="posts">Посты</TabsTrigger>
            <TabsTrigger value="about">О сообществе</TabsTrigger>
            <TabsTrigger value="members">Участники</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-6">
            {posts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Постов пока нет</h3>
                  <p className="text-muted-foreground mb-6">
                    Станьте первым, кто создаст пост в этом сообществе
                  </p>
                  {isMember && (
                    <Link href={`/communities/${communityId}/create-post`}>
                      <Button>Создать пост</Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ) : (
              posts.map(post => (
                <Link key={post.id} href={`/posts/${post.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="h-10 w-10">
                          {post.authorAvatar && <AvatarImage src={post.authorAvatar} />}
                          <AvatarFallback>{post.authorName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{post.authorName}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(post.createdAt)}
                          </p>
                        </div>
                      </div>
                      <CardTitle>{post.title}</CardTitle>
                      <CardDescription className="line-clamp-3">
                        {post.content}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>❤️ {post.likesCount}</span>
                        <span>💬 {post.commentsCount}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </TabsContent>

          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>О сообществе</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 prose dark:prose-invert max-w-none">
                <div>
                  <h3 className="font-semibold mb-2">Описание</h3>
                  <p className="text-muted-foreground">
                    {community.fullDescription || community.description}
                  </p>
                </div>
                {community.rules && (
                  <div>
                    <h3 className="font-semibold mb-2">Правила сообщества</h3>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {community.rules}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members">
            <Card>
              <CardHeader>
                <CardTitle>Участники ({community.membersCount})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {members.map(member => (
                    <Link key={member.id} href={`/profile/${member.id}`}>
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer">
                        <Avatar>
                          {member.photoURL && <AvatarImage src={member.photoURL} />}
                          <AvatarFallback>{member.displayName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold">{member.displayName}</p>
                          {member.role === 'admin' && (
                            <Badge variant="secondary" className="text-xs">
                              Администратор
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default async function CommunityDetailPage({ params }: { params: { id: string } }) {
    const { id } = params;
    return <CommunityDetailClient communityId={id} />
}
