'use client';

import { useUser } from '@/firebase';

export function useAuth() {
  const { user, isUserLoading } = useUser();
  return { user, loading: isUserLoading };
}
