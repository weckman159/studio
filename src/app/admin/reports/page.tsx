'use client'

import { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { serializeFirestoreData } from '@/lib/utils';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Loader2, MoreHorizontal, ShieldCheck, Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface Report {
    id: string;
    entityId: string;
    entityType: 'post' | 'comment' | 'user';
    entityTitle: string;
    reportedBy: string;
    status: 'open' | 'resolved' | 'dismissed';
    createdAt: any;
}

const getStatusVariant = (status: Report['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case 'open': return 'destructive';
        case 'resolved': return 'default';
        case 'dismissed': return 'secondary';
        default: return 'outline';
    }
}

const getEntityUrl = (report: Report): string => {
    switch (report.entityType) {
        case 'post': return `/posts/${report.entityId}`;
        case 'user': return `/profile/${report.entityId}`;
        default: return '#';
    }
}

export default function AdminReportsPage() {
    const firestore = useFirestore();
    const { toast } = useToast();

    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!firestore) return;
        setLoading(true);

        const fetchReports = async () => {
            const q = query(collection(firestore, 'reports'), orderBy('createdAt', 'desc'));
            try {
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(d => serializeFirestoreData({ id: d.id, ...d.data() }) as Report);
                setReports(data);
            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Ошибка загрузки жалоб', description: error.message });
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, [firestore, toast]);

    const handleUpdateStatus = async (reportId: string, status: Report['status']) => {
        if (!firestore) return;
        const reportRef = doc(firestore, 'reports', reportId);
        try {
            await updateDoc(reportRef, { status });
            setReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r));
            toast({ title: 'Статус обновлен' });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Ошибка обновления статуса' });
        }
    };
    
    const handleDeleteReport = async (reportId: string) => {
        if(!confirm('Вы уверены, что хотите удалить эту жалобу?')) return;
        // This would typically be a batched delete in a real app, but for simplicity:
        await updateDoc(doc(firestore, 'reports', reportId), {status: 'dismissed'});
        setReports(prev => prev.filter(r => r.id !== reportId));
        toast({title: "Жалоба удалена"});
    }

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8"/></div>;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Центр жалоб</CardTitle>
                            <CardDescription>Найдено: {reports.length} жалоб</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Объект жалобы</TableHead>
                                <TableHead>Тип</TableHead>
                                <TableHead>Кем отправлено</TableHead>
                                <TableHead>Дата</TableHead>
                                <TableHead>Статус</TableHead>
                                <TableHead className="text-right">Действия</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reports.map((report) => (
                                <TableRow key={report.id}>
                                    <TableCell className="font-medium truncate max-w-xs">
                                        <Link href={getEntityUrl(report)} target="_blank" className="hover:underline flex items-center gap-1">
                                            {report.entityTitle || report.entityId} <ExternalLink className="h-3 w-3"/>
                                        </Link>
                                    </TableCell>
                                    <TableCell><Badge variant="outline">{report.entityType}</Badge></TableCell>
                                    <TableCell className="text-muted-foreground text-xs font-mono">{report.reportedBy}</TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {report.createdAt ? new Date(report.createdAt).toLocaleDateString('ru-RU') : 'Н/Д'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(report.status)}>{report.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Действия</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleUpdateStatus(report.id, 'resolved')}>
                                                    <ShieldCheck className="mr-2 h-4 w-4" />Отметить как решенную
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() => handleUpdateStatus(report.id, 'dismissed')}>
                                                    <Trash2 className="mr-2 h-4 w-4" />Отклонить
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {reports.length === 0 && <p className="text-center text-muted-foreground py-12">Активных жалоб нет.</p>}
                </CardContent>
            </Card>
        </div>
    );
}
