import 'server-only';
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
  if (getApps().length > 0 && adminApp) {
    // Already initialized
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
    }, 'firebase-admin-app'); // Give a unique name to avoid conflicts

    adminDb = getFirestore(adminApp);
    adminAuth = getAuth(adminApp);
    
    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error: any) {
    // Prevent re-initialization error
    if (!/already exists/i.test(error.message)) {
        console.error('❌ Error initializing Firebase Admin SDK:', error);
    } else if (!adminApp) {
        // If it exists but our variables are not set, get the default app
        adminApp = getApps().find(app => app.name === 'firebase-admin-app') || getApps()[0];
        adminDb = getFirestore(adminApp);
        adminAuth = getAuth(adminApp);
    }
  }
}

/**
 * Get Firestore Admin instance (server-side only)
 * Returns a mock implementation if Admin SDK is not initialized
 */
export function getAdminDb(): Firestore {
  if (!adminDb) {
    initializeAdmin();
  }
  
  if (!adminDb) {
    console.warn('⚠️ Using mock Firestore Admin - configure FIREBASE_SERVICE_ACCOUNT_KEY for production');
    // Return a mock object that won't crash the app during development without keys
    return {
      collection: (name: string) => ({
        doc: (id: string) => ({
          get: async () => ({ exists: false, data: () => null }),
          update: async () => {},
          set: async () => {},
          collection: (sub: string) => ({
            get: async () => ({ docs: [] })
          })
        }),
        where: () => ({
          orderBy: () => ({
            limit: () => ({
              get: async () => ({ docs: [] })
            }),
            get: async () => ({ docs: [] })
          }),
          get: async () => ({ docs: [] })
        }),
        orderBy: () => ({
          limit: () => ({
            get: async () => ({ docs: [] })
          }),
          get: async () => ({ docs: [] })
        }),
        limit: () => ({
          get: async () => ({ docs: [] })
        }),
        get: async () => ({ docs: [] }),
        add: async () => ({})
      })
    } as unknown as Firestore;
  }
  
  return adminDb;
}

/**
 * Get Auth Admin instance (server-side only)
 */
export function getAdminAuth(): Auth {
  if (!adminAuth) {
    initializeAdmin();
  }
  
  if (!adminAuth) {
    console.warn('⚠️ Using mock Auth Admin - configure FIREBASE_SERVICE_ACCOUNT_KEY for production');
    return {
      verifyIdToken: async (token: string) => null,
      getUser: async (uid: string) => null,
      createUser: async (data: any) => null,
      updateUser: async (uid: string, data: any) => null,
      deleteUser: async (uid: string) => {},
    } as unknown as Auth;
  }
  
  return adminAuth;
}
