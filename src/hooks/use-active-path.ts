
'use client';

import { usePathname } from 'next/navigation';
import { useCallback } from 'react';

/**
 * Custom hook to check if a given path is active.
 * Handles the special case for the root path '/'.
 * @returns A function that takes a path and returns true if it's active.
 */
export function useActivePath(): (path: string) => boolean {
  const pathname = usePathname();

  const checkActivePath = useCallback(
    (path: string) => {
      if (path === '/' && pathname !== '/') {
        return false;
      }
      return pathname.startsWith(path);
    },
    [pathname]
  );

  return checkActivePath;
}
