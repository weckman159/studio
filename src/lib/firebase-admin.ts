
import 'server-only';
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

const ADMIN_APP_NAME = 'firebase-admin-app-weckman159-studio';

let adminApp: App | undefined;

function getAdminApp(): App {
  // Если приложение уже было создано, возвращаем его
  const existingApp = getApps().find(app => app.name === ADMIN_APP_NAME);
  if (existingApp) {
    return existingApp;
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY не установлена. Firebase Admin SDK не может быть инициализирован.');
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountKey);
    
    // Инициализируем приложение с уникальным именем
    adminApp = initializeApp({
      credential: cert(serviceAccount),
    }, ADMIN_APP_NAME);
    
    console.log('✅ Firebase Admin SDK инициализирован успешно.');
    return adminApp;
  } catch (error: any) {
    console.error('❌ Ошибка инициализации Firebase Admin SDK:', error.message);
    throw new Error('Не удалось инициализировать Firebase Admin SDK. Проверьте ключ сервисного аккаунта.');
  }
}

export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp());
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}
