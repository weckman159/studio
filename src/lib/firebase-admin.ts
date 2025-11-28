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
      console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT_KEY not set. Admin SDK unavailable.');
      return false;
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
    console.error('❌ Firebase Admin init error:', error.message);
    return false;
  }
}

// Геттеры с ленивой инициализацией
export function getAdminDb(): admin.firestore.Firestore | null {
  if (!_adminDb) {
    if (!initializeFirebaseAdmin()) {
      // Не выбрасываем ошибку, чтобы не падать при сборке, а возвращаем null
      return null;
    }
    _adminDb = admin.firestore();
  }
  return _adminDb;
}

export function getAdminAuth(): admin.auth.Auth | null {
  if (!_adminAuth) {
    if (!initializeFirebaseAdmin()) {
      return null;
    }
    _adminAuth = admin.auth();
  }
  return _adminAuth;
}

export function getAdminStorage(): admin.storage.Storage | null {
  if (!_adminStorage) {
    if (!initializeFirebaseAdmin()) {
      return null;
    }
    _adminStorage = admin.storage();
  }
  return _adminStorage;
}
