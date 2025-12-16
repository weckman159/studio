
// src/app/communities/[id]/page.tsx
import { getAdminDb } from '@/lib/firebase-admin';
import { notFound } from 'next/navigation';
import type { Community, Post, User } from '@/lib/types';
import CommunityDetailClient from './_components/CommunityDetailClient';
import { serializeFirestoreData } from '@/lib/utils';
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';


async function getCommunityData(communityId: string): Promise<{ community: Community | null; posts: Post[]; members: User[] }> {
    try {
        const adminDb = getAdminDb();
        if (!adminDb) {
            console.error("Firebase Admin not initialized");
            notFound();
        }
        const communityDocRef = adminDb.collection('communities').doc(communityId);
        const communityDocSnap = await communityDocRef.get();

        if (!communityDocSnap.exists) {
            notFound();
        }

        const community = serializeFirestoreData({ id: communityDocSnap.id, ...communityDocSnap.data() } as Community);

        // Fetch posts
        const postsQuery = adminDb.collection('posts').where('communityId', '==', communityId).orderBy('createdAt', 'desc').limit(20);
        const postsSnapshot = await postsQuery.get();
        const posts = postsSnapshot.docs.map((doc: QueryDocumentSnapshot) => serializeFirestoreData({ id: doc.id, ...doc.data() } as Post));

        // Fetch members (limit to 50 for performance)
        const members: User[] = [];
        if (community.memberIds && community.memberIds.length > 0) {
            // Firestore 'in' query is limited to 30 items in Node SDK, let's do 10 for safety
            const memberIdChunks: string[][] = [];
            const ids = community.memberIds.slice(0, 50);

            for (let i = 0; i < ids.length; i += 10) {
                memberIdChunks.push(ids.slice(i, i + 10));
            }

            for (const chunk of memberIdChunks) {
                 if (chunk.length > 0) {
                    const usersQuery = adminDb.collection('users').where('__name__', 'in', chunk);
                    const usersSnapshot = await usersQuery.get();
                    usersSnapshot.forEach((doc: QueryDocumentSnapshot) => {
                        members.push(serializeFirestoreData({ id: doc.id, ...doc.data() } as User));
                    });
                }
            }
        }
        
        return { community, posts, members };

    } catch (error) {
        console.error("Error fetching community data:", error);
        notFound();
    }
}


export default async function CommunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { community, posts, members } = await getCommunityData(id);

    return <CommunityDetailClient initialCommunity={community!} initialPosts={posts} initialMembers={members} />
}

    
