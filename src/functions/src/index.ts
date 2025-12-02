
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

// ===========================
// ЛАЙКИ (Likes)
// ===========================

// Триггер: Когда создается документ в подколлекции likes
export const onPostLike = functions.firestore
    .document('posts/{postId}/likes/{userId}')
    .onCreate(async (snap, context) => {
        const { postId, userId } = context.params;
        const postRef = db.collection('posts').doc(postId);

        // 1. Атомарно увеличиваем счетчик
        await postRef.update({
            likesCount: admin.firestore.FieldValue.increment(1)
        });

        // 2. Отправляем уведомление автору поста
        const postSnap = await postRef.get();
        const postData = postSnap.data();

        // Не уведомляем, если лайкнул сам себя
        if (postData && postData.authorId !== userId) {
            // Получаем инфо о том, кто лайкнул
            const userSnap = await db.collection('users').doc(userId).get();
            const userData = userSnap.data();

            await db.collection('notifications').add({
                recipientId: postData.authorId,
                senderId: userId,
                senderData: {
                    displayName: userData?.displayName || 'Пользователь',
                    photoURL: userData?.photoURL || null
                },
                type: 'like',
                title: 'Новый лайк',
                message: 'понравилась ваша публикация',
                actionURL: `/posts/${postId}`,
                relatedEntityId: postId,
                read: false,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }
    });

// Триггер: Когда удаляется лайк (Unlike)
export const onPostUnlike = functions.firestore
    .document('posts/{postId}/likes/{userId}')
    .onDelete(async (snap, context) => {
        const { postId } = context.params;
        
        // Уменьшаем счетчик
        await db.collection('posts').doc(postId).update({
            likesCount: admin.firestore.FieldValue.increment(-1)
        });
        
        // Опционально: можно удалять уведомление, но обычно это не делают
    });


// ===========================
// КОММЕНТАРИИ (Comments)
// ===========================

export const onCommentCreated = functions.firestore
    .document('comments/{commentId}')
    .onCreate(async (snap, context) => {
        const commentData = snap.data();
        const postId = commentData.postId;

        if (!postId) return;

        // 1. Увеличиваем счетчик
        await db.collection('posts').doc(postId).update({
            commentsCount: admin.firestore.FieldValue.increment(1)
        });

        // 2. Уведомление автору поста
        const postSnap = await db.collection('posts').doc(postId).get();
        const postData = postSnap.data();

        if (postData && postData.authorId !== commentData.authorId) {
            await db.collection('notifications').add({
                recipientId: postData.authorId,
                senderId: commentData.authorId,
                senderData: {
                    displayName: commentData.authorName,
                    photoURL: commentData.authorAvatar
                },
                type: 'comment',
                title: 'Новый комментарий',
                message: `прокомментировал: "${commentData.content.substring(0, 20)}..."`,
                actionURL: `/posts/${postId}`,
                relatedEntityId: postId,
                read: false,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }
    });

export const onCommentDeleted = functions.firestore
    .document('comments/{commentId}')
    .onDelete(async (snap, context) => {
        const commentData = snap.data();
        const postId = commentData.postId;

        if (postId) {
            await db.collection('posts').doc(postId).update({
                commentsCount: admin.firestore.FieldValue.increment(-1)
            });
        }
    });
