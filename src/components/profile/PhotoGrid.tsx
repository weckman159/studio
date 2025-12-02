'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export function PhotoGrid({ userId }: { userId: string }) {
  const firestore = useFirestore();
  const [photos, setPhotos] = useState<{id: string, url: string}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore || !userId) return;
    
    const fetchPhotos = async () => {
        try {
            // Ищем посты пользователя, у которых есть imageUrl
            const q = query(
                collection(firestore, 'posts'), 
                where('authorId', '==', userId),
                where('imageUrl', '!=', ''), // Firestore требует композитный индекс для этого
                orderBy('imageUrl'), // Хитрость: сортировка по полю, по которому фильтруем неравенство
                orderBy('createdAt', 'desc')
            );
            // Если индекс не создан, этот запрос может упасть. 
            // Упрощенная версия без сложного индекса:
            const simpleQ = query(
                collection(firestore, 'posts'), 
                where('authorId', '==', userId),
                orderBy('createdAt', 'desc')
            );

            const snap = await getDocs(simpleQ);
            // Фильтруем на клиенте
            const items = snap.docs
                .map(d => ({ id: d.id, url: d.data().imageUrl }))
                .filter(item => item.url);
                
            setPhotos(items);
        } catch (e) {
            console.error("Photo fetch error:", e);
        } finally {
            setLoading(false);
        }
    };
    fetchPhotos();
  }, [firestore, userId]);

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

  if (photos.length === 0) return <div className="text-center py-12 text-muted-foreground">Нет фотографий</div>;

  return (
    <div className="grid grid-cols-3 gap-1 md:gap-4">
        {photos.map((photo) => (
            <Link key={photo.id} href={`/posts/${photo.id}`} className="relative aspect-square group overflow-hidden bg-muted cursor-pointer">
                <Image 
                    src={photo.url} 
                    alt="Post photo" 
                    fill 
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            </Link>
        ))}
    </div>
  );
}
