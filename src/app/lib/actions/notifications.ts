// app/lib/actions/notifications.ts
'use server';

import 'server-only';
import { getAdminDb, getAdminAuth } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// Утилита для безопасного получения ID текущего пользователя из сессии
async function getCurrentUserId(): Promise<string | null> {
  try {
    const sessionCookie = (await cookies()).get('session')?.value;
    if (!sessionCookie) {
      console.warn('Действие отклонено: отсутствует сессионный cookie.');
      return null;
    }
    const auth = getAdminAuth();
    const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
    return decodedToken.uid;
  } catch (error) {
    console.error('Ошибка верификации сессии в Server Action:', error);
    return null;
  }
}

/**
 * Server Action для отметки уведомления как прочитанного.
 * Гарантирует, что пользователь может изменять статус только своих уведомлений.
 * @param notificationId ID уведомления для обновления.
 */
export async function markNotificationAsRead(notificationId: string): Promise<{ success: boolean; error?: string }> {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    return { success: false, error: 'Пользователь не авторизован.' };
  }
  
  if (!notificationId) {
    return { success: false, error: 'Не указан ID уведомления.' };
  }

  try {
    const db = getAdminDb();
    const notificationRef = db.collection('notifications').doc(notificationId);
    const notificationDoc = await notificationRef.get();

    if (!notificationDoc.exists) {
      return { success: false, error: 'Уведомление не найдено.' };
    }
    
    // Ключевая проверка безопасности: пользователь может менять только свои уведомления
    if (notificationDoc.data()?.recipientId !== userId) {
      return { success: false, error: 'Недостаточно прав.' };
    }
    
    await notificationRef.update({ read: true });

    // Хотя onSnapshot обновит UI, ревалидация полезна для других частей системы
    revalidatePath('/'); 

    return { success: true };
  } catch (error) {
    console.error('Ошибка в Server Action markNotificationAsRead:', error);
    return { success: false, error: 'Внутренняя ошибка сервера.' };
  }
}
