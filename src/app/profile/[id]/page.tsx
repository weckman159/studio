'use server';

import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { getAuth } from 'firebase-admin/auth';
import { ProfileClientPage } from '@/components/profile/ProfileClientPage';
import type { User, Car } from '@/lib/types';


async function getProfileData(userId: string): Promise<{ profile: User | null; cars: Car[] }> {
    try {
        const userDocRef = adminDb.collection('users').doc(userId);
        const userDocSnap = await userDocRef.get();

        if (!userDocSnap.exists) {
            return { profile: null, cars: [] };
        }

        const profile = { id: userDocSnap.id, ...userDocSnap.data() } as User;

        const carsCollectionRef = adminDb.collection('cars');
        const carsQuery = query(carsCollectionRef, where('userId', '==', userId));
        const carsSnapshot = await getDocs(carsQuery);
        const cars = carsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Car));

        return { profile, cars };
    } catch (error) {
        console.error("Error fetching profile data on server:", error);
        return { profile: null, cars: [] };
    }
}

async function getAuthUser() {
    try {
        const sessionCookie = cookies().get('session')?.value;
        if (!sessionCookie) return null;
        const decodedToken = await getAuth().verifySessionCookie(sessionCookie, true);
        return decodedToken;
    } catch (error) {
        return null;
    }
}


export default async function ProfilePage({ params }: { params: { id: string } }) {
    const { id } = params;
    const { profile, cars } = await getProfileData(id);
    const authUser = await getAuthUser();
    
    return <ProfileClientPage initialProfile={profile} initialCars={cars} authUser={authUser} />;
}
