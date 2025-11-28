// src/app/events/[id]/page.tsx
// Детальная страница конкретного события
// Показывает полную информацию о событии, позволяет зарегистрироваться или отменить участие
// Отображает список участников и карту местоположения
// Gemini: динамический роут - [id] заменяется на реальный ID события из URL

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, increment, collection, query, where, getDocs } from 'firebase/firestore';
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
  Settings
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { Event } from '@/lib/types';


// Интерфейс участника
interface Participant {
  id: string;
  displayName: string;
  photoURL?: string;
  registeredAt?: any;
}

function EventDetailClient({ eventId }: { eventId: string }) {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();

  // Состояния
  const [event, setEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isParticipant, setIsParticipant] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  // Загрузка данных события
  useEffect(() => {
    if (eventId && firestore) {
      fetchEventData();
    }
  }, [eventId, user, firestore]);

  // Функция загрузки всех данных события
  // Gemini: загружаем документ события и список участников из Firestore
  const fetchEventData = async () => {
    if (!firestore) return;
    try {
      setLoading(true);

      // Загружаем данные события
      const eventDoc = await getDoc(doc(firestore, 'events', eventId));

      if (!eventDoc.exists()) {
        router.push('/404');
        return;
      }

      const eventData = {
        id: eventDoc.id,
        ...eventDoc.data()
      } as Event;

      setEvent(eventData);

      // Проверяем статус пользователя
      if (user) {
        setIsParticipant(eventData.participantIds?.includes(user.uid) || false);
        setIsOrganizer(eventData.organizerId === user.uid);
      }

      // Загружаем участников
      if(eventData.participantIds && eventData.participantIds.length > 0) {
        await fetchParticipants(eventData.participantIds);
      }

    } catch (error) {
      console.error('Ошибка загрузки события:', error);
    } finally {
      setLoading(false);
    }
  };

  // Функция загрузки информации об участниках
  // Gemini: получаем данные пользователей по их ID из коллекции users
  const fetchParticipants = async (participantIds: string[]) => {
    if (!firestore) return;
    try {
      if (participantIds.length === 0) {
        setParticipants([]);
        return;
      }

      const participantsData: Participant[] = [];
      
      // Firestore ограничивает "in" запросы до 10 элементов
      const chunks = [];
      for (let i = 0; i < Math.min(participantIds.length, 50); i += 10) {
        chunks.push(participantIds.slice(i, i + 10));
      }

      for (const chunk of chunks) {
        const q = query(
          collection(firestore, 'users'),
          where('__name__', 'in', chunk)
        );

        const querySnapshot = await getDocs(q);
        querySnapshot.docs.forEach(doc => {
          participantsData.push({
            id: doc.id,
            displayName: doc.data().displayName || 'Пользователь',
            photoURL: doc.data().photoURL,
            registeredAt: doc.data().registeredAt
          });
        });
      }

      setParticipants(participantsData);
    } catch (error) {
      console.error('Ошибка загрузки участников:', error);
    }
  };

  // Функция регистрации на событие
  // Gemini: добавляем ID пользователя в массив participantIds и увеличиваем счетчик
  const handleRegister = async () => {
    if (!user || !event || !firestore) return;

    // Проверка на лимит участников
    if (event.maxParticipants && event.participantsCount >= event.maxParticipants) {
      alert('Достигнуто максимальное количество участников');
      return;
    }

    try {
      const eventRef = doc(firestore, 'events', eventId);

      await updateDoc(eventRef, {
        participantIds: arrayUnion(user.uid),
        participantsCount: increment(1)
      });

      // Обновляем локальное состояние
      setIsParticipant(true);
      setEvent({
        ...event,
        participantsCount: event.participantsCount + 1,
        participantIds: [...event.participantIds, user.uid]
      });

      setParticipants([...participants, {
        id: user.uid,
        displayName: user.displayName || 'Пользователь',
        photoURL: user.photoURL || undefined,
        registeredAt: new Date()
      }]);

    } catch (error) {
      console.error('Ошибка регистрации:', error);
    }
  };

  // Функция отмены участия
  // Gemini: удаляем ID пользователя из массива participantIds и уменьшаем счетчик
  const handleUnregister = async () => {
    if (!user || !event || isOrganizer || !firestore) return;

    try {
      const eventRef = doc(firestore, 'events', eventId);

      await updateDoc(eventRef, {
        participantIds: arrayRemove(user.uid),
        participantsCount: increment(-1)
      });

      // Обновляем локальное состояние
      setIsParticipant(false);
      setEvent({
        ...event,
        participantsCount: event.participantsCount - 1,
        participantIds: event.participantIds.filter(id => id !== user.uid)
      });

      setParticipants(participants.filter(p => p.id !== user.uid));

    } catch (error) {
      console.error('Ошибка отмены участия:', error);
    }
  };

  // Функция поделиться событием
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title,
          text: event?.description,
          url: window.location.href
        });
      } catch (error) {
        console.log('Ошибка при попытке поделиться:', error);
      }
    } else {
      // Копируем ссылку в буфер обмена
      navigator.clipboard.writeText(window.location.href);
      alert('Ссылка скопирована в буфер обмена');
    }
  };

  // Форматирование даты и времени
  const formatDateTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  // Проверка, прошло ли событие
  const isPastEvent = () => {
    if (!event?.startDate) return false;
    const startDate = event.startDate.toDate ? event.startDate.toDate() : new Date(event.startDate);
    return startDate < new Date();
  };

  // UI загрузки
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Загрузка события...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Событие не найдено</h2>
          <Link href="/events">
            <Button>Вернуться к списку событий</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Изображение события */}
      {event.imageUrl && (
        <div className="w-full h-64 md:h-96 relative overflow-hidden">
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Кнопка назад */}
        <Link href="/events">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад к событиям
          </Button>
        </Link>

        {/* Шапка события */}
        <div className="flex flex-col lg:flex-row gap-8 mb-8">
          <div className="flex-1">
            {/* Название и категория */}
            <div className="flex flex-wrap items-start gap-3 mb-4">
              <h1 className="text-3xl md:text-4xl font-bold">{event.title}</h1>
              <Badge>{event.category}</Badge>
              {isPastEvent() && (
                <Badge variant="secondary">Завершено</Badge>
              )}
            </div>

            {/* Описание */}
            <p className="text-muted-foreground text-lg mb-6">{event.description}</p>

            {/* Информация о дате и месте */}
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-semibold">Дата начала</p>
                  <p className="text-muted-foreground">{formatDateTime(event.startDate)}</p>
                </div>
              </div>

              {event.endDate && (
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-semibold">Дата окончания</p>
                    <p className="text-muted-foreground">{formatDateTime(event.endDate)}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-semibold">Место проведения</p>
                  <p className="text-muted-foreground">{event.location}</p>
                  {event.address && (
                    <p className="text-sm text-muted-foreground">{event.address}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-semibold">Участники</p>
                  <p className="text-muted-foreground">
                    {event.participantsCount} {event.maxParticipants && `из ${event.maxParticipants}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Организатор */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Организатор</CardTitle>
              </CardHeader>
              <CardContent>
                <Link href={`/profile/${event.organizerId}`}>
                  <div className="flex items-center gap-3 hover:bg-accent p-2 rounded-lg cursor-pointer">
                    <Avatar>
                      {event.organizerAvatar && <AvatarImage src={event.organizerAvatar} />}
                      <AvatarFallback>{event.organizerName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{event.organizerName}</p>
                      <p className="text-sm text-muted-foreground">Перейти к профилю</p>
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Боковая панель с действиями */}
          <div className="lg:w-80 space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-3">
                {user ? (
                  <>
                    {!isPastEvent() && (
                      <>
                        {!isParticipant ? (
                          <Button 
                            onClick={handleRegister} 
                            size="lg" 
                            className="w-full"
                            disabled={event.maxParticipants ? event.participantsCount >= event.maxParticipants : false}
                          >
                            <UserPlus className="mr-2 h-5 w-5" />
                            {event.maxParticipants && event.participantsCount >= event.maxParticipants 
                              ? 'Мест нет' 
                              : 'Зарегистрироваться'}
                          </Button>
                        ) : (
                          <>
                            {!isOrganizer && (
                              <Button
                                onClick={handleUnregister}
                                variant="outline"
                                size="lg"
                                className="w-full"
                              >
                                <UserMinus className="mr-2 h-5 w-5" />
                                Отменить участие
                              </Button>
                            )}
                            <Alert>
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>
                                {isOrganizer ? 'Вы организатор' : 'Вы зарегистрированы'}
                              </AlertDescription>
                            </Alert>
                          </>
                        )}
                      </>
                    )}

                    <Button
                      onClick={handleShare}
                      variant="outline"
                      size="lg"
                      className="w-full"
                    >
                      <Share2 className="mr-2 h-5 w-5" />
                      Поделиться
                    </Button>

                    {isOrganizer && (
                      <Link href={`/events/${eventId}/settings`}>
                        <Button variant="outline" size="lg" className="w-full">
                          <Settings className="mr-2 h-5 w-5" />
                          Настройки
                        </Button>
                      </Link>
                    )}
                  </>
                ) : (
                  <Link href="/auth">
                    <Button size="lg" className="w-full">
                      <UserPlus className="mr-2 h-5 w-5" />
                      Войти для регистрации
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Предупреждение о лимите участников */}
            {event.maxParticipants && (
              <Alert variant={event.participantsCount >= event.maxParticipants ? 'destructive' : 'default'}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Осталось мест: {Math.max(0, event.maxParticipants - event.participantsCount)}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        {/* Вкладки с подробностями */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="details">Подробности</TabsTrigger>
            <TabsTrigger value="schedule">Программа</TabsTrigger>
            <TabsTrigger value="participants">Участники</TabsTrigger>
          </TabsList>

          {/* Вкладка: Подробности */}
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Описание события</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {event.fullDescription || event.description}
                  </p>
                </div>

                {event.requirements && (
                  <div>
                    <h3 className="font-semibold mb-2">Требования к участникам</h3>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {event.requirements}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Вкладка: Программа */}
          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle>Программа мероприятия</CardTitle>
              </CardHeader>
              <CardContent>
                {event.schedule ? (
                  <p className="text-muted-foreground whitespace-pre-line">
                    {event.schedule}
                  </p>
                ) : (
                  <p className="text-muted-foreground">
                    Программа мероприятия пока не опубликована
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Вкладка: Участники */}
          <TabsContent value="participants">
            <Card>
              <CardHeader>
                <CardTitle>Участники ({event.participantsCount})</CardTitle>
              </CardHeader>
              <CardContent>
                {participants.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Участников пока нет. Станьте первым!
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {participants.map(participant => (
                      <Link key={participant.id} href={`/profile/${participant.id}`}>
                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer">
                          <Avatar>
                            {participant.photoURL && <AvatarImage src={participant.photoURL} />}
                            <AvatarFallback>{participant.displayName[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-semibold">{participant.displayName}</p>
                            {participant.id === event.organizerId && (
                              <Badge variant="secondary" className="text-xs">
                                Организатор
                              </Badge>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default async function EventDetailPage({ params }: { params: { id: string } }) {
    const { id } = params;
    return <EventDetailClient eventId={id} />
}
