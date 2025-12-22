// ПОЧЕМУ ИСПРАВЛЕНО: 'use server' было некорректным. 
// Заменено на 'server-only', чтобы обозначить модуль как серверный,
// но не как Server Action, что снимает ограничение на экспорт синхронных функций.
import 'server-only';

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

const ADMIN_APP_NAME = 'firebase-admin-app-weckman159-studio';

let adminApp: App | null = null;
let adminDb: Firestore | null = null;
let adminAuth: Auth | null = null;

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

// ПОЧЕМУ ИСПРАВЛЕНО: Предыдущий mock-объект был реализован некорректно
// и вызывал ошибку типизации. Новая версия точно симулирует цепочку вызовов Firestore API
// и предотвращает падение сборки.
const mockQueryMethods = {
    get: async () => ({ docs: [], empty: true, size: 0 }),
    where: function() { return this; },
    orderBy: function() { return this; },
    limit: function() { return this; },
    startAfter: function() { return this; },
};

const mockDocRef = {
    get: async () => ({ exists: false, data: () => undefined }),
    set: async () => {},
    update: async () => {},
    delete: async () => {},
    collection: () => ({
        doc: () => mockDocRef,
        add: async () => mockDocRef,
        ...mockQueryMethods,
    }),
};

const mockCollectionRef = {
    doc: () => mockDocRef,
    add: async () => mockDocRef,
    ...mockQueryMethods,
};

const mockDb = {
  collection: () => mockCollectionRef,
} as unknown as Firestore;

const mockAuth = {
  verifyIdToken: async () => { throw new Error('Admin Auth не инициализирован.'); },
  verifySessionCookie: async () => { throw new Error('Admin Auth не инициализирован.'); },
  updateUser: async () => {},
} as unknown as Auth;


export function getAdminDb(): Firestore {
  return adminApp && adminDb ? adminDb : mockDb;
}

export function getAdminAuth(): Auth {
  return adminApp && adminAuth ? adminAuth : mockAuth;
}
