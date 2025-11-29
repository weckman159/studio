'use client';
import {
  Auth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';

/**
 * Initiates an email/password sign-up and returns a promise that resolves on completion
 * or rejects on error. This is a change from a pure non-blocking approach to provide
 * immediate feedback to the UI. The global auth state will still be updated by onAuthStateChanged.
 */
export async function initiateEmailSignUp(authInstance: Auth, email: string, password: string): Promise<void> {
  try {
    await createUserWithEmailAndPassword(authInstance, email, password);
  } catch (error) {
    // Re-throw the error to be caught by the calling function's try-catch block.
    throw error;
  }
}

/**
 * Initiates an email/password sign-in and returns a promise that resolves on completion
 * or rejects on error. This provides immediate feedback while still allowing the global
 * auth state to be handled by the onAuthStateChanged listener.
 */
export async function initiateEmailSignIn(authInstance: Auth, email: string, password: string): Promise<void> {
  try {
    await signInWithEmailAndPassword(authInstance, email, password);
  } catch (error) {
    // Re-throw the error to be caught by the UI.
    throw error;
  }
}
