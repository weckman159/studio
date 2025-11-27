'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { User } from '@/lib/data';
import { users as mockUsers } from '@/lib/data'; // Keep for fallback if needed, but primary logic won't use it.

/**
 * A centralized hook to fetch a user's profile data.
 * @param userId The ID of the user to fetch.
 * @returns An object containing the user's profile data, loading state, and any errors.
 */
export function useUserProfile(userId: string | null | undefined) {
  const firestore = useFirestore();
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Reset state if userId changes or is invalid
    if (!userId || !firestore) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const userDocRef = doc(firestore, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          setProfile({ id: userDocSnap.id, ...userDocSnap.data() } as User);
        } else {
          // If not found in Firestore, explicitly set to null.
          // We no longer fallback to mock data here to have a clear data flow.
          // The component using the hook can decide to use mock data if profile is null.
          setProfile(null);
          console.warn(`User with ID ${userId} not found in Firestore.`);
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError(err instanceof Error ? err : new Error('Failed to fetch profile'));
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId, firestore]);

  return { profile, isLoading, error };
}
