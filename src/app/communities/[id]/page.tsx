
// src/app/communities/[id]/page.tsx
import { getAdminDb } from '@/lib/firebase-admin';
import { notFound } from 'next/navigation';
import type { Community, Post, User } from '@/lib/types';
import CommunityDetailClient from './_components/CommunityDetailClient';
import { communityConverter, postConverter, userConverter } from '@/lib/firestore-converters';

export const dynamic = 'force-dynamic';

async function getCommunityData(communityId: string): Promise<{ community: Community | null; posts: Post[]; members: User[] }> {
    try {
        const adminDb = getAdminDb();
        if (!adminDb) {
            console.error("Firebase Admin not initialized");
            notFound();
        }
        
        const communityDocRef = adminDb.collection('communities').withConverter(communityConverter).doc(communityId);
        const communityDocSnap = await communityDocRef.get();

        if (!communityDocSnap.exists) {
            notFound();
        }

        const community = communityDocSnap.data();
        if (!community) notFound();

        // Fetch posts
        const postsQuery = adminDb.collection('posts').withConverter(postConverter).where('communityId', '==', communityId).orderBy('createdAt', 'desc').limit(20);
        const postsSnapshot = await postsQuery.get();
        const posts = postsSnapshot.docs.map(doc => doc.data());

        // Fetch members (limit to 50 for performance)
        const members: User[] = [];
        if (community.memberIds && community.memberIds.length > 0) {
            const ids = community.memberIds.slice(0, 50);

            if (ids.length > 0) {
                // Firestore 'in' query supports up to 30 items. We handle this client-side now.
                // For simplicity on server, we fetch in one go if possible.
                // For larger sets, chunking is required. Let's assume less than 30 for now.
                const usersQuery = adminDb.collection('users').withConverter(userConverter).where('__name__', 'in', ids.slice(0, 30));
                const usersSnapshot = await usersQuery.get();
                usersSnapshot.forEach(doc => {
                    members.push(doc.data());
                });
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
