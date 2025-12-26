// src/app/car/[id]/page.tsx
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getAdminDb } from '@/lib/firebase-admin';
import { carConverter, timelineEntryConverter } from '@/lib/firestore-converters';
import type { Car, TimelineEntry } from '@/lib/types';
import CarDetailClient from './_components/CarDetailClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getCarData(carId: string): Promise<{ car: Car | null, timeline: TimelineEntry[] }> {
  try {
    const adminDb = getAdminDb();

    // ПОЧЕМУ ИСПРАВЛЕНО: Применяем конвертер для получения строго типизированных данных.
    const carRef = adminDb.collection('cars').doc(carId).withConverter(carConverter);
    const carSnap = await carRef.get();

    if (!carSnap.exists) {
      notFound();
    }
    const car = carSnap.data(); // `serializeFirestoreData` больше не нужен, т.к. конвертер делает всю работу.

    // ПОЧЕМУ ИСПРАВЛЕНО: Применяем конвертер к подколлекции.
    const timelineQuery = carRef.collection('timeline').orderBy('date', 'desc').withConverter(timelineEntryConverter);
    const timelineSnap = await timelineQuery.get();
    
    // `serializeFirestoreData` больше не нужен.
    const timeline = timelineSnap.docs.map(doc => doc.data());

    return { car, timeline };
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

  // Данные уже типизированы и сериализованы конвертером
  return (
    <div className="p-4 md:p-8">
      <CarDetailClient initialCar={car} initialTimeline={timeline} />
    </div>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ id:string }> }): Promise<Metadata> {
  const { id } = await params;
  const { car } = await getCarData(id);

  if (!car) return { title: 'Автомобиль не найден' };

  const title = `${car.brand} ${car.model} ${car.year}`;
  const description = `${car.engine || ''}, ${car.specs?.mileage?.toLocaleString() || '?'} км. Бортжурнал и история обслуживания на AutoSphere.`;
  const image = car.photoUrl || (car.photos && car.photos.length > 0 ? car.photos[0]?.url : undefined);

  return {
    title: `${title} | Гараж AutoSphere`,
    description: description,
    openGraph: {
      title: title,
      description: description,
      images: image ? [image] : [],
    },
  };
}
