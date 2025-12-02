// src/app/workshops/create/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFileUpload } from '@/hooks/use-file-upload';
import { Loader2, Upload } from 'lucide-react';
import Image from 'next/image';

const specializations = ['Мультибренд', 'BMW', 'Mercedes', 'VAG', 'JDM', 'Электрика', 'Кузовной', 'Детейлинг'];

export default function CreateWorkshopPage() {
    const router = useRouter();
    const { user } = useUser();
    const firestore = useFirestore();
    const { uploadFiles, uploading } = useFileUpload({ maxFiles: 1 });

    const [form, setForm] = useState({ name: '', city: '', address: '', specialization: '', description: '', phone: '' });
    const [file, setFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!user || !firestore) return;
        setSaving(true);
        try {
            let imageUrl = '';
            if(file) {
                const res = await uploadFiles([file], 'workshops', user.uid); // temporary ID usage
                imageUrl = res[0]?.url || '';
            }

            const docRef = await addDoc(collection(firestore, 'workshops'), {
                ...form,
                imageUrl,
                rating: 0,
                reviewsCount: 0,
                createdBy: user.uid,
                createdAt: serverTimestamp()
            });
            router.push(`/workshops/${docRef.id}`);
        } catch(e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    if(!user) return <div className="p-10 text-center">Нужна авторизация</div>;

    return (
        <div className="container max-w-xl py-10">
            <h1 className="text-3xl font-bold mb-6">Добавить мастерскую</h1>
            <form onSubmit={handleSubmit}>
                <Card>
                    <CardContent className="space-y-4 pt-6">
                        <Input placeholder="Название сервиса" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                        <div className="grid grid-cols-2 gap-4">
                            <Input placeholder="Город" value={form.city} onChange={e => setForm({...form, city: e.target.value})} required />
                            <Select onValueChange={v => setForm({...form, specialization: v})}>
                                <SelectTrigger><SelectValue placeholder="Специализация" /></SelectTrigger>
                                <SelectContent>
                                    {specializations.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <Input placeholder="Адрес" value={form.address} onChange={e => setForm({...form, address: e.target.value})} required />
                        <Input placeholder="Телефон" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                        <Textarea placeholder="Описание услуг" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                        
                        <div className="flex items-center gap-4 border p-4 rounded-md">
                             {file ? (
                                 <div className="text-sm text-green-600">Фото выбрано: {file.name}</div>
                             ) : (
                                 <div className="flex items-center text-muted-foreground"><Upload className="mr-2 h-4 w-4"/> Загрузить фото</div>
                             )}
                             <Input type="file" className="opacity-0 absolute w-full cursor-pointer" onChange={e => setFile(e.target.files?.[0] || null)} accept="image/*" />
                        </div>

                        <Button className="w-full" disabled={saving || uploading}>
                            {(saving || uploading) && <Loader2 className="animate-spin mr-2" />} Сохранить
                        </Button>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
