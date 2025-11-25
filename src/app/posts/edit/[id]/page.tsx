
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
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
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { X } from 'lucide-react';


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
  const [imageUrls, setImageUrls] = useState<string[]>([]);
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

      const existingImageUrls: string[] = [];
      if (postData.imageUrls) {
         existingImageUrls.push(...postData.imageUrls)
      } else if (postData.imageIds) {
        postData.imageIds.forEach(id => {
          const placeholder = PlaceHolderImages.find(p => p.id === id);
          if (placeholder) {
            existingImageUrls.push(placeholder.imageUrl);
          }
        })
      } else if (postData.imageId) {
        const placeholder = PlaceHolderImages.find(p => p.id === postData.imageId);
        if (placeholder) {
          existingImageUrls.push(placeholder.imageUrl);
        }
      }
      setImageUrls(existingImageUrls);
    }
  }, [postData]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newUrls: string[] = [];
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newUrls.push(reader.result as string);
          if (newUrls.length === files.length) {
            setImageUrls(prev => [...prev, ...newUrls]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  }

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
    const updatedData: Partial<Post> = {
      title,
      content,
      carId,
      userId: user.uid,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      updatedAt: serverTimestamp() as unknown as string,
      // We won't save image URLs to avoid Firestore size limits for now.
      imageIds: imageUrls.length > 0 ? Array.from({length: imageUrls.length}, () => `post${Math.floor(Math.random() * 3) + 1}`) : [],
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
              <Label htmlFor="cover-image">Изображения</Label>
              <Input id="cover-image" type="file" accept="image/*" onChange={handleImageUpload} multiple />
               <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <Image src={url} alt={`Предпросмотр изображения ${index + 1}`} width={150} height={100} className="object-cover rounded-md aspect-video" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
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
