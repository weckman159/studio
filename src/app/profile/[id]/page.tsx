
// src/app/profile/[id]/page.tsx
import { getAdminDb } from '@/lib/firebase-admin';
import type { Car, User, Post } from '@/lib/types';
import { ProfileClientPage } from '@/components/profile/ProfileClientPage';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ProfilePageSkeleton } from '@/components/profile/ProfilePageSkeleton';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getProfileData(profileId: string) {
  try {
    const adminDb = getAdminDb();
    
    // 1. Fetch Profile
    const profileRef = adminDb.collection('users').doc(profileId);
    const profileSnap = await profileRef.get();

    // If mock user doesn't exist, create it on the fly. This is a dev-only convenience.
    if (!profileSnap.exists && profileId === 'dev-user-01') {
        const mockUserData = {
            id: 'dev-user-01',
            uid: 'dev-user-01',
            displayName: 'Разработчик',
            name: 'Разработчик',
            email: 'dev@autosphere.com',
            photoURL: 'https://avatar.vercel.sh/dev.png',
            role: 'admin',
            createdAt: new Date(),
        };
        await profileRef.set(mockUserData);
        const newSnap = await profileRef.get();
        return getProfileData(profileId); // Recurse to get full data
    }
    
    if (!profileSnap.exists) {
      return { profile: null, cars: [], posts: [], followers: [], following: [] };
    }
    const profile = { id: profileSnap.id, ...profileSnap.data() } as User;

    // 2. Fetch Cars
    const carsQuery = adminDb.collection('cars').where('userId', '==', profileId);
    const carsSnap = await carsQuery.get();
    const cars = carsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Car));

    // 3. Fetch Posts (limit to latest 20 for profile)
    const postsQuery = adminDb.collection('posts').where('authorId', '==', profileId).orderBy('createdAt', 'desc').limit(20);
    const postsSnap = await postsQuery.get();
    const posts = postsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Post));
    
    // 4. Fetch Followers
    const followersQuery = adminDb.collection('users').doc(profileId).collection('followers');
    const followersSnapshot = await followersQuery.get();
    const followers = followersSnapshot.docs.map(doc => doc.id);

    // 5. Fetch Following
    const followingQuery = adminDb.collection('users').doc(profileId).collection('following');
    const followingSnapshot = await followingQuery.get();
    const following = followingSnapshot.docs.map(doc => doc.id);
    
    return { profile, cars, posts, followers, following };

  } catch (error) {
    console.error(`[SERVER] Error fetching profile for ${profileId}:`, error);
    return { profile: null, cars: [], posts: [], followers: [], following: [] };
  }
}

export default async function ProfilePage({ params }: { params: { id: string } }) {
    const { id } = params;

    const initialData = await getProfileData(id);

    if (!initialData.profile) {
        notFound();
    }
    
    return (
        <Suspense fallback={<ProfilePageSkeleton />}>
            <ProfileClientPage 
                profileId={id} 
                initialProfile={initialData.profile}
                initialCars={initialData.cars}
                initialPosts={initialData.posts}
                initialFollowers={initialData.followers}
                initialFollowing={initialData.following}
            />
        </Suspense>
    );
}
