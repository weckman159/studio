
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, collection, query, where, orderBy, getDocs, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, Lock, Globe, Settings, UserPlus, UserMinus, MessageSquare, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { Community, Post, User } from '@/lib/types';

interface CommunityDetailClientProps {
    initialCommunity: Community;
    initialPosts: Post[];
    initialMembers: User[];
}

export default function CommunityDetailClient({ initialCommunity, initialPosts, initialMembers }: CommunityDetailClientProps) {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();

  const [community, setCommunity] = useState<Community>(initialCommunity);
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [members, setMembers] = useState<User[]>(initialMembers);
  const [loading, setLoading] = useState(false); // For actions, not initial load
  const [isMember, setIsMember] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    if (user && community) {
      setIsMember(community.memberIds?.includes(user.uid) || false);
      setIsAdmin(community.adminId === user.uid);
    } else {
      setIsMember(false);
      setIsAdmin(false);
    }
  }, [user, community]);

  const handleJoinCommunity = async () => {
    if (!user || !community || !firestore) return;
    setLoading(true);
    try {
      const communityRef = doc(firestore, 'communities', community.id);
      await updateDoc(communityRef, {
        memberIds: arrayUnion(user.uid), 
        membersCount: increment(1)
      });
      setCommunity(prev => ({
        ...prev!,
        membersCount: prev!.membersCount + 1,
        memberIds: [...(prev!.memberIds || []), user.uid]
      }));
      setIsMember(true);
    } catch (error) {
      console.error('Ошибка при вступлении в сообщество:', error);
    } finally {
        setLoading(false);
    }
  };

  const handleLeaveCommunity = async () => {
    if (!user || !community || isAdmin || !firestore) return;
    setLoading(true);
    try {
      const communityRef = doc(firestore, 'communities', community.id);
      await updateDoc(communityRef, {
        memberIds: arrayRemove(user.uid),
        membersCount: increment(-1)
      });
      setCommunity(prev => ({
        ...prev!,
        membersCount: prev!.membersCount - 1,
        memberIds: prev!.memberIds.filter(id => id !== user.uid)
      }));
      setIsMember(false);
    } catch (error) {
      console.error('Ошибка при выходе из сообщества:', error);
    } finally {
        setLoading(false);
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
  
  const communityId = community.id;

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
                    <Button onClick={handleJoinCommunity} size="lg" disabled={loading}>
                      {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <UserPlus className="mr-2 h-5 w-5" />}
                      Вступить
                    </Button>
                  ) : (
                    <>
                      {!isAdmin && (
                        <Button onClick={handleLeaveCommunity} variant="outline" size="lg" disabled={loading}>
                          {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <UserMinus className="mr-2 h-5 w-5" />}
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
                          <AvatarFallback>{post.authorName?.[0]}</AvatarFallback>
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
                        <span>❤️ {post.likesCount || 0}</span>
                        <span>💬 {post.commentsCount || 0}</span>
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
                          <AvatarFallback>{member.displayName?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold">{member.displayName}</p>
                          {member.id === community.adminId && (
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
