
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

// ===========================
// ЛАЙКИ (Likes)
// ===========================

export const onPostLike = functions.firestore
    .document('posts/{postId}/likes/{userId}')
    .onCreate(async (snap, context) => {
        const { postId, userId } = context.params;
        const postRef = db.collection('posts').doc(postId);

        await postRef.update({
            likesCount: admin.firestore.FieldValue.increment(1)
        });

        const postSnap = await postRef.get();
        const postData = postSnap.data();

        if (postData && postData.authorId !== userId) {
            const userSnap = await db.collection('users').doc(userId).get();
            const userData = userSnap.data();
            await createNotification({
                recipientId: postData.authorId,
                senderId: userId,
                senderData: {
                    displayName: userData?.displayName || 'Пользователь',
                    photoURL: userData?.photoURL || null
                },
                type: 'like',
                title: 'Новый лайк',
                message: `оценил(а) вашу публикацию: "${postData.title.substring(0, 20)}..."`,
                actionURL: `/posts/${postId}`,
                relatedEntityId: postId,
            });
        }
    });

export const onPostUnlike = functions.firestore
    .document('posts/{postId}/likes/{userId}')
    .onDelete(async (snap, context) => {
        await db.collection('posts').doc(context.params.postId).update({
            likesCount: admin.firestore.FieldValue.increment(-1)
        });
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

        await db.collection('posts').doc(postId).update({
            commentsCount: admin.firestore.FieldValue.increment(1)
        });

        const postSnap = await db.collection('posts').doc(postId).get();
        const postData = postSnap.data();
        if (postData && postData.authorId !== commentData.authorId) {
            await createNotification({
                recipientId: postData.authorId,
                senderId: commentData.authorId,
                senderData: {
                    displayName: commentData.authorName,
                    photoURL: commentData.authorAvatar
                },
                type: 'comment',
                title: 'Новый комментарий',
                message: `прокомментировал(а): "${commentData.content.substring(0, 20)}..."`,
                actionURL: `/posts/${postId}`,
                relatedEntityId: postId,
            });
        }
    });

export const onCommentDeleted = functions.firestore
    .document('comments/{commentId}')
    .onDelete(async (snap, context) => {
        const postId = snap.data().postId;
        if (postId) {
            await db.collection('posts').doc(postId).update({
                commentsCount: admin.firestore.FieldValue.increment(-1)
            });
        }
    });

// ===========================
// ЧАТ И СООБЩЕНИЯ
// ===========================
export const onMessageCreated = functions.firestore
    .document('messages/{messageId}')
    .onCreate(async (snap, context) => {
        const messageData = snap.data();
        const { dialogId, authorId, text } = messageData;
        if (!dialogId || !authorId) return;

        const dialogRef = db.collection('dialogs').doc(dialogId);
        const dialogSnap = await dialogRef.get();
        if (!dialogSnap.exists) return;

        const dialogData = dialogSnap.data();
        const participants = dialogData?.participantIds || [];

        const batch = db.batch();
        
        // Обновляем последнее сообщение и время
        batch.update(dialogRef, {
            lastMessageText: text,
            lastMessageAt: messageData.createdAt || admin.firestore.FieldValue.serverTimestamp()
        });

        // Увеличиваем счетчик непрочитанных для всех, кроме автора
        participants.forEach((participantId: string) => {
            if (participantId !== authorId) {
                batch.update(dialogRef, {
                    [`unreadCount.${participantId}`]: admin.firestore.FieldValue.increment(1)
                });
            }
        });
        
        await batch.commit();
    });

// --- HELPER FUNCTIONS ---
async function createNotification(params: any) {
    const { recipientId, senderId } = params;
    if (recipientId === senderId) return;

    await db.collection('notifications').add({
      ...params,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
}

    