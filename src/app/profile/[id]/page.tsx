
// src/app/profile/[id]/page.tsx
import { getAdminDb } from '@/lib/firebase-admin';
import type { User, Car, Post } from '@/lib/types';
import { notFound } from 'next/navigation';
import { ProfileClientPage } from '@/components/profile/ProfileClientPage';
import { serializeFirestoreData } from '@/lib/utils';
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // No caching

async function getProfileData(userId: string) {
    const adminDb = getAdminDb();
    if (!adminDb) {
        console.error("Firebase Admin not initialized");
        return { profile: null, cars: [], posts: [], followers: [], following: [] };
    }

    try {
        const userRef = adminDb.collection('users').doc(userId);
        const userSnap = await userRef.get();

        if (!userSnap.exists) {
            notFound();
        }
        
        const [carsSnap, postsSnap, followersSnap, followingSnap] = await Promise.all([
            adminDb.collection('cars').where('userId', '==', userId).get(),
            adminDb.collection('posts').where('authorId', '==', userId).orderBy('createdAt', 'desc').limit(20).get(),
            userRef.collection('followers').get(),
            userRef.collection('following').get()
        ]);


        const profile = serializeFirestoreData({ id: userSnap.id, ...userSnap.data() }) as User;
        const cars = carsSnap.docs.map((d: QueryDocumentSnapshot) => serializeFirestoreData({ id: d.id, ...d.data() }) as Car);
        const posts = postsSnap.docs.map((d: QueryDocumentSnapshot) => serializeFirestoreData({ id: d.id, ...d.data() }) as Post);
        const followers = followersSnap.docs.map((d: QueryDocumentSnapshot) => d.id);
        const following = followingSnap.docs.map((d: QueryDocumentSnapshot) => d.id);

        return { profile, cars, posts, followers, following };

    } catch (error) {
        console.error(`Error fetching profile for ${userId}:`, error);
        return { profile: null, cars: [], posts: [], followers: [], following: [] };
    }
}


export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { profile, cars, posts, followers, following } = await getProfileData(id);

    if (!profile) {
      notFound();
    }

    return (
        <div className="p-4 md:p-8">
            <ProfileClientPage
                profileId={id}
                initialProfile={profile}
                initialCars={cars}
                initialPosts={posts}
                initialFollowers={followers}
                initialFollowing={following}
            />
        </div>
    );
}
