
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
  if (getApps().find(app => app.name === 'firebase-admin-app')) {
    if (!adminApp) {
        adminApp = getApps().find(app => app.name === 'firebase-admin-app');
        adminDb = getFirestore(adminApp);
        adminAuth = getAuth(adminApp);
    }
    return;
  }

  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (!serviceAccountKey) {
      console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT_KEY not found. Admin SDK will not be initialized. Build may fail.');
      return;
    }

    let serviceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountKey);
    } catch (e) {
      console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY as JSON. Ensure it is a valid JSON string.', e);
      return;
    }

    // Initialize the admin app with a unique name
    adminApp = initializeApp({
      credential: cert(serviceAccount),
    }, 'firebase-admin-app');

    adminDb = getFirestore(adminApp);
    adminAuth = getAuth(adminApp);
    
    console.log('✅ Firebase Admin SDK initialized successfully.');

  } catch (error: any) {
    if (!/already exists/i.test(error.message)) {
        console.error('❌ Error initializing Firebase Admin SDK:', error);
    }
  }
}

// Call initialization on module load
initializeAdmin();


/**
 * Get Firestore Admin instance (server-side only)
 * Returns a mock implementation if Admin SDK is not initialized to allow build to pass in some CI environments
 */
export function getAdminDb(): Firestore {
  if (!adminDb) {
    console.warn('⚠️ Using mock Firestore Admin - configure FIREBASE_SERVICE_ACCOUNT_KEY for production.');
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
    console.warn('⚠️ Using mock Auth Admin - configure FIREBASE_SERVICE_ACCOUNT_KEY for production.');
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
