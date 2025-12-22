
import 'server-only';
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

const ADMIN_APP_NAME = 'firebase-admin-app-weckman159-studio';

// ПОЧЕМУ ИСПРАВЛЕНО: Глобальные переменные вынесены на уровень модуля и могут быть null,
// что позволяет приложению запуститься даже при ошибке инициализации.
export let adminApp: App | null = null;
let adminDb: Firestore | null = null;
let adminAuth: Auth | null = null;


// ПОЧЕМУ ИСПРАВЛЕНО: Вместо падения приложения при отсутствии ключа,
// мы теперь обрабатываем ошибку в try-catch, выводим предупреждение и продолжаем работу
// в "mock" режиме. Это повышает отказоустойчивость и упрощает разработку.
try {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccountKey) {
    const serviceAccount = JSON.parse(serviceAccountKey);
    const existingApp = getApps().find(app => app.name === ADMIN_APP_NAME);
    
    adminApp = existingApp || initializeApp({
      credential: cert(serviceAccount),
    }, ADMIN_APP_NAME);
    
    adminDb = getFirestore(adminApp);
    adminAuth = getAuth(adminApp);
    
    console.log('✅ Firebase Admin SDK инициализирован успешно.');

  } else {
    console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT_KEY не установлена. Admin SDK работает в mock-режиме. Серверные данные не будут загружены.');
  }
} catch (error: any) {
    console.error('❌ Ошибка инициализации Firebase Admin SDK:', error.message);
    console.warn('⚠️ Admin SDK работает в mock-режиме из-за ошибки инициализации.');
}

// ПОЧЕМУ ИСПРАВЛЕНО: Функции теперь возвращают mock-объект, если
// инициализация провалилась. Это предотвращает крэш серверных компонентов,
// которые ожидают получить экземпляр Firestore или Auth.
const mockDb = {
  collection: () => ({
    doc: () => ({
      get: async () => ({ exists: false, data: () => undefined }),
      set: async () => {},
      update: async () => {},
      delete: async () => {},
      collection: () => mockDb.collection().where(),
    }),
    where: () => ({
      get: async () => ({ docs: [] }),
      orderBy: () => ({ limit: () => ({ get: async () => ({ docs: [] }) }) }),
    }),
    orderBy: () => ({ limit: () => ({ get: async () => ({ docs: [] }) }) }),
    get: async () => ({ docs: [] }),
    add: async () => ({ id: 'mockId' }),
  }),
} as unknown as Firestore;

const mockAuth = {
  verifyIdToken: async () => { throw new Error('Admin Auth не инициализирован.'); },
  verifySessionCookie: async () => { throw new Error('Admin Auth не инициализирован.'); },
  updateUser: async () => {},
} as unknown as Auth;


export function getAdminDb(): Firestore {
  return adminDb || mockDb;
}

export function getAdminAuth(): Auth {
  return adminAuth || mockAuth;
}
