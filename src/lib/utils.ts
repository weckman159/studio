import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Timestamp } from 'firebase/firestore';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts Firestore Timestamp to JavaScript Date
 */
export function convertTimestamp(timestamp: any): Date | null {
  if (!timestamp) return null;
  
  // Handle server-side timestamps (_seconds/_nanoseconds format)
  if (timestamp._seconds !== undefined) {
    return new Date(timestamp._seconds * 1000 + Math.floor(timestamp._nanoseconds / 1000000));
  }
  
  // Handle client-side timestamps (seconds/nanoseconds format)
  if (timestamp.seconds !== undefined) {
    return new Date(timestamp.seconds * 1000 + Math.floor(timestamp.nanoseconds / 1000000));
  }
  
  // Handle already converted dates
  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  // Handle ISO strings
  if (typeof timestamp === 'string') {
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? null : date;
  }
  
  return null;
}

/**
 * Recursively converts all Timestamp fields in an object to Dates
 */
export function serializeFirestoreData<T>(data: T): T {
  if (!data || typeof data !== 'object') {
    return data;
  }
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => serializeFirestoreData(item)) as unknown as T;
  }
  
  // Handle plain objects
  const result: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === 'object' && !(value instanceof Date)) {
      // Check if it's a Timestamp-like object
      if ((value as any)._seconds !== undefined || (value as any).seconds !== undefined) {
        result[key] = convertTimestamp(value);
      } else {
        // Recursively process nested objects
        result[key] = serializeFirestoreData(value);
      }
    } else {
      result[key] = value;
    }
  }
  
  return result as T;
}

/**
 * Strips HTML tags from a string
 */
export function stripHtml(html: string): string {
   if (!html) return "";
   if (typeof document === 'undefined') {
     // Running on the server, return as is or use a server-side library
     return html.replace(/<[^>]*>?/gm, '');
   }
   const tmp = document.createElement("DIV");
   tmp.innerHTML = html;
   return tmp.textContent || tmp.innerText || "";
}
