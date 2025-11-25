
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useFirestore, useUser, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, setDoc, serverTimestamp, query } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Car, Post } from '@/lib/data';
import { setDocumentNonBlocking } from '@/firebase';


export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [carId, setCarId] = useState('');
  const [loading, setLoading] = useState(false);

  const postRef = useMemoFirebase(() => {
    if (!firestore || typeof id !== 'string') return null;
    return doc(firestore, 'posts', id);
  }, [firestore, id]);

  const { data: postData, isLoading: isPostLoading } = useDoc<Post>(postRef);

  const userCarsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'cars'));
  }, [user, firestore]);

  const { data: userCars, isLoading: carsLoading } = useCollection<Car>(userCarsQuery);

  useEffect(() => {
    if (postData) {
      setTitle(postData.title);
      setContent(postData.content);
      setCarId(postData.carId);
      setTags(postData.tags.join(', '));
    }
  }, [postData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore || !postRef) {
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Не удалось обновить пост.' });
      return;
    }
    if (!title || !content || !carId) {
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Пожалуйста, заполните все обязательные поля.' });
      return;
    }

    setLoading(true);
    const updatedData = {
      title,
      content,
      carId,
      userId: user.uid,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      updatedAt: serverTimestamp(),
    };
    
    setDocumentNonBlocking(postRef, updatedData, { merge: true });

    toast({ title: 'Успех!', description: 'Ваш пост был обновлен.' });
    router.push('/posts');
    setLoading(false);
  };
  
  const pageLoading = isUserLoading || carsLoading || isPostLoading;

  if (pageLoading) {
    return <div className="container mx-auto px-4 py-8 text-center">Загрузка...</div>;
  }

  if (!user) {
    router.push('/auth');
    return null;
  }
  
  if (!postData) {
      return <div className="container mx-auto px-4 py-8 text-center">Пост не найден.</div>
  }
  
  if (postData.userId !== user.uid) {
       return <div className="container mx-auto px-4 py-8 text-center">У вас нет прав для редактирования этого поста.</div>
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Редактировать пост</CardTitle>
          <CardDescription>Внесите изменения в свою запись.</CardDescription>
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
                  {userCars && userCars.length > 0 ? (
                    userCars.map(car => (
                      <SelectItem key={car.id} value={car.id}>{car.brand} {car.model}</SelectItem>
                    ))
                  ) : (
                    <SelectItem value="disabled" disabled>У вас нет автомобилей</SelectItem>
                  )}
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
            <Button type="submit" disabled={loading || !carId}>
              {loading ? 'Сохранение...' : 'Сохранить изменения'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
