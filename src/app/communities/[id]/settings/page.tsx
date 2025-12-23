
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Community } from '@/lib/types';

// Client Component containing the form logic
function CommunitySettingsClient({ communityId }: { communityId: string }) {
    const [community, setCommunity] = useState<Community | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const router = useRouter();
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    
    const [canGoBack, setCanGoBack] = useState(false);
    useEffect(() => {
        if (typeof window !== 'undefined') {
          setCanGoBack(window.history.length > 1);
        }
    }, []);

    useEffect(() => {
        if (!user || !firestore || !communityId) return;

        const fetchCommunity = async () => {
            try {
                const docRef = doc(firestore, 'communities', communityId);
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    const data = { id: snap.id, ...snap.data() } as Community;
                    if (data.adminId !== user.uid) {
                        toast({ variant: 'destructive', title: 'Нет прав', description: 'Вы не администратор этого сообщества' });
                        router.push(`/communities/${communityId}`);
                        return;
                    }
                    setCommunity(data);
                } else {
                    router.push('/communities');
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchCommunity();
    }, [user, firestore, communityId, router, toast]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!community || !firestore) return;
        setSaving(true);
        try {
            const docRef = doc(firestore, 'communities', communityId);
            await updateDoc(docRef, {
                name: community.name,
                description: community.description,
                fullDescription: community.fullDescription,
                rules: community.rules,
            });
            toast({ title: 'Сохранено', description: 'Настройки сообщества обновлены' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Ошибка', description: 'Не удалось сохранить изменения' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    if (!community) return null;

    return (
        <div className="container max-w-2xl py-8">
            {canGoBack && (
                <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Назад к сообществу
                </Button>
            )}
            <Card>
                <CardHeader>
                    <CardTitle>Настройки сообщества</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Название</Label>
                            <Input value={community.name} onChange={e => setCommunity({...community, name: e.target.value})} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Краткое описание</Label>
                            <Textarea value={community.description} onChange={e => setCommunity({...community, description: e.target.value})} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Полное описание</Label>
                            <Textarea value={community.fullDescription || ''} onChange={e => setCommunity({...community, fullDescription: e.target.value})} rows={5} />
                        </div>
                        <div className="space-y-2">
                            <Label>Правила</Label>
                            <Textarea value={community.rules || ''} onChange={e => setCommunity({...community, rules: e.target.value})} rows={5} />
                        </div>
                        <Button type="submit" disabled={saving}>
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Сохранить изменения
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

// Server Component wrapper to handle params
export default async function CommunitySettingsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <CommunitySettingsClient communityId={id} />;
}
