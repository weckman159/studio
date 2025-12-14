
'use client'

import { useEffect, useState } from 'react';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  getCountFromServer
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { User as UserData, Workshop, Feedback, Post } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { serializeFirestoreData } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Wrench, MessageSquare, FileText, Loader2, Shield } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

function StatCard({ title, value, icon: Icon, description }: { title: string, value: string | number, icon: any, description: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
    const firestore = useFirestore();
    const { toast } = useToast();

    const [stats, setStats] = useState({ users: 0, posts: 0, workshops: 0, feedback: 0 });
    const [recentPosts, setRecentPosts] = useState<Post[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        if (!firestore) return;

        const fetchData = async () => {
            setIsLoadingData(true);
            try {
                const usersRef = collection(firestore, 'users');
                const postsRef = collection(firestore, 'posts');
                const wsRef = collection(firestore, 'workshops');
                const fbRef = collection(firestore, 'feedback');

                const [usersCount, postsCount, workshopsCount, feedbackCount] = await Promise.all([
                    getCountFromServer(usersRef),
                    getCountFromServer(postsRef),
                    getCountFromServer(wsRef),
                    getCountFromServer(fbRef)
                ]);
                
                setStats({
                    users: usersCount.data().count,
                    posts: postsCount.data().count,
                    workshops: workshopsCount.data().count,
                    feedback: feedbackCount.data().count
                });

                // Fetch recent posts
                const postsQuery = query(collection(firestore, 'posts'), orderBy('createdAt', 'desc'), limit(5));
                const postsSnap = await getDocs(postsQuery);
                setRecentPosts(postsSnap.docs.map(d => serializeFirestoreData({id: d.id, ...d.data()} as Post)));

            } catch (error) {
                console.error("Admin stats load error:", error);
                toast({ variant: "destructive", title: "Ошибка загрузки статистики" });
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchData();
    }, [firestore, toast]);

    if (isLoadingData) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">Дашборд</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Пользователи" value={stats.users} icon={Users} description="Всего зарегистрировано" />
                <StatCard title="Посты" value={stats.posts} icon={FileText} description="Всего публикаций" />
                <StatCard title="Мастерские" value={stats.workshops} icon={Wrench} description="Сервисов в каталоге" />
                <StatCard title="Обратная связь" value={stats.feedback} icon={MessageSquare} description="Всего сообщений" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Недавние публикации</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {recentPosts.length > 0 ? recentPosts.map(post => (
                            <Link key={post.id} href={`/posts/${post.id}`} className="block">
                                <div className="flex items-center gap-3 hover:bg-muted p-2 rounded-lg -m-2">
                                    <Avatar>
                                        <AvatarImage src={post.authorAvatar} />
                                        <AvatarFallback>{post.authorName?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="font-semibold text-sm truncate">{post.title}</p>
                                        <p className="text-xs text-muted-foreground">Автор: {post.authorName}</p>
                                    </div>
                                </div>
                            </Link>
                        )) : <p className="text-muted-foreground text-sm py-8 text-center">Публикаций пока нет.</p>}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Жалобы</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px] text-center">
                         <Shield className="h-10 w-10 text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">Нет активных жалоб.</p>
                        <p className="text-xs text-muted-foreground mt-1">(Функционал в разработке)</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
