
// src/app/workshops/[id]/page.tsx
// Детальная страница мастерской: инфо, отзывы, возможность оставить отзыв, карта
// Gemini: поддержка как автозагруженных (из интернет-источников), так и пользовательских мастерских

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { doc, getDoc, collection, query, where, getDocs, orderBy, addDoc, serverTimestamp, updateDoc, increment } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Star, MapPin, Phone, Wrench, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

// Интерфейс мастерской
interface Workshop {
  id: string;
  name: string;
  city: string;
  address: string;
  specialization: string;
  phone?: string;
  rating: number;
  reviewsCount: number;
  imageUrl?: string;
  description?: string;
  website?: string;
  source?: string;
  updatedAt?: any;
  lat?: number;
  lng?: number;
}

// Интерфейс отзыва
interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  text: string;
  createdAt: any;
}

export default function WorkshopPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const workshopId = params.id as string;

  const [workshop, setWorkshop] = useState<Workshop|null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Загрузка мастерской
  useEffect(() => {
    if (workshopId && firestore) fetchWorkshop();
  }, [workshopId, firestore]);

  const fetchWorkshop = async () => {
    if (!firestore) return;
    try {
      setLoading(true);
      const snap = await getDoc(doc(firestore, 'workshops', workshopId));
      if (!snap.exists()) {
        router.push('/workshops');
        return;
      }
      setWorkshop({ id: snap.id, ...snap.data() } as Workshop);
      fetchReviews();
    } catch (e) {
      setError('Ошибка загрузки мастерской');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка отзывов
  const fetchReviews = async () => {
    if (!firestore) return;
    try {
      const q = query(
        collection(firestore, 'workshopReviews'),
        where('workshopId', '==', workshopId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const arr: Review[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Review));
      setReviews(arr);
    } catch (e) {
      console.error('Ошибка загрузки отзывов:', e);
    }
  };

  // Добавить отзыв
  const handleAddReview = async () => {
    if (!user || !firestore) {
      setError('Войдите, чтобы оставить отзыв');
      return;
    }
    if (!reviewText.trim()) {
      setError('Введите текст отзыва');
      return;
    }
    setSending(true);
    setError('');
    setSuccess('');
    try {
      // Сохраняем отзыв
      await addDoc(collection(firestore, 'workshopReviews'), {
        workshopId,
        userId: user.uid,
        userName: user.displayName,
        userAvatar: user.photoURL,
        rating: reviewRating,
        text: reviewText.trim(),
        createdAt: serverTimestamp()
      });

      // Обновляем рейтинг мастерской (очень простая формула, можно усложнить)
      if (workshop) {
        const newRating = ((workshop.rating * workshop.reviewsCount) + reviewRating) / (workshop.reviewsCount + 1);
        await updateDoc(doc(firestore, 'workshops', workshopId), {
          rating: newRating,
          reviewsCount: increment(1),
          updatedAt: serverTimestamp()
        });
      }

      setReviewText('');
      setReviewRating(5);
      setSuccess('Ваш отзыв добавлен!');
      fetchWorkshop(); // reloads reviews & rating
    } catch (e) {
      setError('Ошибка добавления отзыва');
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  // Форматирование даты
  const formatDate = (ts: any) => {
    if (!ts) return '';
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Загрузка мастерской...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Мастерская не найдена.
            <Link href="/workshops" className="ml-2 underline">
              К списку мастерских
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      {/* Назад */}
      <Link href="/workshops">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          К мастерским
        </Button>
      </Link>
      {/* Карточка мастерской */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-4">
            {workshop.imageUrl && (
              <div className="w-28 h-20 relative">
                <Image src={workshop.imageUrl} alt={workshop.name} fill className="rounded object-cover" />
              </div>
            )}
            <div>
              <CardTitle className="mb-2 text-2xl">{workshop.name}</CardTitle>
              <div className="flex gap-2 flex-wrap items-center text-muted-foreground text-sm">
                <Badge variant="outline">{workshop.specialization}</Badge>
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{workshop.city} {workshop.address && `- ${workshop.address}`}</span>
                <span className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-500" />{workshop.rating?.toFixed(1) || 0} ({workshop.reviewsCount} отзывов)</span>
                {workshop.source && <span className="text-xs">Источник: {workshop.source}</span>}
              </div>
              {workshop.phone && (
                <a href={`tel:${workshop.phone}`} className="flex gap-2 mt-1 items-center underline text-sm">
                  <Phone className="h-4 w-4" />{workshop.phone}
                </a>
              )}
              {workshop.website && (
                 <a href={workshop.website} target="_blank" rel="noopener noreferrer" className="flex gap-2 mt-1 items-center underline text-sm text-primary">
                    <Wrench className="h-4 w-4" />
                    Перейти на сайт
                </a>
              )}
            </div>
          </div>
        </CardHeader>
        {workshop.description && (
            <CardContent>
                <p className="text-muted-foreground">{workshop.description}</p>
            </CardContent>
        )}
      </Card>
      
      {/* Отзывы */}
       <Card>
          <CardHeader>
              <CardTitle>Отзывы ({workshop.reviewsCount})</CardTitle>
          </CardHeader>
          <CardContent>
              {/* Форма добавления отзыва */}
               <div className="mb-8">
                    {user ? (
                        <div className="space-y-4">
                             <h3 className="font-semibold">Оставить отзыв</h3>
                             {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4"/><AlertDescription>{error}</AlertDescription></Alert>}
                             {success && <Alert className="bg-green-100 dark:bg-green-900"><AlertDescription>{success}</AlertDescription></Alert>}
                             <div className="flex items-center gap-2">
                                 {[1,2,3,4,5].map(star => (
                                     <Star 
                                        key={star}
                                        className={`h-6 w-6 cursor-pointer ${reviewRating >= star ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`}
                                        onClick={() => setReviewRating(star)}
                                     />
                                 ))}
                             </div>
                             <Textarea
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                placeholder="Напишите ваш отзыв..."
                                rows={4}
                                disabled={sending}
                             />
                            <Button onClick={handleAddReview} disabled={sending}>
                               {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Отправить отзыв
                            </Button>
                        </div>
                    ) : (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                <Link href="/auth" className="underline">Войдите</Link>, чтобы оставить отзыв.
                            </AlertDescription>
                        </Alert>
                    )}
               </div>

              {/* Список отзывов */}
              <div className="space-y-6">
                {reviews.length > 0 ? reviews.map(review => (
                     <div key={review.id} className="flex gap-4">
                        <Avatar>
                            <AvatarImage src={review.userAvatar} />
                            <AvatarFallback>{review.userName?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                             <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold">{review.userName}</span>
                                <span className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
                             </div>
                              <div className="flex items-center gap-1 mb-2">
                                 {[1,2,3,4,5].map(star => (
                                     <Star 
                                        key={star}
                                        className={`h-4 w-4 ${review.rating >= star ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`}
                                     />
                                 ))}
                             </div>
                             <p className="text-muted-foreground whitespace-pre-line break-words">{review.text}</p>
                        </div>
                     </div>
                )) : (
                    <p className="text-center text-muted-foreground py-8">Отзывов пока нет. Будьте первым!</p>
                )}
              </div>
          </CardContent>
       </Card>
    </div>
  );
}
