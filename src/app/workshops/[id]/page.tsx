
// src/app/workshops/[id]/page.tsx
import { getAdminDb } from '@/lib/firebase-admin';
import type { Workshop, Review } from '@/lib/types';
import { notFound } from 'next/navigation';
import WorkshopDetailClient from './_components/WorkshopDetailClient';
import { serializeFirestoreData } from '@/lib/utils';
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';


async function getWorkshopData(workshopId: string): Promise<{ workshop: Workshop | null, reviews: Review[] }> {
    try {
        const adminDb = getAdminDb();
        if (!adminDb) {
            console.error("Firebase Admin not initialized");
            notFound();
        }
        const workshopDocRef = adminDb.collection('workshops').doc(workshopId);
        const workshopDocSnap = await workshopDocRef.get();

        if (!workshopDocSnap.exists) {
            notFound();
        }

        const workshop = serializeFirestoreData({ id: workshopDocSnap.id, ...workshopDocSnap.data() } as Workshop);

        const reviewsQuery = adminDb.collection('workshopReviews')
            .where('workshopId', '==', workshopId)
            .orderBy('createdAt', 'desc');

        const reviewsSnapshot = await reviewsQuery.get();
        const reviews = reviewsSnapshot.docs.map((doc: QueryDocumentSnapshot) => serializeFirestoreData({ id: doc.id, ...doc.data() } as Review));
        
        return { workshop, reviews };
    } catch (error) {
        console.error("Error fetching workshop data:", error);
        notFound();
    }
}


export default async function WorkshopPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { workshop } = await getWorkshopData(id);

    return <WorkshopDetailClient initialWorkshop={workshop!} />
}

