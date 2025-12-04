// src/app/profile/[id]/page.tsx - ВРЕМЕННО БЕЗ БАЗЫ
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Mail, Calendar, Car, Users, MapPin } from 'lucide-react'

export const dynamic = 'force-dynamic'

// ✅ Mock данные для быстрого теста (замените на реальные)
async function getProfile(profileId: string) {
  // Пока без Firebase - просто тест роутинга
  return {
    id: profileId,
    displayName: 'Тестовый Пользователь',
    email: 'test@example.com', 
    photoURL: 'https://avatar.vercel.sh/128',
    createdAt: new Date().toISOString(),
    bio: 'Профиль загружается корректно! 🚀',
    carsCount: 3,
    postsCount: 12
  }
}

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const { id } = params
  const profile = await getProfile(id)
  
  if (!profile) {
    notFound();
  }

  console.log('✅ Profile loaded:', id) // Лог в Vercel

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-12 text-center">✅ ПРОФИЛЬ РАБОТАЕТ</h1>
        <div className="text-center">
          <div className="w-32 h-32 bg-primary rounded-full mx-auto mb-6">
            <Avatar className="w-full h-full">
              <AvatarImage src={profile.photoURL} />
              <AvatarFallback>{profile.displayName?.[0]}</AvatarFallback>
            </Avatar>
          </div>
          <h2 className="text-2xl mb-2">{profile.displayName}</h2>
          <p>{profile.email}</p>
          <p>ID: <code className="bg-muted px-2 py-1 rounded">{id}</code></p>
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Машины</CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">{profile.carsCount}</div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Посты</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">{profile.postsCount}</div>
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
          </div>
        </div>
      </div>
    </div>
  )
}
