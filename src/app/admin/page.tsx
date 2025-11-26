
// src/app/admin/page.tsx
'use client'

import { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { User as UserData, Workshop, Feedback } from '@/lib/data';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Users, Wrench, MessageSquare, Trash, Shield, Loader2, UserCheck } from 'lucide-react';

// === Компоненты админ-панели ===

function DashboardAdmin() {
  const [stats, setStats] = useState({ posts: 0, users: 0, workshops: 0, feedback: 0 });
  const [loading, setLoading] = useState(true);
  const firestore = useFirestore();

  useEffect(() => {
    if (!firestore) return;
    const fetchStats = async () => {
      try {
        const [postsSnap, usersSnap, workshopsSnap, feedbackSnap] = await Promise.all([
          getDocs(collection(firestore, 'posts')),
          getDocs(collection(firestore, 'users')),
          getDocs(collection(firestore, 'workshops')),
          getDocs(collection(firestore, 'feedback')),
        ]);
        setStats({
          posts: postsSnap.size,
          users: usersSnap.size,
          workshops: workshopsSnap.size,
          feedback: feedbackSnap.size,
        });
      } catch (error) {
        console.error("Ошибка загрузки статистики:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [firestore]);

  const statCards = [
    { title: 'Пользователи', value: stats.users, icon: Users },
    { title: 'Посты', value: stats.posts, icon: Wrench },
    { title: 'Мастерские', value: stats.workshops, icon: Wrench },
    { title: 'Обратная связь', value: stats.feedback, icon: MessageSquare },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => <Card key={i}><CardHeader><div className="h-8 w-24 bg-muted rounded animate-pulse" /></CardHeader><CardContent><div className="h-10 w-12 bg-muted rounded animate-pulse" /></CardContent></Card>)}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map(card => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


function UserListAdmin() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const firestore = useFirestore();

    const fetchUsers = async () => {
        if (!firestore) return;
        setLoading(true);
        try {
            const snapshot = await getDocs(collection(firestore, 'users'));
            const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserData));
            setUsers(usersData);
        } catch (error) {
            console.error("Ошибка загрузки пользователей:", error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchUsers();
    }, [firestore]);

    const handleRoleChange = async (userId: string, role: 'admin' | 'user') => {
        if (!firestore) return;
        try {
            await setDoc(doc(firestore, 'users', userId), { role }, { merge: true });
            fetchUsers(); // Refresh list
        } catch (error) {
            console.error("Ошибка смены роли:", error);
        }
    };
    
    const handleBan = async (userId: string) => {
        if (!firestore) return;
        console.log(`Banning user ${userId}`); // Placeholder
    };

    if (loading) return <p>Загрузка пользователей...</p>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Пользователи</CardTitle>
                <CardDescription>Управление пользователями и их ролями</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Имя</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Роль</TableHead>
                            <TableHead className="text-right">Действия</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map(u => (
                            <TableRow key={u.id}>
                                <TableCell>{u.name || u.displayName}</TableCell>
                                <TableCell>{u.email}</TableCell>
                                <TableCell>
                                    <Select 
                                        defaultValue={u.role || 'user'}
                                        onValueChange={(value: 'admin' | 'user') => handleRoleChange(u.id, value)}
                                    >
                                        <SelectTrigger className="w-[120px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="user">User</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" onClick={() => handleBan(u.id)}>Забанить</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

function WorkshopListAdmin() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const firestore = useFirestore();

  const fetchWorkshops = async () => {
    if (!firestore) return;
    setLoading(true);
    try {
        const snapshot = await getDocs(collection(firestore, 'workshops'));
        setWorkshops(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workshop)));
    } catch(e) {
        console.error("Ошибка загрузки мастерских: ", e);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkshops();
  }, [firestore]);
  
  const handleDelete = async (id: string) => {
    if (!firestore) return;
    try {
        await deleteDoc(doc(firestore, 'workshops', id));
        fetchWorkshops(); // Refresh
    } catch(e) {
        console.error("Ошибка удаления мастерской: ", e);
    }
  };

  if (loading) return <p>Загрузка мастерских...</p>;

  return (
    <Card>
        <CardHeader>
            <CardTitle>Мастерские</CardTitle>
            <CardDescription>Модерация списка мастерских</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-2">
                {workshops.map(ws => (
                    <div key={ws.id} className="border p-3 rounded-lg flex justify-between items-center">
                    <div>
                        <p className="font-semibold">{ws.name} <Badge variant="secondary">{ws.source}</Badge></p>
                        <p className="text-sm text-muted-foreground">{ws.city}</p>
                    </div>
                    <Button onClick={() => handleDelete(ws.id)} variant="destructive" size="sm">
                        <Trash className="h-4 w-4 mr-2" />
                        Удалить
                    </Button>
                    </div>
                ))}
            </div>
        </CardContent>
    </Card>
  );
}

function FeedbackAdmin() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const firestore = useFirestore();

  useEffect(() => {
    if (!firestore) return;
    const fetchFeedback = async () => {
        setLoading(true);
        try {
            const snapshot = await getDocs(collection(firestore, 'feedback'));
            setFeedback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Feedback)));
        } catch (e) {
            console.error("Ошибка загрузки фидбека: ", e);
        } finally {
            setLoading(false);
        }
    };
    fetchFeedback();
  }, [firestore]);

  if (loading) return <p>Загрузка сообщений...</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Обратная связь</CardTitle>
        <CardDescription>Сообщения от пользователей</CardDescription>
      </CardHeader>
      <CardContent>
        {feedback.map((f) => (
          <div key={f.id} className="border-b last:border-b-0 p-4">
            <div className="flex justify-between items-center">
              <p className="font-semibold">{f.email || 'Аноним'}</p>
              <p className="text-xs text-muted-foreground">{f.createdAt?.toDate && f.createdAt.toDate().toLocaleString()}</p>
            </div>
            <p className="mt-2 text-muted-foreground">{f.msg}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}


export default function AdminPage() {
    const { user, isUserLoading } = useUser();
    const [profile, setProfile] = useState<UserData | null>(null);
    const firestore = useFirestore();
    const router = useRouter();

    useEffect(() => {
        if (user && firestore) {
            const fetchProfile = async () => {
                const userDoc = await getDoc(doc(firestore, 'users', user.uid));
                if (userDoc.exists()) {
                    setProfile(userDoc.data() as UserData);
                }
            };
            fetchProfile();
        }
    }, [user, firestore]);

    if (isUserLoading || (user && !profile)) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    if (!user || profile?.role !== 'admin') {
        if (typeof window !== 'undefined') {
            router.push('/');
        }
        return null;
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Админ-панель</h1>
            
            <DashboardAdmin />
            <UserListAdmin />
            <WorkshopListAdmin />
            <FeedbackAdmin />

        </div>
    );
}

// Интерфейсы для данных
interface Workshop {
  id: string;
  name: string;
  city: string;
  source?: string;
}

interface Feedback {
  id: string;
  email?: string;
  msg: string;
  createdAt: any;
}
