
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  ArrowLeft, 
  UserPlus, 
  UserMinus,
  Share2,
  AlertCircle,
  Settings,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { Event, User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface EventDetailClientProps {
    initialEvent: Event;
    initialParticipants: User[];
}

export default function EventDetailClient({ initialEvent, initialParticipants }: EventDetailClientProps) {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [event, setEvent] = useState<Event>(initialEvent);
  const [participants, setParticipants] = useState<User[]>(initialParticipants);
  const [loading, setLoading] = useState(false); // For actions, not initial load
  const [isParticipant, setIsParticipant] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (user && event) {
      setIsParticipant(event.participantIds?.includes(user.uid) || false);
      setIsOrganizer(event.organizerId === user.uid);
    } else {
        setIsParticipant(false);
        setIsOrganizer(false);
    }
  }, [user, event]);

  const handleRegister = async () => {
    if (!user || !event || !firestore) return;
    if (event.maxParticipants && event.participantsCount >= event.maxParticipants) {
      alert('Достигнуто максимальное количество участников');
      return;
    }
    setLoading(true);
    try {
      const eventRef = doc(firestore, 'events', event.id);
      await updateDoc(eventRef, {
        participantIds: arrayUnion(user.uid),
        participantsCount: increment(1)
      });
      setEvent(prev => ({ ...prev!, participantsCount: prev!.participantsCount + 1, participantIds: [...prev!.participantIds, user.uid] }));
      setIsParticipant(true);
    } catch (error) {
      console.error('Ошибка регистрации:', error);
    } finally {
        setLoading(false);
    }
  };

  const handleUnregister = async () => {
    if (!user || !event || isOrganizer || !firestore) return;
    setLoading(true);
    try {
      const eventRef = doc(firestore, 'events', event.id);
      await updateDoc(eventRef, {
        participantIds: arrayRemove(user.uid),
        participantsCount: increment(-1)
      });
      setEvent(prev => ({ ...prev!, participantsCount: prev!.participantsCount - 1, participantIds: prev!.participantIds.filter(id => id !== user.uid) }));
      setIsParticipant(false);
    } catch (error) {
      console.error('Ошибка отмены участия:', error);
    } finally {
        setLoading(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: event.title,
      text: `Присоединяйтесь к событию: ${event.title}`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast({ title: 'Успешно!', description: 'Событие отправлено.' });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({ title: 'Ссылка скопирована!' });
      }
    } catch (error) {
      console.error('Ошибка при попытке поделиться:', error);
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Не удалось поделиться событием.' });
    }
  };

  const formatDateTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  const isPastEvent = () => {
    if (!event?.startDate) return false;
    const startDate = event.startDate.toDate ? event.startDate.toDate() : new Date(event.startDate);
    return startDate < new Date();
  };

  const eventId = event.id;

  return (
    <div className="min-h-screen">
      {event.imageUrl && (
        <div className="w-full h-64 md:h-96 relative overflow-hidden">
          <Image src={event.imageUrl} alt={event.title} fill className="object-cover" priority />
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <Link href="/events">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад к событиям
          </Button>
        </Link>

        <div className="flex flex-col lg:flex-row gap-8 mb-8">
          <div className="flex-1">
            <div className="flex flex-wrap items-start gap-3 mb-4">
              <h1 className="text-3xl md:text-4xl font-bold">{event.title}</h1>
              <Badge>{event.category}</Badge>
              {isPastEvent() && (<Badge variant="secondary">Завершено</Badge>)}
            </div>
            <p className="text-muted-foreground text-lg mb-6">{event.description}</p>
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3"><Calendar className="h-5 w-5 text-muted-foreground mt-0.5" /><div><p className="font-semibold">Дата начала</p><p className="text-muted-foreground">{formatDateTime(event.startDate)}</p></div></div>
              {event.endDate && (<div className="flex items-start gap-3"><Clock className="h-5 w-5 text-muted-foreground mt-0.5" /><div><p className="font-semibold">Дата окончания</p><p className="text-muted-foreground">{formatDateTime(event.endDate)}</p></div></div>)}
              <div className="flex items-start gap-3"><MapPin className="h-5 w-5 text-muted-foreground mt-0.5" /><div><p className="font-semibold">Место проведения</p><p className="text-muted-foreground">{event.location}</p>{event.address && (<p className="text-sm text-muted-foreground">{event.address}</p>)}</div></div>
              <div className="flex items-start gap-3"><Users className="h-5 w-5 text-muted-foreground mt-0.5" /><div><p className="font-semibold">Участники</p><p className="text-muted-foreground">{event.participantsCount} {event.maxParticipants && `из ${event.maxParticipants}`}</p></div></div>
            </div>
            <Card className="mb-6"><CardHeader><CardTitle className="text-lg">Организатор</CardTitle></CardHeader><CardContent><Link href={`/profile/${event.organizerId}`}><div className="flex items-center gap-3 hover:bg-accent p-2 rounded-lg cursor-pointer"><Avatar>{event.organizerAvatar && <AvatarImage src={event.organizerAvatar} />}{event.organizerName && <AvatarFallback>{event.organizerName[0]}</AvatarFallback>}</Avatar><div><p className="font-semibold">{event.organizerName}</p><p className="text-sm text-muted-foreground">Перейти к профилю</p></div></div></Link></CardContent></Card>
          </div>

          <div className="lg:w-80 space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-3">
                {user ? (
                  <>
                    {!isPastEvent() && (
                      <>
                        {!isParticipant ? (
                          <Button onClick={handleRegister} size="lg" className="w-full" disabled={loading || (event.maxParticipants ? event.participantsCount >= event.maxParticipants : false)}>
                            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <UserPlus className="mr-2 h-5 w-5" />}
                            {event.maxParticipants && event.participantsCount >= event.maxParticipants ? 'Мест нет' : 'Зарегистрироваться'}
                          </Button>
                        ) : (
                          <>
                            {!isOrganizer && (<Button onClick={handleUnregister} variant="outline" size="lg" className="w-full" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <UserMinus className="mr-2 h-5 w-5" />}
                                Отменить участие
                              </Button>
                            )}
                            <Alert><AlertCircle className="h-4 w-4" /><AlertDescription>{isOrganizer ? 'Вы организатор' : 'Вы зарегистрированы'}</AlertDescription></Alert>
                          </>
                        )}
                      </>
                    )}
                    <Button onClick={handleShare} variant="outline" size="lg" className="w-full"><Share2 className="mr-2 h-5 w-5" />Поделиться</Button>
                    {isOrganizer && (<Link href={`/events/${eventId}/settings`}><Button variant="outline" size="lg" className="w-full"><Settings className="mr-2 h-5 w-5" />Настройки</Button></Link>)}
                  </>
                ) : (
                  <Link href="/auth"><Button size="lg" className="w-full"><UserPlus className="mr-2 h-5 w-5" />Войти для регистрации</Button></Link>
                )}
              </CardContent>
            </Card>
            {event.maxParticipants && (<Alert variant={event.participantsCount >= event.maxParticipants ? 'destructive' : 'default'}><AlertCircle className="h-4 w-4" /><AlertDescription>Осталось мест: {Math.max(0, event.maxParticipants - event.participantsCount)}</AlertDescription></Alert>)}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6"><TabsTrigger value="details">Подробности</TabsTrigger><TabsTrigger value="schedule">Программа</TabsTrigger><TabsTrigger value="participants">Участники</TabsTrigger></TabsList>
          <TabsContent value="details"><Card><CardHeader><CardTitle>Описание события</CardTitle></CardHeader><CardContent className="space-y-4"><div><p className="text-muted-foreground whitespace-pre-line">{event.fullDescription || event.description}</p></div>{event.requirements && (<div><h3 className="font-semibold mb-2">Требования к участникам</h3><p className="text-muted-foreground whitespace-pre-line">{event.requirements}</p></div>)}</CardContent></Card></TabsContent>
          <TabsContent value="schedule"><Card><CardHeader><CardTitle>Программа мероприятия</CardTitle></CardHeader><CardContent>{event.schedule ? (<p className="text-muted-foreground whitespace-pre-line">{event.schedule}</p>) : (<p className="text-muted-foreground">Программа мероприятия пока не опубликована</p>)}</CardContent></Card></TabsContent>
          <TabsContent value="participants"><Card><CardHeader><CardTitle>Участники ({event.participantsCount})</CardTitle></CardHeader><CardContent>{participants.length === 0 ? (<p className="text-muted-foreground text-center py-8">Участников пока нет. Станьте первым!</p>) : (<div className="grid grid-cols-1 md:grid-cols-2 gap-4">{participants.map(participant => (<Link key={participant.id} href={`/profile/${participant.id}`}><div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer"><Avatar>{participant.photoURL && <AvatarImage src={participant.photoURL} />}{participant.displayName && <AvatarFallback>{participant.displayName[0]}</AvatarFallback>}</Avatar><div className="flex-1"><p className="font-semibold">{participant.displayName}</p>{participant.id === event.organizerId && (<Badge variant="secondary" className="text-xs">Организатор</Badge>)}</div></div></Link>))}</div>)}</CardContent></Card></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
