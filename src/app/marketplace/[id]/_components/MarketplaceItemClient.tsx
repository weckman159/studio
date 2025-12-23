
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { MarketplaceItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, ArrowLeft, MapPin, Share2, Heart } from 'lucide-react';
import Link from 'next/link';

export default function MarketplaceItemClient({ item }: { item: MarketplaceItem }) {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();

  // Нормализуем структуру данных для изображений, чтобы избежать смешения типов
  const allImages = [
    item.imageUrl ? { url: item.imageUrl, blurhash: item.blurhash } : undefined,
    ...(item.gallery || [])
  ].filter((img): img is { url: string; blurhash?: string } => !!img && !!img.url);

  const [activeImage, setActiveImage] = useState(allImages[0]?.url || item.imageUrl);


  const handleContactSeller = async () => {
      if (!user) return router.push('/auth');
      if (user.uid === item.sellerId) return;

      try {
          // 1. Проверяем, есть ли уже диалог
          const q = query(
              collection(firestore, 'dialogs'),
              where('participantIds', 'array-contains', user.uid)
          );
          const snap = await getDocs(q);
          let dialogId = null;

          snap.forEach(doc => {
              const data = doc.data();
              if (data.participantIds.includes(item.sellerId)) {
                  dialogId = doc.id;
              }
          });

          // 2. Если нет - создаем
          if (!dialogId) {
              const newDialog = await addDoc(collection(firestore, 'dialogs'), {
                  participantIds: [user.uid, item.sellerId],
                  createdAt: serverTimestamp(),
                  lastMessageAt: serverTimestamp(),
                  lastMessageText: `Здравствуйте! По поводу объявления "${item.title}"`
              });
              dialogId = newDialog.id;
              
              // Отправляем первое сообщение автоматически
              await addDoc(collection(firestore, 'messages'), {
                  dialogId,
                  authorId: user.uid,
                  text: `Здравствуйте! Интересует объявление "${item.title}". Оно еще актуально?`,
                  createdAt: serverTimestamp()
              });
          }

          router.push(`/messages/${dialogId}`);
      } catch (e) {
          console.error(e);
      }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
       <Link href="/marketplace"><Button variant="ghost" className="mb-4"><ArrowLeft className="mr-2 h-4 w-4"/> Назад</Button></Link>
       
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gallery */}
          <div className="space-y-4">
              <div className="relative aspect-[4/3] w-full bg-muted rounded-xl overflow-hidden border">
                   {activeImage ? (
                       <Image src={activeImage} alt={item.title} fill className="object-contain" />
                   ) : (
                       <div className="flex items-center justify-center h-full text-muted-foreground">Нет фото</div>
                   )}
              </div>
              {allImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                      {allImages.map((img, i) => (
                          <button key={i} onClick={() => setActiveImage(img.url)} className={`relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 ${activeImage === img.url ? 'border-primary' : 'border-transparent'}`}>
                              <Image src={img.url} alt={`Thumbnail ${i+1}`} fill className="object-cover" />
                          </button>
                      ))}
                  </div>
              )}
          </div>

          {/* Info */}
          <div className="space-y-6">
              <div>
                  <div className="flex justify-between items-start">
                      <h1 className="text-3xl font-bold mb-2">{item.title}</h1>
                      <Button variant="ghost" size="icon"><Heart className="h-6 w-6" /></Button>
                  </div>
                  <div className="text-3xl font-bold text-primary mb-4">
                      {item.price.toLocaleString()} {item.currency === 'RUB' ? '₽' : item.currency}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="secondary" className="text-base px-3 py-1">{item.condition}</Badge>
                      <Badge variant="outline" className="text-base px-3 py-1">{item.category}</Badge>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                      <MapPin className="mr-2 h-5 w-5" /> {item.location}
                  </div>
              </div>

              <Card>
                  <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                              <AvatarImage src={item.sellerAvatar} />
                              <AvatarFallback>{item.sellerName?.[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                              <div className="font-bold">{item.sellerName}</div>
                              <div className="text-xs text-muted-foreground">На AutoSphere с 2024</div>
                          </div>
                      </div>
                      <Button onClick={handleContactSeller} size="lg">
                          <MessageCircle className="mr-2 h-5 w-5" /> Написать
                      </Button>
                  </CardContent>
              </Card>

              <div>
                  <h3 className="font-bold text-xl mb-2">Описание</h3>
                  <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                      {item.fullDescription || item.description}
                  </p>
              </div>

              <div className="pt-6 border-t text-xs text-muted-foreground">
                  Опубликовано: {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : 'Недавно'} <br/>
                  Просмотров: {item.views || 0}
              </div>
          </div>
       </div>
    </div>
  );
}
