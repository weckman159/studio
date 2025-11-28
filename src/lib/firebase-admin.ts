// src/lib/firebase-admin.ts
import * as admin from 'firebase-admin';

// Ленивая инициализация - только при первом вызове функции
let _adminDb: admin.firestore.Firestore | null = null;
let _adminAuth: admin.auth.Auth | null = null;
let _adminStorage: admin.storage.Storage | null = null;
let _initialized = false;

function initializeFirebaseAdmin(): boolean {
  if (_initialized) return admin.apps.length > 0;
  _initialized = true;

  if (admin.apps.length > 0) {
    return true;
  }

  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccountKey) {
      // This is now a critical error for server-side rendering.
      // Throwing an error will provide a clear message during build or runtime.
      throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Admin SDK cannot be initialized.');
    }

    const serviceAccount = JSON.parse(serviceAccountKey);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });

    console.log('✅ Firebase Admin SDK initialized');
    return true;
  } catch (error: any) {
    // Log the original error for debugging, but throw a more helpful one.
    console.error('❌ Firebase Admin init error:', error.message);
    throw new Error(`Firebase Admin SDK initialization failed: ${error.message}. Ensure FIREBASE_SERVICE_ACCOUNT_KEY is set correctly in your environment variables.`);
  }
}

// Геттеры с ленивой инициализацией
export function getAdminDb(): admin.firestore.Firestore {
  if (!_adminDb) {
    initializeFirebaseAdmin();
    _adminDb = admin.firestore();
  }
  return _adminDb;
}

export function getAdminAuth(): admin.auth.Auth {
  if (!_adminAuth) {
    initializeFirebaseAdmin();
    _adminAuth = admin.auth();
  }
  return _adminAuth;
}

export function getAdminStorage(): admin.storage.Storage {
  if (!_adminStorage) {
    initializeFirebaseAdmin();
    _adminStorage = admin.storage();
  }
  return _adminStorage;
}
