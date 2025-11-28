// src/app/communities/[id]/create-post/page.tsx
import { PostForm } from '@/components/PostForm';
import { getAdminDb } from '@/lib/firebase-admin';
import { notFound } from 'next/navigation';
import type { Community } from '@/lib/types';

export const dynamic = 'force-dynamic';

async function getCommunity(communityId: string): Promise<Community | null> {
    try {
        const adminDb = getAdminDb();
        if (!adminDb) {
            console.error("Firebase Admin not initialized");
            return null;
        }
        const communityRef = adminDb.collection('communities').doc(communityId);
        const communitySnap = await communityRef.get();
        if (!communitySnap.exists) {
            return null;
        }
        return { id: communitySnap.id, ...communitySnap.data() } as Community;
    } catch (error) {
        console.error("Error fetching community data for post creation:", error);
        return null;
    }
}

export default async function CreateCommunityPostPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const community = await getCommunity(id);

    if (!community) {
        notFound();
    }

    return <PostForm communityId={id} communityName={community.name} />;
}
