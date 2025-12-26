// src/lib/firestore-converters.ts
import {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp,
  WithFieldValue,
} from 'firebase/firestore'; // Note: Using client types, but they are compatible with admin-sdk types for this purpose
import * as T from '@/lib/types';

/**
 * Recursively checks if a value is a plain object.
 */
function isPlainObject(value: any): value is Record<string, any> {
  if (value === null || typeof value !== 'object' || value.nodeType || (value.constructor && !Object.prototype.hasOwnProperty.call(value.constructor.prototype, 'isPrototypeOf'))) {
    return false;
  }
  return true;
}

/**
 * Recursively converts Firestore Timestamps to JavaScript Dates in a data object.
 * This is safe to run on data that has already been partially converted.
 */
const fromFirestoreRecursive = (data: DocumentData): DocumentData => {
  const result: any = {};
  for (const key in data) {
    const value = data[key];
    if (value instanceof Timestamp) {
      result[key] = value.toDate();
    } else if (value instanceof Date) {
      result[key] = value; // Already a Date, no conversion needed
    } else if (Array.isArray(value)) {
      result[key] = value.map(item => isPlainObject(item) ? fromFirestoreRecursive(item) : item);
    } else if (isPlainObject(value)) {
      result[key] = fromFirestoreRecursive(value);
    } else {
      result[key] = value;
    }
  }
  return result;
};

/**
 * Creates a generic FirestoreDataConverter for a given type.
 * This handles automatic conversion of Timestamps to Dates and adds the document ID.
 * @template T The TypeScript type of the entity.
 * @returns A FirestoreDataConverter for the specified type.
 */
export const converter = <T>(): FirestoreDataConverter<T> => ({
  /**
   * Converts a typed object to a plain JavaScript object for Firestore.
   * Currently, it strips the 'id' field as it's the document key.
   */
  toFirestore: (data: WithFieldValue<T>): DocumentData => {
    const { id, ...rest } = data as any;
    // Note: This could be expanded to convert JS Dates back to Timestamps if needed.
    return rest;
  },

  /**
   * Converts a Firestore document snapshot to a typed object.
   */
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions): T => {
    const data = snapshot.data(options);
    const processedData = fromFirestoreRecursive(data);
    return {
      ...processedData,
      id: snapshot.id, // Automatically add the document ID
    } as T;
  }
});

// --- EXPORTED CONVERTERS ---
// Create and export a specific converter for each main entity.

export const userConverter = converter<T.User>();
export const postConverter = converter<T.Post>();
export const carConverter = converter<T.Car>();
export const timelineEntryConverter = converter<T.TimelineEntry>(); // Added
export const commentConverter = converter<T.Comment>();
export const communityConverter = converter<T.Community>();
export const marketplaceItemConverter = converter<T.MarketplaceItem>();
export const eventConverter = converter<T.Event>();
export const notificationConverter = converter<T.Notification>();
export const workshopConverter = converter<T.Workshop>();
export const reviewConverter = converter<T.Review>();
export const votingConverter = converter<T.Voting>();
export const dialogConverter = converter<T.Dialog>();
export const messageConverter = converter<T.Message>();
