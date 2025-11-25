'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cars } from '@/lib/data'; // Assuming you have user's cars available

export default function CreatePostPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [carId, setCarId] = useState('');
  const [loading, setLoading] = useState(false);

  const userCars = cars.filter(car => car.userId === user?.uid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Вы должны быть авторизованы.' });
      return;
    }
    if (!title || !content || !carId) {
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Пожалуйста, заполните все поля.' });
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(firestore, 'posts'), {
        title,
        content,
        carId,
        userId: user.uid,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        likes: 0,
        comments: 0,
        createdAt: serverTimestamp(),
      });
      toast({ title: 'Успех!', description: 'Ваш пост был создан.' });
      router.push('/posts');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Ошибка создания поста', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (isUserLoading) {
    return <div className="container mx-auto px-4 py-8 text-center">Загрузка...</div>;
  }

  if (!user) {
    router.push('/auth');
    return null;
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Создать новый пост</CardTitle>
          <CardDescription>Поделитесь чем-то новым о своем автомобиле.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="car">Выберите автомобиль</Label>
              <Select onValueChange={setCarId} value={carId}>
                <SelectTrigger id="car">
                  <SelectValue placeholder="Ваш автомобиль" />
                </SelectTrigger>
                <SelectContent>
                  {userCars.map(car => (
                    <SelectItem key={car.id} value={car.id}>{car.brand} {car.model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Заголовок</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Например, 'Новые диски'" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Содержание</Label>
              <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Расскажите подробнее..." required rows={10} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="tags">Теги (через запятую)</Label>
              <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="тюнинг, ремонт, jdm" />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Публикация...' : 'Опубликовать'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
