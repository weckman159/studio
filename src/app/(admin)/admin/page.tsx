
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
import { Users, Wrench, MessageSquare, FileText, Loader2 } from 'lucide-react';

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
                        <CardTitle>Недавняя активность</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Здесь будет график активности...</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Жалобы</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Здесь будет список последних жалоб...</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

