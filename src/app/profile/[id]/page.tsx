
// src/app/profile/[id]/page.tsx
import { getAdminDb } from '@/lib/firebase-admin'
import type { Car, User, Post } from '@/lib/types'
import { ProfileClientPage } from '@/components/profile/ProfileClientPage'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { ProfilePageSkeleton } from '@/components/profile/ProfilePageSkeleton'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getProfileData(profileId: string) {
  try {
    const adminDb = getAdminDb()
    
    // 1. Fetch Profile
    const profileRef = adminDb.collection('users').doc(profileId)
    let profileSnap = await profileRef.get()
    
    // ✅ Создаем mock-пользователя БЕЗ рекурсии
    if (!profileSnap.exists && profileId === 'dev-user-01') {
      const mockUserData = {
        id: 'dev-user-01',
        uid: 'dev-user-01',
        displayName: 'Dev User',
        name: 'Dev User',
        email: 'dev@autosphere.com',
        photoURL: 'https://avatar.vercel.sh/dev.png',
        role: 'admin',
        createdAt: new Date(),
      }
      await profileRef.set(mockUserData)
      const newSnap = await profileRef.get()
      
      const profile: User = { id: newSnap.id, ...(newSnap.data() as Omit<User, 'id'>) }
      
      // ✅ Возвращаем сразу, без рекурсии
      return {
        profile,
        cars: [],
        posts: [],
        followers: [],
        following: [],
      }
    }
    
    if (!profileSnap.exists) {
      return { profile: null, cars: [], posts: [], followers: [], following: [] }
    }
    
    const profile: User = { id: profileSnap.id, ...(profileSnap.data() as Omit<User, 'id'>) }
    
    // 2. Fetch Cars
    const carsQuery = adminDb.collection('cars').where('userId', '==', profileId)
    const carsSnap = await carsQuery.get()
    const cars: Car[] = carsSnap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Car, 'id'>) }))
    
    // 3. Fetch Posts (latest 20)
    const postsQuery = adminDb.collection('posts')
      .where('authorId', '==', profileId)
      .orderBy('createdAt', 'desc')
      .limit(20)
    const postsSnap = await postsQuery.get()
    const posts: Post[] = postsSnap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Post, 'id'>) }))
    
    // 4. Fetch Followers
    const followersQuery = adminDb.collection('users').doc(profileId).collection('followers')
    const followersSnapshot = await followersQuery.get()
    const followers: string[] = followersSnapshot.docs.map(doc => doc.id)
    
    // 5. Fetch Following
    const followingQuery = adminDb.collection('users').doc(profileId).collection('following')
    const followingSnapshot = await followingQuery.get()
    const following: string[] = followingSnapshot.docs.map(doc => doc.id)
    
    return { profile, cars, posts, followers, following }
  } catch (error) {
    console.error('SERVER Error fetching profile for', profileId, error)
    return { profile: null, cars: [], posts: [], followers: [], following: [] }
  }
}

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const { id } = params
  const initialData = await getProfileData(id)
  
  if (!initialData.profile) {
    notFound()
  }
  
  return (
    <Suspense fallback={<ProfilePageSkeleton />}>
      <ProfileClientPage
        profileId={id}
        initialProfile={initialData.profile}
        initialCars={initialData.cars}
        initialPosts={initialData.posts}
        initialFollowers={initialData.followers}
        initialFollowing={initialData.following}
      />
    </Suspense>
  )
}
