
import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

// Handler for creating a new post
export async function POST(request: NextRequest) {
  try {
    const db = getAdminDb();
    const body = await request.json();
    const { title, content, category, coverImage, authorId, communityId } = body;

    // Basic validation
    if (!title || !authorId) {
      return NextResponse.json({ error: 'Title and authorId are required' }, { status: 400 });
    }
    
    // Prepare data for Firestore
    const postData: any = {
      title,
      content: content || '',
      category: category || 'Блог',
      imageUrl: coverImage || '',
      authorId,
      status: 'published',
      likesCount: 0,
      commentsCount: 0,
      views: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      ...(communityId && { communityId }),
    };

    // Add denormalized author data for performance
    const userSnap = await db.collection('users').doc(authorId).get();
    if (userSnap.exists) {
        const userData = userSnap.data();
        postData.authorName = userData?.displayName || 'Пользователь';
        postData.authorAvatar = userData?.photoURL || '';
    } else {
        postData.authorName = 'Неизвестный автор';
        postData.authorAvatar = '';
    }

    const newPostRef = await db.collection('posts').add(postData);

    // Update the post with its own ID for easier reference in the future
    await newPostRef.update({ id: newPostRef.id });

    // Revalidate paths to show the new post immediately
    revalidatePath('/');
    revalidatePath('/posts');
    if (communityId) {
      revalidatePath(`/communities/${communityId}`);
    }
    revalidatePath(`/profile/${authorId}`);

    // Return the ID of the newly created post
    return NextResponse.json({ postId: newPostRef.id }, { status: 201 });

  } catch (error) {
    console.error('API Post Creation Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
