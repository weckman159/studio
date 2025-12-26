
// src/app/events/[id]/page.tsx
import { getAdminDb } from '@/lib/firebase-admin';
import type { Event, User } from '@/lib/types';
import { notFound } from 'next/navigation';
import EventDetailClient from './_components/EventDetailClient';
import { eventConverter, userConverter } from '@/lib/firestore-converters';

export const dynamic = 'force-dynamic';

async function getEventData(eventId: string): Promise<{ event: Event | null, participants: User[] }> {
    try {
        const adminDb = getAdminDb();
        if (!adminDb) {
            console.error("Firebase Admin not initialized");
            notFound();
        }
        
        const eventDocRef = adminDb.collection('events').withConverter(eventConverter).doc(eventId);
        const eventDocSnap = await eventDocRef.get();

        if (!eventDocSnap.exists) {
            notFound();
        }

        const event = eventDocSnap.data();
        if (!event) notFound();

        const participants: User[] = [];
        if (event.participantIds && event.participantIds.length > 0) {
            const chunks: string[][] = [];
            // Firestore 'in' query has a limit of 30
            for (let i = 0; i < event.participantIds.length; i += 30) {
                chunks.push(event.participantIds.slice(i, i + 30));
            }

            for (const chunk of chunks) {
                if(chunk.length > 0){
                    const usersQuery = adminDb.collection('users').withConverter(userConverter).where('__name__', 'in', chunk);
                    const usersSnapshot = await usersQuery.get();
                    usersSnapshot.forEach(doc => {
                        participants.push(doc.data());
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


export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { event, participants } = await getEventData(id);
    
    return <EventDetailClient initialEvent={event!} initialParticipants={participants} />
}
