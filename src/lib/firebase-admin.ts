// src/lib/firebase-admin.ts
import * as admin from 'firebase-admin';

// Важно: Этот файл должен выполняться только на сервере!

if (!admin.apps.length) {
  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    // КРИТИЧЕСКИ ВАЖНО: проверяем наличие переменной ПЕРЕД парсингом
    if (serviceAccountKey) {
        const serviceAccount = JSON.parse(serviceAccountKey);
        
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });

        console.log('✅ Firebase Admin SDK initialized successfully');
    } else {
        console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Admin SDK features will be unavailable.');
    }

  } catch (error: any) {
    console.error('❌ Firebase Admin Initialization Error:', error.message);
    
    // В production эта ошибка критична
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Firebase Admin SDK failed to initialize: ${error.message}`);
    }
  }
}

let adminDb: admin.firestore.Firestore;
let adminAuth: admin.auth.Auth;
let adminStorage: admin.storage.Storage;

// Проверяем, была ли успешной инициализация, перед тем как экспортировать сервисы
if (admin.apps.length > 0) {
    adminDb = admin.firestore();
    adminAuth = admin.auth();
    adminStorage = admin.storage();
} else {
    // Создаем "пустышки" или бросаем ошибку, чтобы избежать падений при импорте
    // Для разработки можно оставить пустышки, чтобы не падали другие части приложения
    if (process.env.NODE_ENV !== 'production') {
        console.log('Firebase Admin SDK not available. Using placeholder objects for development.');
        adminDb = {} as admin.firestore.Firestore;
        adminAuth = {} as admin.auth.Auth;
        adminStorage = {} as admin.storage.Storage;
    } else {
        // В продакшене это означает, что приложение не сможет работать с админскими функциями
        throw new Error("Firebase Admin SDK is not initialized. Cannot provide admin services.");
    }
}


export { adminDb, adminAuth, adminStorage };
