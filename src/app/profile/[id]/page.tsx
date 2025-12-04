// src/app/profile/[id]/page.tsx - РАБОЧАЯ ВЕРСИЯ
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Mail, Calendar } from 'lucide-react'

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
    bio: 'Профиль загружается корректно! 🚀'
  }
}

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const { id } = params
  const profile = await getProfile(id)
  
  console.log('✅ Profile loaded:', id) // Лог в Vercel

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="relative mx-auto w-32 h-32 mb-8 border-4 border-primary rounded-full overflow-hidden">
            <Avatar className="w-full h-full">
              <AvatarImage src={profile.photoURL} />
              <AvatarFallback>{profile.displayName?.[0]}</AvatarFallback>
            </Avatar>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {profile.displayName}
          </h1>
          <p className="text-xl text-muted-foreground mb-2">{profile.email}</p>
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground mb-8">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Пользователь</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Присоединился недавно</span>
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
            <CardContent>
              <p className="whitespace-pre-wrap">{profile.bio}</p>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Link href="/posts" className="group block p-8 bg-card border rounded-xl hover:shadow-lg transition-all h-full">
            <div className="text-3xl font-bold text-primary mb-2 group-hover:scale-105 transition-transform">Посты</div>
            <p className="text-muted-foreground">Все публикации пользователя</p>
          </Link>
          <Link href="/garage" className="group block p-8 bg-card border rounded-xl hover:shadow-lg transition-all h-full">
            <div className="text-3xl font-bold text-primary mb-2 group-hover:scale-105 transition-transform">Гараж</div>
            <p className="text-muted-foreground">Автомобили в гараже</p>
          </Link>
          <Link href="/messages" className="group block p-8 bg-card border rounded-xl hover:shadow-lg transition-all h-full">
            <div className="text-3xl font-bold text-primary mb-2 group-hover:scale-105 transition-transform">Сообщения</div>
            <p className="text-muted-foreground">Написать сообщение</p>
          </Link>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          ✅ Роутинг работает! ID: <code className="bg-muted px-2 py-1 rounded font-mono">{id}</code>
        </div>
      </div>
    </div>
  )
}
