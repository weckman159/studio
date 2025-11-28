
// src/app/car/[id]/page.tsx
'use server';

import { adminDb } from '@/lib/firebase-admin';
import type { Car, TimelineEntry } from '@/lib/types';
import CarDetailClient from './_components/CarDetailClient';
import { notFound } from 'next/navigation';

async function getCarData(carId: string): Promise<{ car: Car | null, timeline: TimelineEntry[] }> {
    try {
        const carRef = adminDb.collection('cars').doc(carId);
        
        const carSnap = await carRef.get();
        if (!carSnap.exists) {
            return { car: null, timeline: [] };
        }
        const car = { id: carSnap.id, ...carSnap.data() } as Car;

        const timelineRef = carRef.collection('timeline');
        const timelineQuery = timelineRef.orderBy('date', 'desc');
        const timelineSnap = await timelineQuery.get();
        const timeline = timelineSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as TimelineEntry));

        return { car, timeline };

    } catch (error) {
        console.error("Error fetching car data on server:", error);
        return { car: null, timeline: [] };
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
