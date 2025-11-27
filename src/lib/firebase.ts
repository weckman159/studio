import { initializeFirebase } from '@/firebase/index';
export const { firebaseApp, auth, firestore } = initializeFirebase();
export const storage = getStorage(firebaseApp);
import { getStorage } from 'firebase/storage';
