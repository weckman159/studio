
// src/app/profile/[id]/page.tsx
import { getAdminDb } from '@/lib/firebase-admin';
import { notFound } from 'next/navigation';
import { ProfileClientPage } from '@/components/profile/ProfileClientPage';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // No caching

// This function now only validates that the user exists on the server.
async function validateProfileExists(userId: string): Promise<boolean> {
    const adminDb = getAdminDb();
    if (!adminDb) {
        console.error("Firebase Admin not initialized on server.");
        return false;
    }
    try {
        const userRef = adminDb.collection('users').doc(userId);
        const userSnap = await userRef.get();
        return userSnap.exists;
    } catch (error) {
        console.error(`Error validating profile for ${userId}:`, error);
        return false;
    }
}


export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const profileExists = await validateProfileExists(id);

    if (!profileExists) {
      notFound();
    }

    // The Server Component now only passes the ID to the Client Component.
    // The Client Component will be responsible for fetching all its data.
    return (
        <div className="p-4 md:p-8">
            <ProfileClientPage profileId={id} />
        </div>
    );
}

