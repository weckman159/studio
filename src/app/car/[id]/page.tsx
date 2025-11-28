// src/app/car/[id]/page.tsx
import type { Car, TimelineEntry } from '@/lib/types';
import CarDetailClient from './_components/CarDetailClient';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getAdminDb } from '@/lib/firebase-admin';

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
    const timeline = timelineSnap.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as TimelineEntry));

    return { car, timeline };
  } catch (error) {
    console.error("Error fetching car data:", error);
    return { car: null, timeline: [] };
  }
}

// Динамические метаданные
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const { car } = await getCarData(params.id);
    if (!car) return { title: 'Автомобиль не найден' };
    return {
      title: `${car.brand} ${car.model} ${car.year} | AutoSphere`,
      description: car.description || `${car.brand} ${car.model} - подробная информация`,
    };
  } catch {
    return { title: 'AutoSphere' };
  }
}

export default async function CarPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { car, timeline } = await getCarData(id);

  if (!car) {
    notFound();
  }

  return <CarDetailClient initialCar={car} initialTimeline={timeline} />;
}
