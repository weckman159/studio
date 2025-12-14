'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { doc, collection, addDoc, query, orderBy, onSnapshot, updateDoc, serverTimestamp, increment } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Phone, Globe, Star, Clock, Navigation, Send } from 'lucide-react';
import { Workshop, Review } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import images from '@/app/lib/placeholder-images.json';

export default function WorkshopDetailClient({ initialWorkshop }: { initialWorkshop: Workshop }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  
  // Review State
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Real-time reviews
  useEffect(() => {
    if (!firestore) return;
    const q = query(collection(firestore, 'workshops', initialWorkshop.id, 'reviews'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
        setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() } as Review)));
    });
    return () => unsub();
  }, [firestore, initialWorkshop.id]);

  const handleSubmitReview = async () => {
      if (!user || !reviewText.trim()) return;
      setSubmitting(true);
      try {
          // 1. Add review
          await addDoc(collection(firestore, 'workshops', initialWorkshop.id, 'reviews'), {
              userId: user.uid,
              userName: user.displayName || 'User',
              userAvatar: user.photoURL,
              rating,
              text: reviewText,
              createdAt: serverTimestamp()
          });

          // 2. Update average rating (Simple approximation for client-side)
          // In production, use Cloud Functions for precise math
          await updateDoc(doc(firestore, 'workshops', initialWorkshop.id), {
              reviewsCount: increment(1)
          });

          setReviewText('');
          toast({ title: 'Отзыв опубликован!' });
      } catch (e) {
          console.error(e);
          toast({ variant: 'destructive', title: 'Ошибка' });
      } finally {
          setSubmitting(false);
      }
  };

  const workshopImage = images.workshopDefault;
  const mapImage = images.workshopDefault;

  return (
    <div className="min-h-screen pb-10">
        {/* Header Image */}
        <div className="relative h-[300px] md:h-[400px] w-full bg-muted">
            <Image 
                src={initialWorkshop.imageUrl || workshopImage.src} 
                alt={initialWorkshop.name} 
                fill 
                className="object-cover"
                data-ai-hint={workshopImage.hint}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
            
            <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full">
                <div className="flex justify-between items-end">
                    <div>
                        <Badge className="mb-3">{initialWorkshop.specialization}</Badge>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">{initialWorkshop.name}</h1>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {initialWorkshop.city}, {initialWorkshop.address}
                        </div>
                    </div>
                    <div className="hidden md:block">
                         <div className="flex items-center gap-1 bg-background/80 backdrop-blur px-4 py-2 rounded-full">
                            <Star className="h-5 w-5 text-yellow-400 fill-current" />
                            <span className="font-bold text-lg">{initialWorkshop.rating.toFixed(1)}</span>
                            <span className="text-muted-foreground text-sm">({initialWorkshop.reviewsCount} отзывов)</span>
                         </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="container mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Info & Reviews */}
            <div className="lg:col-span-2 space-y-8">
                <Card>
                    <CardHeader><CardTitle>О мастерской</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground leading-relaxed">
                            {initialWorkshop.description || "Описание отсутствует."}
                        </p>
                    </CardContent>
                </Card>

                {/* Reviews Section */}
                <div>
                    <h3 className="text-2xl font-bold mb-4">Отзывы</h3>
                    
                    {/* Add Review Form */}
                    {user && (
                        <Card className="mb-6 bg-muted/30 border-dashed">
                            <CardContent className="p-4">
                                <div className="flex gap-1 mb-3">
                                    {[1,2,3,4,5].map(s => (
                                        <Star 
                                            key={s} 
                                            className={`h-6 w-6 cursor-pointer ${s <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                            onClick={() => setRating(s)}
                                        />
                                    ))}
                                </div>
                                <Textarea 
                                    placeholder="Поделитесь впечатлениями о сервисе..." 
                                    value={reviewText}
                                    onChange={e => setReviewText(e.target.value)}
                                    className="mb-3"
                                />
                                <Button onClick={handleSubmitReview} disabled={submitting || !reviewText}>
                                    Опубликовать
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    <div className="space-y-4">
                        {reviews.length === 0 && <p className="text-muted-foreground">Пока нет отзывов.</p>}
                        {reviews.map(review => (
                            <Card key={review.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Avatar>
                                            <AvatarImage src={review.userAvatar} />
                                            <AvatarFallback>{review.userName[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-semibold text-sm">{review.userName}</div>
                                            <div className="flex items-center">
                                                {Array.from({length: review.rating}).map((_, i) => (
                                                    <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="ml-auto text-xs text-muted-foreground">
                                            {review.createdAt?.toDate().toLocaleDateString()}
                                        </div>
                                    </div>
                                    <p className="text-sm">{review.text}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right: Contacts & Map */}
            <div className="space-y-6">
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <Phone className="h-5 w-5 text-primary" />
                            <span className="font-medium">{initialWorkshop.phone || "Нет телефона"}</span>
                        </div>
                        {initialWorkshop.website && (
                            <div className="flex items-center gap-3">
                                <Globe className="h-5 w-5 text-primary" />
                                <a href={initialWorkshop.website} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary">
                                    Перейти на сайт
                                </a>
                            </div>
                        )}
                         <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-primary" />
                            <span>Пн-Вс: 09:00 - 21:00</span>
                        </div>
                        <Button className="w-full gap-2">
                            <Navigation className="h-4 w-4" /> Построить маршрут
                        </Button>
                        <Button variant="outline" className="w-full gap-2">
                            <Send className="h-4 w-4" /> Написать сообщение
                        </Button>
                    </CardContent>
                </Card>
                
                {/* Fake Map */}
                <div className="w-full h-64 bg-muted rounded-xl flex items-center justify-center text-muted-foreground relative overflow-hidden group cursor-pointer">
                    <Image 
                        src={mapImage.src} 
                        alt="Map" 
                        fill 
                        className="object-cover opacity-50 group-hover:opacity-40 transition-opacity" 
                        data-ai-hint="city map"
                    />
                    <span className="relative z-10 font-semibold flex items-center gap-2">
                        <MapPin className="h-5 w-5" /> Показать на карте
                    </span>
                </div>
            </div>
        </div>
    </div>
  );
}
