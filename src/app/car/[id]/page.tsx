
// src/app/car/[id]/page.tsx
import type { Car, TimelineEntry } from '@/lib/types';
import CarDetailClient from './_components/CarDetailClient';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getAdminDb } from '@/lib/firebase-admin';
import { serializeFirestoreData } from '@/lib/utils';

// Критически важно для динамического рендеринга
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Динамический импорт Firebase Admin только при выполнении
async function getCarData(carId: string): Promise<{ car: Car | null, timeline: TimelineEntry[] }> {
  try {
    const adminDb = getAdminDb();

    const carRef = adminDb.collection('cars').doc(carId);
    const carSnap = await carRef.get();

    if (!carSnap.exists) {
      return { car: null, timeline: [] };
    }

    const car = { id: carSnap.id, ...carSnap.data() } as Car;

    const timelineRef = carRef.collection('timeline');
    const timelineQuery = timelineRef.orderBy('date', 'desc');
    const timelineSnap = await timelineQuery.get();
    
    const timeline = timelineSnap.docs.map((doc: any) => 
        serializeFirestoreData({ id: doc.id, ...doc.data() }) as TimelineEntry
    );

    return { 
        car: serializeFirestoreData(car), 
        timeline 
    };
  } catch (error) {
    console.error("Error fetching car data on server:", error);
    return { car: null, timeline: [] };
  }
}

export default async function CarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { car, timeline } = await getCarData(id);

  if (!car) {
    notFound();
  }

  return <CarDetailClient initialCar={car} initialTimeline={timeline} />;
}

// Добавляем генерацию метаданных
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { car } = await getCarData(id); // Используем существующую функцию

  if (!car) return { title: 'Автомобиль не найден' };

  const title = `${car.brand} ${car.model} ${car.year}`;
  const description = `${car.engine}, ${car.specs?.currentHP || '?'} л.с. Бортжурнал и история обслуживания на AutoSphere.`;
  const image = car.photoUrl || car.photos?.[0] || 'https://autosphere.app/default-og.jpg'; // Замените на свой дефолт

  return {
    title: `${title} | Гараж AutoSphere`,
    description: description,
    openGraph: {
      title: title,
      description: description,
      images: [image],
    },
  };
}
