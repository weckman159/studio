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
import Link from 'next/link';
import { Event } from '@/lib/types';

export default function EventSettingsClient({ params }: { params: { id: string } }) {
    const { id: eventId } = params;
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const router = useRouter();
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    useEffect(() => {
        if (!user || !firestore || !eventId) return;

        const fetchEvent = async () => {
            try {
                const docRef = doc(firestore, 'events', eventId);
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    const data = { id: snap.id, ...snap.data() } as Event;
                    if (data.organizerId !== user.uid) {
                        toast({ variant: 'destructive', title: 'Нет прав', description: 'Вы не организатор' });
                        router.push(`/events/${eventId}`);
                        return;
                    }
                    setEvent(data);
                } else {
                    router.push('/events');
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [user, firestore, eventId, router, toast]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!event || !firestore) return;
        setSaving(true);
        try {
            const docRef = doc(firestore, 'events', eventId);
            await updateDoc(docRef, {
                title: event.title,
                description: event.description,
                fullDescription: event.fullDescription,
                location: event.location,
                address: event.address,
                requirements: event.requirements,
            });
            toast({ title: 'Сохранено', description: 'Настройки события обновлены' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Ошибка', description: 'Не удалось сохранить изменения' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    if (!event) return null;

    return (
        <div className="container max-w-2xl py-8">
            <Link href={`/events/${eventId}`}>
                <Button variant="ghost" className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" /> Назад к событию</Button>
            </Link>
            <Card>
                <CardHeader>
                    <CardTitle>Редактирование события</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Название</Label>
                            <Input value={event.title} onChange={e => setEvent({...event, title: e.target.value})} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Место проведения</Label>
                            <Input value={event.location} onChange={e => setEvent({...event, location: e.target.value})} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Адрес</Label>
                            <Input value={event.address || ''} onChange={e => setEvent({...event, address: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label>Краткое описание</Label>
                            <Textarea value={event.description} onChange={e => setEvent({...event, description: e.target.value})} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Полное описание</Label>
                            <Textarea value={event.fullDescription || ''} onChange={e => setEvent({...event, fullDescription: e.target.value})} rows={5} />
                        </div>
                        <Button type="submit" disabled={saving}>
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Сохранить
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}