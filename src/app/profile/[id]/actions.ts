
// src/app/profile/[id]/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { getAdminDb, getAdminAuth } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { FieldValue } from 'firebase-admin/firestore';

async function getUserIdFromSession(): Promise<string | null> {
  try {
    // ПОЧЕМУ ИСПРАВЛЕНО: функция cookies() теперь асинхронна и требует await.
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    if (!sessionCookie) {
      return null;
    }
    const decodedToken = await getAdminAuth().verifySessionCookie(sessionCookie, true);
    return decodedToken.uid;
  } catch (error) {
    console.error('Failed to verify session cookie in server action:', error);
    return null;
  }
}

export async function followUser(targetUserId: string) {
  const currentUserId = await getUserIdFromSession();
  
  if (!currentUserId || currentUserId === targetUserId) {
    throw new Error('Authentication failed or invalid action');
  }

  const db = getAdminDb();
  const batch = db.batch();

  // Add target to current user's following list
  const followingRef = db.collection('users').doc(currentUserId).collection('following').doc(targetUserId);
  batch.set(followingRef, { createdAt: FieldValue.serverTimestamp() });

  // Add current user to target's followers list
  const followerRef = db.collection('users').doc(targetUserId).collection('followers').doc(currentUserId);
  batch.set(followerRef, { createdAt: FieldValue.serverTimestamp() });
  
  // Increment counters
  const currentUserStatsRef = db.collection('users').doc(currentUserId);
  batch.update(currentUserStatsRef, { 'stats.followingCount': FieldValue.increment(1) });
  
  const targetUserStatsRef = db.collection('users').doc(targetUserId);
  batch.update(targetUserStatsRef, { 'stats.followersCount': FieldValue.increment(1) });

  await batch.commit();

  revalidatePath(`/profile/${targetUserId}`);
}

export async function unfollowUser(targetUserId: string) {
  const currentUserId = await getUserIdFromSession();

  if (!currentUserId) {
    throw new Error('Authentication failed');
  }
  
  const db = getAdminDb();
  const batch = db.batch();

  // Remove target from current user's following list
  const followingRef = db.collection('users').doc(currentUserId).collection('following').doc(targetUserId);
  batch.delete(followingRef);

  // Remove current user from target's followers list
  const followerRef = db.collection('users').doc(targetUserId).collection('followers').doc(currentUserId);
  batch.delete(followerRef);
  
  // Decrement counters
  const currentUserStatsRef = db.collection('users').doc(currentUserId);
  batch.update(currentUserStatsRef, { 'stats.followingCount': FieldValue.increment(-1) });
  
  const targetUserStatsRef = db.collection('users').doc(targetUserId);
  batch.update(targetUserStatsRef, { 'stats.followersCount': FieldValue.increment(-1) });

  await batch.commit();

  revalidatePath(`/profile/${targetUserId}`);
}
