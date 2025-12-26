// src/app/profile/[id]/page.tsx
import { getAdminDb, getAdminAuth } from '@/lib/firebase-admin';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import type { Car, Post, User } from '@/lib/types';
import { ProfileSidebar } from '@/components/profile/ProfileSidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileActions } from '@/components/profile/ProfileActions';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { userConverter, carConverter, postConverter } from '@/lib/firestore-converters';

/**
 * ПОЧЕМУ ИСПРАВЛЕНО:
 * 1. FIREBASE CONVERTERS: Интегрированы Firestore-конвертеры для получения строго типизированных данных (`User`, `Car`, `Post`).
 * 2. НЕТ РУЧНОЙ СЕРИАЛИЗАЦИИ: Удалены все вызовы `serializeFirestoreData`, так как эту работу теперь выполняет конвертер.
 * 3. ПРОИЗВОДИТЕЛЬНОСТЬ: Все запросы к БД выполняются параллельно через `Promise.all`.
 */

async function getProfileData(profileId: string) {
  const db = getAdminDb();
  try {
    // ПОЧЕМУ ИСПРАВЛЕНО: Используем .withConverter для автоматического преобразования данных.
    const userRef = db.collection('users').withConverter(userConverter).doc(profileId);
    
    // Запускаем все запросы параллельно для максимальной производительности
    const [userSnap, carsSnap, postsSnap, followersSnap, followingSnap] = await Promise.all([
      userRef.get(),
      db.collection('cars').withConverter(carConverter).where('userId', '==', profileId).get(),
      db.collection('posts').withConverter(postConverter).where('authorId', '==', profileId).orderBy('createdAt', 'desc').get(),
      userRef.collection('followers').get(),
      userRef.collection('following').get()
    ]);

    if (!userSnap.exists) {
      notFound();
    }
    
    // `serializeFirestoreData` больше не нужен. `userSnap.data()` уже возвращает типизированный объект `User`.
    const profile = userSnap.data();
    if (!profile) notFound(); // Добавлена проверка на случай, если data() вернет undefined

    const cars = carsSnap.docs.map(d => d.data());
    const posts = postsSnap.docs.map(d => d.data());
    const followers = followersSnap.docs.map(d => d.id);
    const following = followingSnap.docs.map(d => d.id);

    // Дополняем статистику профиля актуальными данными
    profile.stats = {
        ...profile.stats,
        postsCount: posts.length,
        carsCount: cars.length,
        followersCount: followers.length,
        followingCount: following.length,
    };

    return { profile, cars, posts, followers };
  } catch (error) {
    console.error("Error fetching profile data on server:", error);
    notFound(); // В случае ошибки показываем 404
  }
}

async function getCurrentUserId() {
  try {
    const sessionCookie = (await cookies()).get('session')?.value;
    if (!sessionCookie) return null;
    
    const auth = getAdminAuth();
    const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
    return decodedToken.uid;
  } catch (error) {
    // Session cookie is invalid or expired.
    return null;
  }
}

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { profile, cars, posts, followers } = await getProfileData(id);
    const currentUserId = await getCurrentUserId();
    
    const isOwner = currentUserId === profile.id;
    const isFollowing = !!currentUserId && followers.includes(currentUserId);
    
    return (
        <div className="p-4 md:p-8">
            <div className="min-h-screen">
                {/* Simplified Hero */}
                <div className="p-6 md:p-8 rounded-2xl holographic-panel mb-8">
                    <div className="flex flex-col sm:flex-row items-start gap-6">
                        <Avatar className="h-24 w-24 md:h-32 md:w-32 rounded-2xl ring-4 ring-offset-4 ring-offset-background bg-primary/20 p-1">
                            <AvatarImage src={profile.photoURL} className="rounded-xl" />
                            <AvatarFallback className="rounded-xl text-4xl">{profile.displayName?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-white">{profile.displayName}</h1>
                            <p className="text-text-secondary mb-4">@{profile.nickname || profile.email?.split('@')[0]}</p>
                            <div className="flex flex-wrap items-center gap-6 text-white mb-4">
                                <span className="hover:text-primary"><span className="font-bold text-xl">{profile.stats?.followersCount}</span><span className="text-text-secondary text-sm ml-2">Подписчиков</span></span>
                                <span className="hover:text-primary"><span className="font-bold text-xl">{profile.stats?.followingCount}</span><span className="text-text-secondary text-sm ml-2">Подписок</span></span>
                                <div><span className="font-bold text-xl">{profile.stats?.carsCount}</span><span className="text-text-secondary text-sm ml-2">Машин</span></div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <ProfileActions 
                                    targetUserId={profile.id}
                                    isOwner={isOwner}
                                    isFollowing={isFollowing}
                                    onEditClick={() => { /* This will be handled on client */ }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="hidden lg:block lg:col-span-1">
                        <ProfileSidebar profile={profile} />
                    </div>
                    
                    <div className="lg:col-span-3">
                       <ProfileTabs posts={posts} cars={cars} profileId={profile.id} isOwner={isOwner} />
                    </div>
                </div>
            </div>
        </div>
    );
}
