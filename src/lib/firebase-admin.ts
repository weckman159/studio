// src/lib/firebase-admin.ts
import * as admin from 'firebase-admin';

// Важно: Этот файл должен выполняться только на сервере!

if (!admin.apps.length) {
  try {
    // Для Vercel, используем переменные окружения
    // Безопасно, т.к. этот код не попадет на клиент
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });

  } catch (error: any) {
    // В локальной среде может не быть переменных окружения,
    // это нормально, если мы не используем Admin SDK локально без эмуляторов
    if (process.env.NODE_ENV !== 'development') {
      console.error('Firebase Admin Initialization Error:', error.stack);
    }
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export const adminStorage = admin.storage();
