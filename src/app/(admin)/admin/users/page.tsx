
'use client'

import { useEffect, useState, useMemo } from 'react';
import { collection, query, orderBy, getDocs, onSnapshot } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { User, UserRoles } from '@/lib/types';
import { serializeFirestoreData } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Search, Loader2, MoreHorizontal, Shield, UserX, UserCheck } from 'lucide-react';
import Link from 'next/link';

// Helper to determine the display role string
const getUserDisplayRole = (roles?: UserRoles): string => {
    if (roles?.isAdmin) return 'admin';
    if (roles?.isModerator) return 'moderator';
    return 'user';
}

export default function AdminUsersPage() {
    const { user: adminUser } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [actionDialog, setActionDialog] = useState<{ isOpen: boolean; title: string; description: string; onConfirm: () => void; } | null>(null);

    useEffect(() => {
        if (!firestore) return;
        setLoading(true);
        const q = query(collection(firestore, 'users'), orderBy('createdAt', 'desc'));
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const usersData = querySnapshot.docs.map(doc => serializeFirestoreData({ id: doc.id, ...doc.data() }) as User);
            setUsers(usersData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching users:", error);
            toast({ variant: "destructive", title: "Ошибка загрузки пользователей" });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [firestore, toast]);
    
    const performAction = async (targetUserId: string, action: 'setRole' | 'ban' | 'unban', payload?: any) => {
        if (!adminUser) return;
        
        try {
            const token = await adminUser.getIdToken();
            const response = await fetch(`/api/admin/actions`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ action, targetUserId, payload }),
            });
            
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Не удалось выполнить действие');
            }
            
            toast({ title: 'Успех!', description: result.message });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Ошибка', description: error.message });
        } finally {
            setActionDialog(null);
        }
    };
    
    const openConfirmation = (title: string, description: string, onConfirm: () => void) => {
        setActionDialog({ isOpen: true, title, description, onConfirm });
    };
    
    const filteredUsers = useMemo(() => {
        if (!searchQuery) return users;
        return users.filter(u =>
            u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [users, searchQuery]);

    const statusBadge = (user: User) => {
        if (user.status === 'banned') {
            return <Badge variant="destructive">Забанен</Badge>;
        }
        return <Badge variant="secondary">Активен</Badge>;
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8"/></div>;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Управление пользователями</CardTitle>
                            <CardDescription>Найдено: {filteredUsers.length} пользователей</CardDescription>
                        </div>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Поиск по имени или email"
                                className="pl-8"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Пользователь</TableHead>
                                <TableHead>Роль</TableHead>
                                <TableHead>Статус</TableHead>
                                <TableHead>Дата регистрации</TableHead>
                                <TableHead className="text-right">Действия</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((user) => {
                                const displayRole = getUserDisplayRole(user.roles);
                                return (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <Link href={`/profile/${user.id}`} className="flex items-center gap-3 group">
                                            <Avatar>
                                                {user.photoURL && <AvatarImage src={user.photoURL} />}
                                                <AvatarFallback>{user.displayName?.[0]}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium group-hover:underline">{user.displayName || 'Без имени'}</div>
                                                <div className="text-xs text-muted-foreground">{user.email}</div>
                                            </div>
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.roles?.isAdmin ? 'default' : 'outline'} className={user.roles?.isAdmin ? 'bg-purple-600' : ''}>
                                            {displayRole}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{statusBadge(user)}</TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('ru-RU') : 'Н/Д'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Действия</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => openConfirmation(`Сделать ${user.displayName} админом?`, 'Это даст ему полные права.', () => performAction(user.id, 'setRole', { role: 'admin' }))} disabled={user.roles?.isAdmin}>
                                                    <Shield className="mr-2 h-4 w-4" />Сделать админом
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => openConfirmation(`Снять права админа с ${user.displayName}?`, 'Пользователь станет обычным юзером.', () => performAction(user.id, 'setRole', { role: 'user' }))} disabled={!user.roles?.isAdmin}>
                                                    <UserCheck className="mr-2 h-4 w-4" />Сделать юзером
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                {user.status !== 'banned' ? (
                                                    <DropdownMenuItem className="text-destructive" onClick={() => openConfirmation(`Забанить ${user.displayName}?`, 'Пользователь не сможет войти.', () => performAction(user.id, 'ban'))}>
                                                        <UserX className="mr-2 h-4 w-4" />Забанить
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem className="text-green-600" onClick={() => openConfirmation(`Разбанить ${user.displayName}?`, 'Пользователь сможет войти.', () => performAction(user.id, 'unban'))}>
                                                        <UserCheck className="mr-2 h-4 w-4" />Разбанить
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )})}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            
            {actionDialog && (
                 <AlertDialog open={actionDialog.isOpen} onOpenChange={(isOpen) => !isOpen && setActionDialog(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{actionDialog.title}</AlertDialogTitle>
                            <AlertDialogDescription>{actionDialog.description}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setActionDialog(null)}>Отмена</AlertDialogCancel>
                            <AlertDialogAction onClick={actionDialog.onConfirm}>Подтвердить</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
    );
}
