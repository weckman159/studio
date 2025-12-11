import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    const { title, content, category, coverImage, authorId } = await req.json();

    if (!title || !content || !authorId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    
    // Получаем данные автора
    const userDoc = await db.collection('users').doc(authorId).get();
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const batch = db.batch();

    // Создаем пост с полными данными автора
    const postRef = db.collection('posts').doc();
    batch.set(postRef, {
      title,
      content,
      category: category || 'Блог',
      coverImage: coverImage || '',
      authorId,
      authorName: userData?.displayName || userData?.name || 'Аноним',
      authorAvatar: userData?.photoURL || userData?.avatar || '',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      likes: 0,
      comments: 0,
      views: 0,
    });

    // Обновляем счетчик постов пользователя
    const userRef = db.collection('users').doc(authorId);
    batch.update(userRef, {
      postsCount: (userData?.postsCount || 0) + 1,
    });

    await batch.commit();

    return NextResponse.json({ postId: postRef.id });
  } catch (error) {
    console.error('Post creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
