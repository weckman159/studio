
'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, collection, getDocs, query } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { User } from '@/lib/types';

/**
 * A centralized hook to fetch a user's profile data from Firestore.
 * @param userId The ID of the user to fetch.
 * @returns An object containing the user's profile data, loading state, and any errors.
 */
export function useUserProfile(userId: string | null | undefined) {
  const firestore = useFirestore();
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId || !firestore) {
      setProfile(null);
      setIsLoading(false);
      if (!userId) {
        // This is not an error, but a state where no user is being requested.
        setError(null);
      }
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
          setProfile(null);
          console.warn(`User with ID ${userId} not found in Firestore.`);
          setError(new Error('User not found'));
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
