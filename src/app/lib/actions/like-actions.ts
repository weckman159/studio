// app/lib/actions/like-actions.ts
'use server';

import 'server-only';
import { getAdminDb, getAdminAuth } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { FieldValue } from 'firebase-admin/firestore';

async function getUserIdFromSession(): Promise<string | null> {
  try {
    const sessionCookie = (await cookies()).get('session')?.value;
    if (!sessionCookie) return null;
    const auth = getAdminAuth();
    return (await auth.verifySessionCookie(sessionCookie, true)).uid;
  } catch {
    return null;
  }
}

/**
 * Server Action для атомарного добавления/удаления лайка.
 * Использует транзакцию Firestore для гарантии целостности данных.
 * @param postId ID поста, который лайкают.
 * @param isCurrentlyLiked Текущее состояние лайка для данного пользователя.
 */
export async function toggleLike(postId: string, isCurrentlyLiked: boolean) {
  const userId = await getUserIdFromSession();
  if (!userId) {
    throw new Error('Пользователь не авторизован.');
  }

  const db = getAdminDb();
  const postRef = db.collection('posts').doc(postId);
  const likeRef = db.collection('posts').doc(postId).collection('likes').doc(userId);

  try {
    await db.runTransaction(async (transaction) => {
      if (isCurrentlyLiked) {
        // --- Логика удаления лайка ---
        transaction.delete(likeRef);
        transaction.update(postRef, { likesCount: FieldValue.increment(-1) });
      } else {
        // --- Логика добавления лайка ---
        transaction.set(likeRef, { userId, createdAt: FieldValue.serverTimestamp() });
        transaction.update(postRef, { likesCount: FieldValue.increment(1) });
      }
    });

    // Ревалидация кэша страницы поста
    revalidatePath(`/posts/${postId}`);
  } catch (error) {
    console.error('Ошибка в транзакции toggleLike:', error);
    // Выбрасываем ошибку, чтобы React мог откатить optimistic update
    throw new Error('Не удалось обновить статус лайка.');
  }
}
