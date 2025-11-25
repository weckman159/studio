'use client';

import { useUser as useRealUser } from '@/firebase';
import type { User as FirebaseUser } from 'firebase/auth';

// --- Mock User Data ---
// This data simulates a logged-in user for development purposes.
// To test the unauthenticated state, you can comment out the mockUser object.
const mockUser = {
  uid: '1',
  email: 'developer@example.com',
  displayName: 'Alexey Novikov',
  photoURL: 'https://images.unsplash.com/photo-1607031542107-f6f46b5d54e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxtYW4lMjBwb3J0cmFpdHxlbnwwfHx8fDE3NjM5MjU3NzF8MA&ixlib=rb-4.1.0&q=80&w=1080',
};

// --- Custom Auth Hook ---
export function useAuth() {
  // In a production environment, always use the real authentication hook.
  if (process.env.NODE_ENV === 'production') {
    const { user, isUserLoading } = useRealUser();
    return { user, loading: isUserLoading };
  }

  // In development, we use the mock user for convenience.
  // To test the logged-out state, simply comment out the `return` statement
  // in the line below and the hook will proceed to use the real Firebase auth.
  return { user: mockUser as unknown as FirebaseUser, loading: false };

  // Fallback to real authentication in development if the mock is disabled.
  // const { user, isUserLoading } = useRealUser();
  // return { user, loading: isUserLoading };
}
