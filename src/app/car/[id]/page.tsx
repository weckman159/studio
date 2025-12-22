// src/app/car/[id]/page.tsx
import type { Car, TimelineEntry } from '@/lib/types';
import CarDetailClient from './_components/CarDetailClient';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getAdminDb } from '@/lib/firebase-admin';
import { serializeFirestoreData } from '@/lib/utils';
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getCarData(carId: string): Promise<{ car: Car | null, timeline: TimelineEntry[] }> {
  try {
    const adminDb = getAdminDb();

    const carRef = adminDb.collection('cars').doc(carId);
    const carSnap = await carRef.get();

    if (!carSnap.exists) {
      notFound();
    }

    const car = { id: carSnap.id, ...carSnap.data() } as Car;

    // Fetch timeline subcollection
    const timelineRef = carRef.collection('timeline');
    const timelineQuery = timelineRef.orderBy('date', 'desc');
    const timelineSnap = await timelineQuery.get();
    
    const timeline = timelineSnap.docs.map((doc: QueryDocumentSnapshot) => 
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
  // ПОЧЕМУ ИСПРАВЛЕНО: В Next.js 15 params является Promise. Используем await.
  const { id } = await params;
  const { car, timeline } = await getCarData(id);

  if (!car) {
    notFound();
  }

  return (
    <div className="p-4 md:p-8">
      <CarDetailClient initialCar={car} initialTimeline={timeline} />
    </div>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ id:string }> }): Promise<Metadata> {
  // ПОЧЕМУ ИСПРАВЛЕНО: В Next.js 15 params является Promise. Используем await.
  const { id } = await params;
  const { car } = await getCarData(id);

  if (!car) return { title: 'Автомобиль не найден' };

  const title = `${car.brand} ${car.model} ${car.year}`;
  const description = `${car.engine || ''}, ${car.specs?.mileage?.toLocaleString() || '?'} км. Бортжурнал и история обслуживания на AutoSphere.`;
  const image = car.photoUrl || (car.photos && car.photos.length > 0 ? car.photos[0] : undefined);

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
