
// src/app/workshops/[id]/page.tsx
'use server';

import { adminDb } from '@/lib/firebase-admin';
import type { Workshop, Review } from '@/lib/types';
import { notFound } from 'next/navigation';
import WorkshopDetailClient from './_components/WorkshopDetailClient';

export const dynamic = 'force-dynamic';


async function getWorkshopData(workshopId: string): Promise<{ workshop: Workshop | null, reviews: Review[] }> {
    try {
        const workshopDocRef = adminDb.collection('workshops').doc(workshopId);
        const workshopDocSnap = await workshopDocRef.get();

        if (!workshopDocSnap.exists) {
            return { workshop: null, reviews: [] };
        }

        const workshop = { id: workshopDocSnap.id, ...workshopDocSnap.data() } as Workshop;

        const reviewsQuery = adminDb.collection('workshopReviews')
            .where('workshopId', '==', workshopId)
            .orderBy('createdAt', 'desc');

        const reviewsSnapshot = await reviewsQuery.get();
        const reviews = reviewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
        
        return { workshop, reviews };
    } catch (error) {
        console.error("Error fetching workshop data:", error);
        return { workshop: null, reviews: [] };
    }
}


export default async function WorkshopPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const { workshop, reviews } = await getWorkshopData(id);

    if (!workshop) {
        notFound();
    }
    
    return <WorkshopDetailClient initialWorkshop={workshop} initialReviews={reviews} />
}
