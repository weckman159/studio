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
export function getAdminDb(): admin.firestore.Firestore {
if (!_adminDb) {
if (!initializeFirebaseAdmin()) {
throw new Error('Firebase Admin SDK not initialized. Check FIREBASE_SERVICE_ACCOUNT_KEY.');
}
_adminDb = admin.firestore();
}
return _adminDb;
}

export function getAdminAuth(): admin.auth.Auth {
if (!_adminAuth) {
if (!initializeFirebaseAdmin()) {
throw new Error('Firebase Admin SDK not initialized.');
}
_adminAuth = admin.auth();
}
return _adminAuth;
}

export function getAdminStorage(): admin.storage.Storage {
if (!_adminStorage) {
if (!initializeFirebaseAdmin()) {
throw new Error('Firebase Admin SDK not initialized.');
}
_adminStorage = admin.storage();
}
return _adminStorage;
}

// Для обратной совместимости (deprecated - используй геттеры)
export const adminDb = new Proxy({} as admin.firestore.Firestore, {
get(_, prop) {
return (getAdminDb() as any)[prop];
}
});

export const adminAuth = new Proxy({} as admin.auth.Auth, {
get(_, prop) {
return (getAdminAuth() as any)[prop];
}
});

export const adminStorage = new Proxy({} as admin.storage.Storage, {
get(_, prop) {
return (getAdminStorage() as any)[prop];
}
});
