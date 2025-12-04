// src/lib/firebase-admin.ts
import * as admin from 'firebase-admin';

// Инициализируем Firebase Admin SDK только один раз
if (!admin.apps.length) {
  try {
    // Используем FIREBASE_SERVICE_ACCOUNT_KEY (полный JSON)
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (!serviceAccountKey) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Admin SDK cannot be initialized.');
    }

    // Парсим JSON из переменной окружения
    const serviceAccount = JSON.parse(serviceAccountKey);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });

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
