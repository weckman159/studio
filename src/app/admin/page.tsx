// src/app/admin/page.tsx
'use client'

import { useEffect, useState } from 'react';
import { 
  collection, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc, 
  query, 
  orderBy, 
  limit, 
  where,
  getCountFromServer
} from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { User as UserData, Workshop, Feedback, Post } from '@/lib/types';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useToast } from '@/hooks/use-toast';
import { serializeFirestoreData } from '@/lib/utils';

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Users, 
  Wrench, 
  MessageSquare, 
  FileText, 
  Shield, 
  Loader2, 
  Search, 
  Trash2, 
  Ban, 
  CheckCircle, 
  TrendingUp 
} from 'lucide-react';
import Link from 'next/link';

// --- Sub-components ---

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

export default function AdminPage() {
    const { user, isUserLoading } = useUser();
    const { profile, isLoading: isProfileLoading } = useUserProfile(user?.uid);
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();

    // Data States
    const [users, setUsers] = useState<UserData[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [workshops, setWorkshops] = useState<Workshop[]>([]);
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [stats, setStats] = useState({ users: 0, posts: 0, workshops: 0, feedback: 0 });
    
    // UI States
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [searchUser, setSearchUser] = useState('');

    // Check Admin Access
    useEffect(() => {
        if (!isUserLoading && !isProfileLoading) {
            if (!user || profile?.role !== 'admin') {
                router.push('/');
            }
        }
    }, [user, profile, isUserLoading, isProfileLoading, router]);

    // Fetch Data
    useEffect(() => {
        if (!firestore || !user || profile?.role !== 'admin') return;

        const fetchData = async () => {
            setIsLoadingData(true);
            try {
                // 1. Stats (Optimized with getCount if needed, but here simple length)
                // Note: For production with >1k docs, use getCountFromServer
                const usersRef = collection(firestore, 'users');
                const postsRef = collection(firestore, 'posts');
                const wsRef = collection(firestore, 'workshops');
                const fbRef = collection(firestore, 'feedback');

                // Fetch latest items for lists (limit 50)
                const [usersSnap, postsSnap, wsSnap, fbSnap] = await Promise.all([
                    getDocs(query(usersRef, orderBy('createdAt', 'desc'), limit(50))),
                    getDocs(query(postsRef, orderBy('createdAt', 'desc'), limit(50))),
                    getDocs(query(wsRef, orderBy('updatedAt', 'desc'), limit(50))),
                    getDocs(query(fbRef, orderBy('createdAt', 'desc'), limit(50)))
                ]);

                setUsers(usersSnap.docs.map((d: any) => serializeFirestoreData({ id: d.id, ...d.data() } as UserData)));
                setPosts(postsSnap.docs.map((d: any) => serializeFirestoreData({ id: d.id, ...d.data() } as Post)));
                setWorkshops(wsSnap.docs.map((d: any) => serializeFirestoreData({ id: d.id, ...d.data() } as Workshop)));
                setFeedbacks(fbSnap.docs.map((d: any) => serializeFirestoreData({ id: d.id, ...d.data() } as Feedback)));

                // Get rough counts (using the snapshot size for now, implies < 50 recent, 
                // strictly we should use separate counters for total stats)
                // For accuracy we ideally read a 'stats' document. 
                // Here we just show the fetched count for demo.
                
                // Example of proper counting (costs 1 read per execution):
                const usersCount = await getCountFromServer(usersRef);
                const postsCount = await getCountFromServer(postsRef);
                
                setStats({
                    users: usersCount.data().count,
                    posts: postsCount.data().count,
                    workshops: wsSnap.size,
                    feedback: fbSnap.size
                });

            } catch (error) {
                console.error("Admin load error:", error);
                toast({ variant: "destructive", title: "Ошибка загрузки данных" });
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchData();
    }, [firestore, user, profile, toast]);

    // --- Handlers ---

    const handleRoleChange = async (userId: string, newRole: 'admin' | 'user') => {
        if (!firestore) return;
        try {
            await updateDoc(doc(firestore, 'users', userId), { role: newRole });
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
            toast({ title: "Роль обновлена", description: `Пользователь теперь ${newRole}` });
        } catch (e) {
            toast({ variant: "destructive", title: "Ошибка", description: "Не удалось сменить роль" });
        }
    };

    const handleDeletePost = async (postId: string) => {
        if (!firestore) return;
        try {
            await deleteDoc(doc(firestore, 'posts', postId));
            setPosts(prev => prev.filter(p => p.id !== postId));
            toast({ title: "Пост удален" });
        } catch (e) {
            toast({ variant: "destructive", title: "Ошибка", description: "Не удалось удалить пост" });
        }
    };

    const handleDeleteWorkshop = async (wsId: string) => {
        if (!firestore) return;
        try {
            await deleteDoc(doc(firestore, 'workshops', wsId));
            setWorkshops(prev => prev.filter(w => w.id !== wsId));
            toast({ title: "Мастерская удалена" });
        } catch (e) {
            toast({ variant: "destructive", title: "Ошибка" });
        }
    };

    // --- Render ---

    if (isUserLoading || isProfileLoading || (isLoadingData && !users.length)) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-muted-foreground">Загрузка панели администратора...</p>
                </div>
            </div>
        );
    }

    const filteredUsers = users.filter(u => 
        u.displayName?.toLowerCase().includes(searchUser.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchUser.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-12">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Панель управления</h1>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-sm py-1 px-3">
                        Admin: {profile?.displayName}
                    </Badge>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Пользователи" value={stats.users} icon={Users} description="Всего зарегистрировано" />
                <StatCard title="Посты" value={stats.posts} icon={FileText} description="Опубликовано в ленте" />
                <StatCard title="Мастерские" value={stats.workshops} icon={Wrench} description="Активные сервисы" />
                <StatCard title="Обратная связь" value={stats.feedback} icon={MessageSquare} description="Новых сообщений" />
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="users" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="users">Пользователи</TabsTrigger>
                    <TabsTrigger value="posts">Контент</TabsTrigger>
                    <TabsTrigger value="workshops">Мастерские</TabsTrigger>
                    <TabsTrigger value="feedback">Обратная связь</TabsTrigger>
                </TabsList>

                {/* Users Tab */}
                <TabsContent value="users" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Управление пользователями</CardTitle>
                                    <CardDescription>Просмотр и управление ролями</CardDescription>
                                </div>
                                <div className="relative w-64">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        placeholder="Поиск по имени или email" 
                                        className="pl-8"
                                        value={searchUser}
                                        onChange={e => setSearchUser(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]"></TableHead>
                                        <TableHead>Пользователь</TableHead>
                                        <TableHead>Статус</TableHead>
                                        <TableHead>Дата регистрации</TableHead>
                                        <TableHead className="text-right">Действия</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map((u) => (
                                        <TableRow key={u.id}>
                                            <TableCell>
                                                <Avatar>
                                                    {u.photoURL && <AvatarImage src={u.photoURL} />}
                                                    <AvatarFallback>{u.displayName?.[0]}</AvatarFallback>
                                                </Avatar>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{u.displayName || 'Без имени'}</div>
                                                <div className="text-xs text-muted-foreground">{u.email}</div>
                                            </TableCell>
                                            <TableCell>
                                                {u.role === 'admin' ? (
                                                    <Badge className="bg-purple-500 hover:bg-purple-600">Администратор</Badge>
                                                ) : (
                                                    <Badge variant="secondary">Пользователь</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString('ru-RU') : 'Недавно'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {u.role !== 'admin' ? (
                                                        <Button variant="outline" size="sm" onClick={() => handleRoleChange(u.id, 'admin')}>
                                                            <Shield className="h-4 w-4 mr-1" />
                                                            В админы
                                                        </Button>
                                                    ) : (
                                                         <Button variant="outline" size="sm" onClick={() => handleRoleChange(u.id, 'user')}>
                                                            <Users className="h-4 w-4 mr-1" />
                                                            Снять права
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Posts Tab */}
                <TabsContent value="posts" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Модерация постов</CardTitle>
                            <CardDescription>Последние 50 публикаций</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Заголовок</TableHead>
                                        <TableHead>Автор</TableHead>
                                        <TableHead>Дата</TableHead>
                                        <TableHead className="text-right">Действия</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {posts.map((post) => (
                                        <TableRow key={post.id}>
                                            <TableCell className="font-medium">
                                                <Link href={`/posts/${post.id}`} className="hover:underline truncate block max-w-[300px]">
                                                    {post.title}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-6 w-6">
                                                        {post.authorAvatar && <AvatarImage src={post.authorAvatar} />}
                                                        <AvatarFallback>U</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm">{post.authorName}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString('ru-RU') : '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="destructive" size="sm">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Удалить этот пост?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Это действие нельзя отменить. Пост будет удален навсегда.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeletePost(post.id)}>Удалить</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Workshops Tab */}
                <TabsContent value="workshops">
                     <Card>
                        <CardHeader>
                            <CardTitle>Мастерские</CardTitle>
                            <CardDescription>Управление списком сервисов</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {workshops.map(ws => (
                                    <div key={ws.id} className="flex items-center justify-between border p-4 rounded-lg">
                                        <div className="flex items-start gap-4">
                                            <div className="h-12 w-12 bg-muted rounded-md flex items-center justify-center">
                                                <Wrench className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold">{ws.name}</h4>
                                                <p className="text-sm text-muted-foreground">{ws.city}, {ws.address}</p>
                                                <div className="flex gap-2 mt-1">
                                                    <Badge variant="outline">{ws.specialization}</Badge>
                                                    {ws.source && <Badge variant="secondary" className="text-xs">{ws.source}</Badge>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/workshops/${ws.id}`}>Просмотр</Link>
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Удалить мастерскую?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Она пропадет из публичного каталога.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteWorkshop(ws.id)}>Удалить</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Feedback Tab */}
                <TabsContent value="feedback">
                    <Card>
                        <CardHeader>
                            <CardTitle>Обратная связь</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {feedbacks.map((fb) => (
                                    <div key={fb.id} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="font-semibold">{fb.email || 'Аноним'}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {fb.createdAt?.toDate ? fb.createdAt.toDate().toLocaleString() : '-'}
                                            </div>
                                        </div>
                                        <p className="text-sm">{fb.msg}</p>
                                    </div>
                                ))}
                                {feedbacks.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground">Сообщений нет</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
    