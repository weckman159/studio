// src/lib/firebase-admin.ts - Server-side Firebase Admin SDK
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

let adminApp: App | undefined;
let adminDb: Firestore | undefined;
let adminAuth: Auth | undefined;

/**
 * Initialize Firebase Admin SDK (server-side only)
 * Uses service account credentials from environment variable
 */
function initializeAdmin() {
  if (getApps().length > 0) {
    // Already initialized
    adminApp = getApps()[0];
    adminDb = getFirestore(adminApp);
    adminAuth = getAuth(adminApp);
    return;
  }

  try {
    // Parse service account key from environment variable
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (!serviceAccountKey) {
      console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT_KEY not found. Admin SDK not initialized.');
      return;
    }

    let serviceAccount;
    try {
      // Try to parse as JSON string
      serviceAccount = JSON.parse(serviceAccountKey);
    } catch (e) {
      console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY as JSON:', e);
      return;
    }

    // Initialize the admin app
    adminApp = initializeApp({
      credential: cert(serviceAccount),
    });

    adminDb = getFirestore(adminApp);
    adminAuth = getAuth(adminApp);
    
    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin SDK:', error);
  }
}

/**
 * Get Firestore Admin instance (server-side only)
 * Returns a mock implementation if Admin SDK is not initialized
 */
export function getAdminDb(): Firestore | any {
  if (!adminDb) {
    initializeAdmin();
  }
  
  // If still not initialized, return mock for development
  if (!adminDb) {
    console.warn('⚠️ Using mock Firestore Admin - configure FIREBASE_SERVICE_ACCOUNT_KEY for production');
    return {
      collection: (name: string) => ({
        doc: (id: string) => ({
          get: async () => ({ exists: false, data: () => null }),
          update: async () => true,
          set: async () => true,
          collection: (sub: string) => ({
            get: async () => ({ docs: [] })
          })
        }),
        where: (...args: any[]) => ({
          orderBy: (...args: any[]) => ({
            limit: (...args: any[]) => ({
              get: async () => ({ docs: [] })
            }),
            get: async () => ({ docs: [] })
          }),
          get: async () => ({ docs: [], size: 0 })
        }),
        orderBy: (...args: any[]) => ({
          limit: (...args: any[]) => ({
            get: async () => ({ docs: [] })
          }),
          get: async () => ({ docs: [] })
        }),
        limit: (...args: any[]) => ({
          get: async () => ({ docs: [] })
        }),
        get: async () => ({ docs: [] })
      })
    };
  }
  
  return adminDb;
}

/**
 * Get Auth Admin instance (server-side only)
 */
export function getAdminAuth(): Auth | any {
  if (!adminAuth) {
    initializeAdmin();
  }
  
  if (!adminAuth) {
    console.warn('⚠️ Using mock Auth Admin - configure FIREBASE_SERVICE_ACCOUNT_KEY for production');
    return {
      getUser: async (uid: string) => null,
      createUser: async (data: any) => null,
      updateUser: async (uid: string, data: any) => null,
      deleteUser: async (uid: string) => true,
    };
  }
  
  return adminAuth;
}
