// app/lib/actions/posts.ts
'use server';

import { z } from 'zod';
import { getAdminDb, getAdminAuth } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { FieldValue } from 'firebase-admin/firestore';

// Схема валидации поста с помощью Zod
const PostSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(5, 'Заголовок должен содержать минимум 5 символов').max(100, 'Заголовок не длиннее 100 символов'),
  content: z.string().default(''), // Содержимое может быть пустым, если есть фото
  category: z.string().min(1, 'Категория обязательна'),
  imageUrl: z.string().url().optional().or(z.literal('')),
  blurhash: z.string().optional(),
  communityId: z.string().optional(),
});

// Тип для состояния Server Action
export type ActionState = {
  message: string;
  errors?: {
    title?: string[];
    content?: string[];
    category?: string[];
    imageUrl?: string[];
  };
  success: boolean;
  postId?: string;
};

// Функция для получения ID пользователя из сессии
async function getUserIdFromSession(): Promise<string | null> {
  try {
    const sessionCookie = (await cookies()).get('session')?.value;
    if (!sessionCookie) return null;
    const auth = getAdminAuth();
    const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
    return decodedToken.uid;
  } catch {
    return null;
  }
}

/**
 * Server Action для создания/обновления поста (Upsert).
 * Валидирует данные, выполняет запись в Firestore и ревалидирует кэш.
 */
export async function upsertPost(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const authorId = await getUserIdFromSession();
  if (!authorId) {
    return { success: false, message: 'Ошибка авторизации.' };
  }

  // Парсинг и валидация данных формы
  const validatedFields = PostSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Ошибка валидации. Проверьте заполненные поля.',
    };
  }
  
  const { id, ...postData } = validatedFields.data;
  const isEditMode = !!id;

  try {
    const db = getAdminDb();
    const postId = isEditMode ? id : db.collection('posts').doc().id;
    const postRef = db.collection('posts').doc(postId);

    const dataToSet = {
        ...postData,
        authorId,
        updatedAt: FieldValue.serverTimestamp(),
    };
    
    if (isEditMode) {
        // Обновление существующего поста
        await postRef.update(dataToSet);
    } else {
        // Создание нового поста
        const userDoc = await db.collection('users').doc(authorId).get();
        const userData = userDoc.data();

        await postRef.set({
            ...dataToSet,
            id: postId,
            authorName: userData?.displayName || 'Пользователь',
            authorAvatar: userData?.photoURL || '',
            createdAt: FieldValue.serverTimestamp(),
            likesCount: 0,
            commentsCount: 0,
            views: 0,
            status: 'published',
        });
    }
    
    // Ревалидация кэша для мгновенного обновления UI
    revalidatePath('/');
    revalidatePath('/posts');
    if (postData.communityId) {
        revalidatePath(`/communities/${postData.communityId}`);
    }
    revalidatePath(`/posts/${postId}`);
    
    return { success: true, message: isEditMode ? 'Пост обновлен' : 'Пост опубликован', postId };

  } catch (error) {
    console.error('Ошибка upsertPost:', error);
    return { success: false, message: 'Внутренняя ошибка сервера. Не удалось сохранить пост.' };
  }
}
