
// src/lib/firebase-admin.ts
import * as admin from 'firebase-admin';

// Важно: Этот файл должен выполняться только на сервере!

if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      // Для Vercel, используем переменные окружения
      // Безопасно, т.к. этот код не попадет на клиент
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    } else {
        console.warn('FIREBASE_SERVICE_ACCOUNT_KEY is not set. Firebase Admin SDK will not be initialized.');
    }

  } catch (error: any) {
    // В локальной среде может не быть переменных окружения,
    // это нормально, если мы не используем Admin SDK локально без эмуляторов
    if (process.env.NODE_ENV !== 'development') {
      console.error('Firebase Admin Initialization Error:', error.stack);
    } else {
        console.log('Firebase Admin SDK not initialized. This is normal for local development if not using emulators or service account.');
    }
  }
}

let adminDb: admin.firestore.Firestore, adminAuth: admin.auth.Auth, adminStorage: admin.storage.Storage;

if (admin.apps.length > 0) {
  adminDb = admin.firestore();
  adminAuth = admin.auth();
  adminStorage = admin.storage();
} else {
  // Создаем "пустышки", чтобы избежать ошибок при импорте, если SDK не инициализирован
  adminDb = {} as admin.firestore.Firestore;
  adminAuth = {} as admin.auth.Auth;
  adminStorage = {} as admin.storage.Storage;
}


export { adminDb, adminAuth, adminStorage };
