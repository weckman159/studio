// src/app/profile/[id]/page.tsx - С РЕАЛЬНЫМИ ДАННЫМИ
import { getAdminDb } from '@/lib/firebase-admin'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Mail, Calendar, Car as CarIcon, Users, MapPin } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getProfile(profileId: string) {
  try {
    console.log('🔍 Fetching profile:', profileId)
    const adminDb = getAdminDb()
    
    // Получаем профиль пользователя
    const profileRef = adminDb.collection('users').doc(profileId)
    const profileSnap = await profileRef.get()
    
    if (!profileSnap.exists) {
      console.log('❌ Profile not found:', profileId)
      return null
    }
    
    const profile = {
      id: profileSnap.id,
      ...profileSnap.data()
    }
    
    // Считаем машины пользователя
    const carsQuery = adminDb.collection('cars').where('userId', '==', profileId)
    const carsSnap = await carsQuery.get()
    const carsCount = carsSnap.size
    
    // Последние посты (до 5)
    const postsQuery = adminDb.collection('posts')
      .where('authorId', '==', profileId)
      .orderBy('createdAt', 'desc')
      .limit(5)
    const postsSnap = await postsQuery.get()
    
    console.log('✅ Profile loaded:', profileId, profile.displayName)
    return {
      ...profile,
      carsCount,
      recentPosts: postsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    }
    
  } catch (error) {
    console.error('❌ Profile fetch error:', error)
    return null
  }
}

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const { id } = params
  const profile = await getProfile(id)
  
  if (!profile) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="relative mx-auto w-32 h-32 mb-8 border-4 border-primary rounded-full overflow-hidden">
            <Avatar className="w-full h-full">
              <AvatarImage src={profile.photoURL} />
              <AvatarFallback>{profile.displayName?.[0] || 'U'}</AvatarFallback>
            </Avatar>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {profile.displayName || profile.name || 'Пользователь'}
          </h1>
          <p className="text-xl text-muted-foreground mb-4">{profile.email}</p>
          
          {/* Stats */}
          <div className="flex items-center justify-center gap-8 text-sm mb-8">
            <div className="flex items-center gap-2">
              <CarIcon className="h-5 w-5 text-primary" />
              <span className="font-semibold">{profile.carsCount || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="font-semibold">0</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <span>Недавно</span>
            </div>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <Card className="mb-12 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                О себе
              </CardTitle>
            </CardHeader>
            <CardContent className="whitespace-pre-wrap">
              {profile.bio}
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Link href={`/posts`} className="group block p-8 bg-card border rounded-xl hover:shadow-lg transition-all h-full">
            <div className="text-3xl font-bold text-primary mb-2 group-hover:scale-105 transition-transform">
              Посты ({profile.recentPosts?.length || 0})
            </div>
            <p className="text-muted-foreground">Все публикации пользователя</p>
          </Link>
          <Link href={`/garage`} className="group block p-8 bg-card border rounded-xl hover:shadow-lg transition-all h-full">
            <div className="text-3xl font-bold text-primary mb-2 group-hover:scale-105 transition-transform">
              Гараж ({profile.carsCount || 0})
            </div>
            <p className="text-muted-foreground">Автомобили в гараже</p>
          </Link>
          <Link href="/messages" className="group block p-8 bg-card border rounded-xl hover:shadow-lg transition-all h-full">
            <div className="text-3xl font-bold text-primary mb-2 group-hover:scale-105 transition-transform">Сообщения</div>
            <p className="text-muted-foreground">Написать сообщение</p>
          </Link>
        </div>

        {/* Debug Info */}
        <div className="text-center text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
          ✅ ID: <code className="font-mono">{id}</code> | 
          Машины: <code>{profile.carsCount}</code> | 
          Посты: <code>{profile.recentPosts?.length || 0}</code>
        </div>
      </div>
    </div>
  )
}
