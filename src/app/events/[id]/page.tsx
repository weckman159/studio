// src/app/events/[id]/page.tsx
'use server';

import { adminDb } from '@/lib/firebase-admin';
import type { Event, User } from '@/lib/types';
import { notFound } from 'next/navigation';
import EventDetailClient from './_components/EventDetailClient';

export const dynamic = 'force-dynamic';

async function getEventData(eventId: string): Promise<{ event: Event | null, participants: User[] }> {
    try {
        const eventDocRef = adminDb.collection('events').doc(eventId);
        const eventDocSnap = await eventDocRef.get();

        if (!eventDocSnap.exists) {
            return { event: null, participants: [] };
        }

        const event = { id: eventDocSnap.id, ...eventDocSnap.data() } as Event;

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
                    usersSnapshot.forEach(doc => {
                        participants.push({ id: doc.id, ...doc.data() } as User);
                    });
                }
            }
        }

        return { event, participants };
    } catch (error) {
        console.error("Error fetching event data:", error);
        return { event: null, participants: [] };
    }
}


export default async function EventDetailPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const { event, participants } = await getEventData(id);
    
    if (!event) {
        notFound();
    }

    return <EventDetailClient initialEvent={event} initialParticipants={participants} />
}
