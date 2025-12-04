// src/app/profile/[id]/page.tsx
import { getAdminDb } from '@/lib/firebase-admin';
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Car, MapPin, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getProfileData(profileId: string) {
  try {
    const adminDb = getAdminDb()
    const profileRef = adminDb.collection('users').doc(profileId)
    const profileSnap = await profileRef.get()
    
    if (!profileSnap.exists()) {
       // Создаем dev-user, если его нет
      if (profileId === 'dev-user-01') {
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
        await profileRef.set(mockUserData);
        const newSnap = await profileRef.get();
        return {
          id: newSnap.id,
          ...newSnap.data()
        }
      }
      return null
    }
    
    return {
      id: profileSnap.id,
      ...profileSnap.data()
    }
  } catch (error) {
    console.error('Profile error:', error)
    return null
  }
}

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const { id } = params
  const profile: any = await getProfileData(id)
  
  if (!profile) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="relative mx-auto w-32 h-32 mb-6">
            <Avatar className="w-32 h-32 border-4 border-primary">
              <AvatarImage src={profile.photoURL} />
              <AvatarFallback>{profile.displayName?.[0]}</AvatarFallback>
            </Avatar>
          </div>
          <h1 className="text-4xl font-bold mb-2">{profile.displayName || profile.name}</h1>
          <p className="text-xl text-muted-foreground mb-4">{profile.email}</p>
          {profile.role && (
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1 text-sm mb-6">
              <User className="h-4 w-4" />
              {profile.role}
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Машины</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Подписчики</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Посты</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>
        </div>

        {/* Bio */}
        {profile.bio && (
          <Card className="mb-12">
            <CardHeader>
              <CardTitle>О себе</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{profile.bio}</p>
            </CardContent>
          </Card>
        )}

        {/* Links */}
        <div className="flex gap-4">
          <Link href="/posts" className="flex-1 text-center py-4 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
            Все посты
          </Link>
          <Link href="/garage" className="flex-1 text-center py-4 px-6 bg-muted text-muted-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors">
            Гараж
          </Link>
        </div>
      </div>
    </div>
  )
}
