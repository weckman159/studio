
// src/app/profile/[id]/page.tsx
import { getAdminDb, getAdminAuth } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { ProfileClientPage } from '@/components/profile/ProfileClientPage';
import type { User, Car } from '@/lib/types';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';


async function getProfileData(userId: string): Promise<{ profile: User | null; cars: Car[] }> {
    try {
        const adminDb = getAdminDb();
        if (!adminDb) {
            console.error("Firebase Admin not initialized");
            return { profile: null, cars: [] };
        }
        const userDocRef = adminDb.collection('users').doc(userId);
        const userDocSnap = await userDocRef.get();

        if (!userDocSnap.exists()) {
            return { profile: null, cars: [] };
        }

        const profile = { id: userDocSnap.id, ...userDocSnap.data() } as User;

        const carsCollectionRef = adminDb.collection('cars');
        const carsQuery = adminDb.collection('cars').where('userId', '==', userId);
        const carsSnapshot = await carsQuery.get();
        const cars = carsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Car));

        return { profile, cars };
    } catch (error) {
        console.error("Error fetching profile data on server:", error);
        return { profile: null, cars: [] };
    }
}

async function getAuthUser() {
    try {
        const adminAuth = getAdminAuth();
        if (!adminAuth) {
            return null;
        }
        const sessionCookie = (await cookies()).get('session');
        if (!sessionCookie) return null;
        const decodedToken = await adminAuth.verifySessionCookie(sessionCookie.value, true);
        return decodedToken;
    } catch (error) {
        // This is not an error, just means user is not logged in
        return null;
    }
}


export default async function ProfilePage({ params }: { params: { id: string } }) {
    const { id } = params;
    const { profile, cars } = await getProfileData(id);
    
    if (!profile) {
        notFound();
    }
    
    const authUser = await getAuthUser();
    
    return <ProfileClientPage initialProfile={profile} initialCars={cars} authUser={authUser} />;
}
