// src/firebase/client-instance.ts
import { initializeFirebase } from ".";

// Initialize Firebase and get the SDKs
const { storage } = initializeFirebase();

// Export the instances for use in client-side code
export { storage };
