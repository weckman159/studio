
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import fetch from 'node-fetch';

admin.initializeApp();
const db = admin.firestore();

// ===========================
// Обновление счетчиков
// ===========================

/**
 * При создании лайка увеличиваем счетчик
 */
export const onLikeCreated = functions.firestore
  .document('posts/{postId}/likes/{likeId}')
  .onCreate(async (snap, context) => {
    const { postId } = context.params;
    const likeData = snap.data();

    try {
      // Увеличиваем счетчик лайков у поста
      await db.collection('posts').doc(postId).update({
        likesCount: admin.firestore.FieldValue.increment(1)
      });

      // Создаем уведомление для автора поста
      const postDoc = await db.collection('posts').doc(postId).get();
      const postData = postDoc.data();

      if (postData && postData.authorId !== likeData.userId) {
        await createNotification({
          recipientId: postData.authorId,
          senderId: likeData.userId,
          type: 'like',
          title: 'Новый лайк',
          message: 'понравился ваш пост',
          actionURL: `/post/${postId}`,
          relatedEntityId: postId,
          relatedEntityType: 'post'
        });
      }
    } catch (error) {
      console.error('Error in onLikeCreated:', error);
    }
  });

/**
 * При удалении лайка уменьшаем счетчик
 */
export const onLikeDeleted = functions.firestore
  .document('posts/{postId}/likes/{likeId}')
  .onDelete(async (snap, context) => {
    const { postId } = context.params;

    try {
      await db.collection('posts').doc(postId).update({
        likesCount: admin.firestore.FieldValue.increment(-1)
      });
    } catch (error) {
      console.error('Error in onLikeDeleted:', error);
    }
  });

/**
 * При создании комментария увеличиваем счетчик
 */
export const onCommentCreated = functions.firestore
  .document('comments/{commentId}')
  .onCreate(async (snap, context) => {
    const commentData = snap.data();
    const { postId } = commentData;

    if (!postId) {
        console.warn('Comment created without postId:', context.params.commentId);
        return;
    }

    try {
      // Увеличиваем счетчик комментариев у поста
      const postRef = db.collection('posts').doc(postId);
      await postRef.update({
        commentsCount: admin.firestore.FieldValue.increment(1)
      });
      
      // Создаем уведомление для автора поста
      const postDoc = await postRef.get();
      const postData = postDoc.data();

      if (postData && postData.authorId !== commentData.authorId) {
        await createNotification({
          recipientId: postData.authorId,
          senderId: commentData.authorId,
          type: 'comment',
          title: 'Новый комментарий',
          message: 'оставил комментарий к вашему посту',
          actionURL: `/posts/${postId}`,
          relatedEntityId: postId,
          relatedEntityType: 'post'
        });
      }
    } catch (error) {
      console.error('Error in onCommentCreated:', error);
    }
  });


/**
 * При удалении комментария уменьшаем счетчик
 */
export const onCommentDeleted = functions.firestore
  .document('comments/{commentId}')
  .onDelete(async (snap, context) => {
    const commentData = snap.data();
    const { postId } = commentData;
    
    if (!postId) {
        return;
    }

    try {
      await db.collection('posts').doc(postId).update({
        commentsCount: admin.firestore.FieldValue.increment(-1)
      });

    } catch (error) {
      console.error('Error in onCommentDeleted:', error);
    }
  });

// ===========================
// Управление подписками
// ===========================

/**
 * При создании подписки обновляем счетчики
 */
export const onFollowCreated = functions.firestore
  .document('users/{userId}/following/{followingId}')
  .onCreate(async (snap, context) => {
    const { userId, followingId } = context.params;

    try {
      const batch = db.batch();

      // Увеличиваем счетчик подписок у пользователя
      const userRef = db.collection('users').doc(userId);
      batch.update(userRef, {
        'stats.followingCount': admin.firestore.FieldValue.increment(1)
      });

      // Увеличиваем счетчик подписчиков у того, на кого подписались
      const followingUserRef = db.collection('users').doc(followingId);
      batch.update(followingUserRef, {
        'stats.followersCount': admin.firestore.FieldValue.increment(1)
      });

      // Создаем зеркальную запись в коллекции followers
      const followerRef = db
        .collection('users')
        .doc(followingId)
        .collection('followers')
        .doc(userId);
      batch.set(followerRef, {
        userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      await batch.commit();

      // Создаем уведомление
      await createNotification({
        recipientId: followingId,
        senderId: userId,
        type: 'follow',
        title: 'Новый подписчик',
        message: 'подписался на вас',
        actionURL: `/profile/${userId}`
      });
    } catch (error) {
      console.error('Error in onFollowCreated:', error);
    }
  });

/**
 * При удалении подписки обновляем счетчики
 */
export const onFollowDeleted = functions.firestore
  .document('users/{userId}/following/{followingId}')
  .onDelete(async (snap, context) => {
    const { userId, followingId } = context.params;

    try {
      const batch = db.batch();

      const userRef = db.collection('users').doc(userId);
      batch.update(userRef, {
        'stats.followingCount': admin.firestore.FieldValue.increment(-1)
      });

      const followingUserRef = db.collection('users').doc(followingId);
      batch.update(followingUserRef, {
        'stats.followersCount': admin.firestore.FieldValue.increment(-1)
      });

      const followerRef = db
        .collection('users')
        .doc(followingId)
        .collection('followers')
        .doc(userId);
      batch.delete(followerRef);

      await batch.commit();
    } catch (error) {
      console.error('Error in onFollowDeleted:', error);
    }
  });

// ===========================
// Управление автомобилями
// ===========================

/**
 * При создании автомобиля увеличиваем счетчик у пользователя
 */
export const onCarCreated = functions.firestore
  .document('cars/{carId}')
  .onCreate(async (snap, context) => {
    const carData = snap.data();

    try {
      await db.collection('users').doc(carData.userId).update({
        'stats.carsCount': admin.firestore.FieldValue.increment(1)
      });
    } catch (error) {
      console.error('Error in onCarCreated:', error);
    }
  });

/**
 * При удалении автомобиля уменьшаем счетчик у пользователя
 */
export const onCarDeleted = functions.firestore
  .document('cars/{carId}')
  .onDelete(async (snap, context) => {
    const carData = snap.data();

    try {
      await db.collection('users').doc(carData.userId).update({
        'stats.carsCount': admin.firestore.FieldValue.increment(-1)
      });
    } catch (error) {
      console.error('Error in onCarDeleted:', error);
    }
  });

// ===========================
// Управление постами
// ===========================

/**
 * При создании поста увеличиваем счетчик у пользователя и рассылаем по лентам
 */
export const onPostCreated = functions.firestore
  .document('posts/{postId}')
  .onCreate(async (snap, context) => {
    const postData = snap.data();
    const postId = context.params.postId;
    const authorId = postData.authorId;

    try {
      const batch = db.batch();

      // Увеличиваем счетчик постов у пользователя
      const userRef = db.collection('users').doc(authorId);
      batch.update(userRef, {
        'stats.postsCount': admin.firestore.FieldValue.increment(1)
      });

      // Если пост связан с автомобилем, увеличиваем счетчик постов у машины
      if (postData.carId) {
        const carRef = db.collection('cars').doc(postData.carId);
        batch.update(carRef, {
          postsCount: admin.firestore.FieldValue.increment(1)
        });
      }

      // Если пост создан в сообществе, увеличиваем счетчик постов в сообществе
      if (postData.communityId) {
          const communityRef = db.collection('communities').doc(postData.communityId);
          batch.update(communityRef, {
              postsCount: admin.firestore.FieldValue.increment(1)
          });
      }

      await batch.commit();

      // Рассылка поста по лентам подписчиков (Fan-out)
      const followersSnapshot = await db.collection('users').doc(authorId).collection('followers').get();
      if (!followersSnapshot.empty) {
        const feedBatch = db.batch();
        followersSnapshot.forEach(doc => {
          const followerId = doc.id;
          const userFeedRef = db.collection('users').doc(followerId).collection('feed').doc(postId);
          feedBatch.set(userFeedRef, {
            postId: postId,
            authorId: authorId,
            createdAt: postData.createdAt
          });
        });
        // Добавляем пост в свою же ленту
        const authorFeedRef = db.collection('users').doc(authorId).collection('feed').doc(postId);
        feedBatch.set(authorFeedRef, {
          postId: postId,
          authorId: authorId,
          createdAt: postData.createdAt
        });
        await feedBatch.commit();
      }

    } catch (error) {
      console.error('Error in onPostCreated:', error);
    }
  });

/**
 * При удалении поста уменьшаем счетчик у пользователя и удаляем из лент
 */
export const onPostDeleted = functions.firestore
  .document('posts/{postId}')
  .onDelete(async (snap, context) => {
    const postData = snap.data();
    const postId = context.params.postId;
    const authorId = postData.authorId;

    try {
      const batch = db.batch();

      const userRef = db.collection('users').doc(authorId);
      batch.update(userRef, {
        'stats.postsCount': admin.firestore.FieldValue.increment(-1)
      });

      if (postData.carId) {
        const carRef = db.collection('cars').doc(postData.carId);
        batch.update(carRef, {
          postsCount: admin.firestore.FieldValue.increment(-1)
        });
      }

       // Если пост удален из сообщества, уменьшаем счетчик постов в сообществе
      if (postData.communityId) {
          const communityRef = db.collection('communities').doc(postData.communityId);
          batch.update(communityRef, {
              postsCount: admin.firestore.FieldValue.increment(-1)
          });
      }

      await batch.commit();
      
      // Удаляем пост из лент подписчиков
      const followersSnapshot = await db.collection('users').doc(authorId).collection('followers').get();
      if (!followersSnapshot.empty) {
        const feedBatch = db.batch();
        followersSnapshot.forEach(doc => {
          const followerId = doc.id;
          const userFeedRef = db.collection('users').doc(followerId).collection('feed').doc(postId);
          feedBatch.delete(userFeedRef);
        });
        // Удаляем из своей ленты
        const authorFeedRef = db.collection('users').doc(authorId).collection('feed').doc(postId);
        feedBatch.delete(authorFeedRef);
        await feedBatch.commit();
      }


    } catch (error) {
      console.error('Error in onPostDeleted:', error);
    }
  });

// ===========================
// Управление профилем
// ===========================

/**
 * При обновлении профиля обновляем денормализованные данные
 */
export const onUserUpdated = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    const { userId } = context.params;
    const beforeData = change.before.data();
    const afterData = change.after.data();

    // Проверяем, изменились ли displayName или photoURL
    if (
      beforeData.displayName === afterData.displayName &&
      beforeData.photoURL === afterData.photoURL
    ) {
      return;
    }

    try {
      const batch = db.batch();
      const userData = {
        displayName: afterData.displayName,
        photoURL: afterData.photoURL
      };

      // Обновляем посты пользователя
      const postsSnapshot = await db
        .collection('posts')
        .where('authorId', '==', userId)
        .get();

      postsSnapshot.forEach(doc => {
        batch.update(doc.ref, { authorName: userData.displayName, authorAvatar: userData.photoURL });
      });

      // Обновляем комментарии пользователя
      const commentsQuery = await db
        .collectionGroup('comments')
        .where('authorId', '==', userId)
        .get();

      commentsQuery.forEach(doc => {
        batch.update(doc.ref, { authorName: userData.displayName, authorAvatar: userData.photoURL });
      });
      
      // Обновляем объявления пользователя
      const listingsQuery = await db
        .collection('marketplace')
        .where('sellerId', '==', userId)
        .get();

      listingsQuery.forEach(doc => {
        batch.update(doc.ref, { sellerName: userData.displayName, sellerAvatar: userData.photoURL });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error in onUserUpdated:', error);
    }
  });

// ===========================
// Автозагрузка мастерских
// ===========================
const GOOGLE_PLACES_API_KEY = functions.config().google_places?.api_key;

export const fetchWorkshops = functions.pubsub
  .schedule('every 12 hours')
  .onRun(async (context) => {
    if (!GOOGLE_PLACES_API_KEY) {
      console.log('Google Places API key is not configured. Skipping fetchWorkshops.');
      return null;
    }

    const CITIES = [
      { name: 'Москва', lat: 55.7558, lng: 37.6173 },
      { name: 'Санкт-Петербург', lat: 59.9343, lng: 30.3351 },
      { name: 'Казань', lat: 55.7904, lng: 49.1140 }
    ];

    for (const city of CITIES) {
      const radius = 20000; // 20km
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${city.lat},${city.lng}&radius=${radius}&type=car_repair&language=ru&key=${GOOGLE_PLACES_API_KEY}`;

      try {
        const res = await fetch(url);
        const json: any = await res.json();

        if (json.results) {
            for (const item of json.results) {
                const wsId = item.place_id;
                if (!wsId) continue;
                
                const docRef = db.collection('workshops').doc(wsId);
                const specialty = item.types.includes('car_repair') ? 'Мультибренд' : '';
                const addr = item.vicinity || item.formatted_address || '';
                const name = item.name || 'Мастерская';
                const imageUrl = item.photos?.[0]
                  ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${item.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}` : '';

                await docRef.set({
                  name,
                  city: city.name,
                  address: addr,
                  specialization: specialty,
                  rating: item.rating || 0,
                  reviewsCount: item.user_ratings_total || 0,
                  imageUrl,
                  source: 'Google Places',
                  updatedAt: admin.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            }
        }
      } catch (err) {
        console.error(`Ошибка автозагрузки мастерских для ${city.name}:`, err);
      }
    }
    return null;
  });


// ===========================
// Утилиты
// ===========================

interface CreateNotificationParams {
  recipientId: string;
  senderId?: string;
  type: string;
  title: string;
  message: string;
  actionURL?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
}

async function createNotification(params: CreateNotificationParams) {
  const {
    recipientId,
    senderId,
    type,
    title,
    message,
    actionURL,
    relatedEntityId,
    relatedEntityType
  } = params;

  try {
    let senderData = null;
    if (senderId) {
      const senderDoc = await db.collection('users').doc(senderId).get();
      const sender = senderDoc.data();
      if (sender) {
        senderData = {
          displayName: sender.displayName,
          photoURL: sender.photoURL
        };
      }
    }

    await db.collection('notifications').add({
      recipientId,
      senderId,
      senderData,
      type,
      title,
      message,
      actionURL,
      relatedEntityId,
      relatedEntityType,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}
