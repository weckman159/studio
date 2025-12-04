// src/lib/firebase-admin.ts - ПРАВИЛЬНАЯ ВЕРСИЯ
import * as admin from 'firebase-admin'

// Эта проверка гарантирует, что мы инициализируем приложение только один раз.
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, // Используем NEXT_PUBLIC_ для доступности
        privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    })
    console.log('✅ Firebase Admin SDK initialized successfully.');
  } catch (error: any) {
    console.error('❌ Firebase Admin SDK initialization error:', error.message);
    // В dev-режиме можно не падать, а просто логировать
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
  }
}

export function getAdminDb() {
  return admin.firestore();
}

export function getAdminAuth() {
    return admin.auth();
}

export function getAdminStorage() {
    return admin.storage();
}
