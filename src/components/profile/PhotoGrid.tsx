'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, Image as ImageIcon } from 'lucide-react';

export function PhotoGrid({ userId }: { userId: string }) {
  const firestore = useFirestore();
  const [photos, setPhotos] = useState<{id: string, url: string}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore || !userId) return;
    
    const fetchPhotos = async () => {
        try {
            // В идеале нужен индекс, но пока делаем простой запрос и фильтруем на клиенте
            // чтобы не ломать приложение ошибками индексов
            const q = query(
                collection(firestore, 'posts'), 
                where('authorId', '==', userId),
                orderBy('createdAt', 'desc')
            );

            const snap = await getDocs(q);
            
            const items = snap.docs
                .map(d => ({ id: d.id, url: d.data().imageUrl }))
                .filter(item => item.url); // Оставляем только посты с фото
                
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

  if (photos.length === 0) return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground border-2 border-dashed rounded-xl">
          <ImageIcon className="h-12 w-12 mb-2 opacity-50" />
          <p>Нет фотографий</p>
      </div>
  );

  return (
    <div className="grid grid-cols-3 gap-1 md:gap-4">
        {photos.map((photo) => (
            <Link key={photo.id} href={`/posts/${photo.id}`} className="relative aspect-square group overflow-hidden bg-muted cursor-pointer">
                <Image 
                    src={photo.url} 
                    alt="Post photo" 
                    fill 
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
            </Link>
        ))}
    </div>
  );
}
