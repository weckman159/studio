// src/app/marketplace/[id]/page.tsx
// Детальная страница товара на маркетплейсе
// Показывает полную информацию, фотографии, контакты продавца
// Gemini: динамический роут - [id] это ID объявления из Firestore

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Phone, 
  Mail, 
  MessageCircle,
  Share2,
  AlertCircle,
  Edit3,
  ShoppingCart
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Интерфейс полной информации о товаре
// Gemini: расширенная структура с контактами продавца
interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  fullDescription?: string;
  price: number;
  currency: string;
  category: string;
  condition: string;
  location: string;
  imageUrl?: string;
  gallery?: string[]; // Дополнительные фото
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  sellerPhone?: string;
  sellerEmail?: string;
  createdAt: any;
  views?: number; // Количество просмотров
}

function MarketplaceItemClient({ itemId }: { itemId: string }) {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();

  const [item, setItem] = useState<MarketplaceItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');

  // Загрузка данных товара
  useEffect(() => {
    if (itemId && firestore) {
      fetchItem();
    }
  }, [itemId, firestore]);

  // Функция загрузки товара из Firestore
  // Gemini: получаем документ объявления и увеличиваем счетчик просмотров
  const fetchItem = async () => {
    if (!firestore) return;
    try {
      setLoading(true);
      const itemDoc = await getDoc(doc(firestore, 'marketplace', itemId));

      if (!itemDoc.exists()) {
        router.push('/marketplace');
        return;
      }

      const itemData = {
        id: itemDoc.id,
        ...itemDoc.data()
      } as MarketplaceItem;

      setItem(itemData);
      setSelectedImage(itemData.imageUrl || itemData.gallery?.[0] || '');

      // TODO: Увеличить счетчик просмотров (опционально)
      // await updateDoc(doc(db, 'marketplace', itemId), {
      //   views: increment(1)
      // });

    } catch (error) {
      console.error('Ошибка загрузки товара:', error);
    } finally {
      setLoading(false);
    }
  };

  // Форматирование цены
  const formatPrice = (price: number, currency: string) => {
    return `${price.toLocaleString('ru-RU')} ${currency === 'RUB' ? '₽' : currency}`;
  };

  // Форматирование даты
  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  // Функция "Поделиться"
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item?.title,
          text: item?.description,
          url: window.location.href
        });
      } catch (error) {
        console.log('Ошибка при попытке поделиться:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Ссылка скопирована в буфер обмена');
    }
  };

  // Проверка, является ли текущий пользователь продавцом
  const isSeller = item && user && item.sellerId === user.uid;

  // UI загрузки
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Загрузка товара...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Товар не найден.
            <Link href="/marketplace" className="ml-2 underline">
              Вернуться к маркетплейсу
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const allImages = [item.imageUrl, ...(item.gallery || [])].filter(Boolean) as string[];

  return (
    <div>
      {/* Кнопка назад */}
      <Link href="/marketplace">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          К маркетплейсу
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Левая колонка - изображения */}
        <div className="lg:col-span-2 space-y-4">
          {/* Главное изображение */}
          <Card>
            <CardContent className="p-0">
              <div className="w-full aspect-video relative rounded-lg bg-muted">
              {selectedImage ? (
                <Image
                  src={selectedImage}
                  alt={item.title}
                  fill
                  className="object-contain rounded-lg"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingCart className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
              </div>
            </CardContent>
          </Card>

          {/* Галерея миниатюр */}
          {allImages.length > 1 && (
            <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`aspect-square rounded-md overflow-hidden border-2 ${
                    selectedImage === img ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <div className="w-full h-full relative">
                    <Image
                      src={img}
                      alt={`Фото ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Описание */}
          <Card>
            <CardHeader>
              <CardTitle>Описание</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-line">
                {item.fullDescription || item.description}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Правая колонка - цена и контакты */}
        <div className="lg:sticky lg:top-24 space-y-4 h-fit">
          {/* Цена и заголовок */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-2xl">{item.title}</CardTitle>
              </div>
              <CardDescription>
                <div className="text-3xl font-bold text-primary mt-2">
                  {formatPrice(item.price, item.currency)}
                </div>
              </CardDescription>
            </CardHeader>
             <CardContent>
                 <div className="space-y-3">
                    <div className="flex justify-between">
                    <span className="text-muted-foreground">Категория:</span>
                    <Badge variant="outline">{item.category}</Badge>
                    </div>
                    <div className="flex justify-between">
                    <span className="text-muted-foreground">Состояние:</span>
                    <span className="font-medium">{item.condition}</span>
                    </div>
                    <div className="flex justify-between">
                    <span className="text-muted-foreground">Местоположение:</span>
                    <span className="font-medium flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {item.location}
                    </span>
                    </div>
                    <div className="flex justify-between">
                    <span className="text-muted-foreground">Дата размещения:</span>
                    <span className="font-medium flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(item.createdAt)}
                    </span>
                    </div>
                    {item.views && (
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Просмотров:</span>
                        <span className="font-medium">{item.views}</span>
                    </div>
                    )}
              </div>
             </CardContent>
          </Card>
          
           {/* Продавец */}
          <Card>
            <CardHeader>
              <CardTitle>Продавец</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 <Link href={`/profile/${item.sellerId}`}>
                    <div className="flex items-center gap-3 hover:bg-accent p-2 rounded-lg cursor-pointer -m-2">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={item.sellerAvatar} />
                            <AvatarFallback>{item.sellerName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{item.sellerName}</p>
                            <p className="text-sm text-muted-foreground">Перейти к профилю</p>
                        </div>
                    </div>
                </Link>
                {item.sellerPhone && (
                  <Button variant="outline" className="w-full">
                    <Phone className="mr-2 h-4 w-4" />
                    {item.sellerPhone}
                  </Button>
                )}
                 {item.sellerEmail && (
                  <Button variant="outline" className="w-full">
                    <Mail className="mr-2 h-4 w-4" />
                    Написать на почту
                  </Button>
                )}
                 <Button className="w-full">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Написать продавцу
                </Button>
                 <Button variant="secondary" className="w-full" onClick={handleShare}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Поделиться
                </Button>
                 {isSeller && (
                  <Link href={`/marketplace/${itemId}/edit`} className="block">
                     <Button variant="destructive" className="w-full">
                         <Edit3 className="mr-2 h-4 w-4" />
                         Редактировать
                    </Button>
                  </Link>
                )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default async function MarketplaceItemPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <MarketplaceItemClient itemId={id} />
}
