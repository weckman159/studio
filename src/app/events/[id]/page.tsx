
// src/app/events/[id]/page.tsx
import { getAdminDb } from '@/lib/firebase-admin';
import type { Event, User } from '@/lib/types';
import { notFound } from 'next/navigation';
import EventDetailClient from './_components/EventDetailClient';
import { serializeFirestoreData } from '@/lib/utils';

export const dynamic = 'force-dynamic';

async function getEventData(eventId: string): Promise<{ event: Event | null, participants: User[] }> {
    try {
        const adminDb = getAdminDb();
        if (!adminDb) {
            console.error("Firebase Admin not initialized");
            return { event: null, participants: [] };
        }
        const eventDocRef = adminDb.collection('events').doc(eventId);
        const eventDocSnap = await eventDocRef.get();

        if (!eventDocSnap.exists) {
            notFound();
        }

        const event = serializeFirestoreData({ id: eventDocSnap.id, ...eventDocSnap.data() } as Event);

        const participants: User[] = [];
        if (event.participantIds && event.participantIds.length > 0) {
            const chunks: string[][] = [];
            for (let i = 0; i < event.participantIds.length; i += 10) {
                chunks.push(event.participantIds.slice(i, i + 10));
            }

            for (const chunk of chunks) {
                if(chunk.length > 0){
                    const usersQuery = adminDb.collection('users').where('__name__', 'in', chunk);
                    const usersSnapshot = await usersQuery.get();
                    usersSnapshot.forEach((doc: any) => {
                        participants.push(serializeFirestoreData({ id: doc.id, ...doc.data() } as User));
                    });
                }
            }
        }

        return { event, participants };
    } catch (error) {
        console.error("Error fetching event data:", error);
        notFound();
    }
}


export default async function EventDetailPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const { event, participants } = await getEventData(id);
    
    return <EventDetailClient initialEvent={event!} initialParticipants={participants} />
}
