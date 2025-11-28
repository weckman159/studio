import { initializeFirebase } from '@/firebase/index';
import { getStorage } from 'firebase/storage';

export const { firebaseApp, auth, firestore } = initializeFirebase();
export const storage = getStorage(firebaseApp);
