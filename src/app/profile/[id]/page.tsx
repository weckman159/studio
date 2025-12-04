
// src/app/profile/[id]/page.tsx - 100% РАБОТАЕТ БЕЗ firebase-admin
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Car, Users, MessageCircle } from 'lucide-react'

export default function ProfilePage({ params }: { params: { id: string } }) {
  const { id } = params
  
  // ✅ Mock данные - НИ ОДНОЙ ОШИБКИ
  const profile = {
    id,
    displayName: "Вася Петров",
    email: "vasya@autosphere.ru",
    photoURL: "https://avatar.vercel.sh/vasya.png",
    bio: "Любитель BMW и тюнинга 🚗",
    carsCount: 2,
    postsCount: 15,
    followersCount: 247
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-32 h-32 mx-auto mb-6 border-4 border-primary rounded-full overflow-hidden">
            <Avatar className="w-full h-full">
              <AvatarImage src={profile.photoURL} />
              <AvatarFallback>{profile.displayName[0]}</AvatarFallback>
            </Avatar>
          </div>
          <h1 className="text-5xl font-bold mb-4">{profile.displayName}</h1>
          <p className="text-xl text-muted-foreground mb-6">{profile.email}</p>
          
          {/* Stats */}
          <div className="flex justify-center gap-8 mb-8 text-sm">
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-primary">{profile.carsCount}</div>
              <div className="text-muted-foreground">Машины</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-primary">{profile.postsCount}</div>
              <div className="text-muted-foreground">Посты</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-primary">{profile.followersCount}</div>
              <div className="text-muted-foreground">Подписчики</div>
            </div>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <Card className="mb-12 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>О себе</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{profile.bio}</p>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Link href="/posts" className="group p-8 bg-card border rounded-xl hover:shadow-xl transition-all h-32 flex flex-col items-center justify-center text-center">
            <MessageCircle className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
            <div className="text-2xl font-bold text-primary mb-1 group-hover:scale-105">Посты</div>
            <p className="text-muted-foreground text-sm">({profile.postsCount})</p>
          </Link>
          
          <Link href="/garage" className="group p-8 bg-card border rounded-xl hover:shadow-xl transition-all h-32 flex flex-col items-center justify-center text-center">
            <Car className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
            <div className="text-2xl font-bold text-primary mb-1 group-hover:scale-105">Гараж</div>
            <p className="text-muted-foreground text-sm">({profile.carsCount})</p>
          </Link>
          
          <div className="p-8 bg-card border rounded-xl hover:shadow-xl transition-all h-32 flex flex-col items-center justify-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <div className="text-2xl font-bold text-primary mb-1">Подписаться</div>
            <p className="text-muted-foreground text-sm">247</p>
          </div>
        </div>

        {/* Debug */}
        <div className="text-center p-6 bg-muted/30 rounded-xl">
          <div className="text-sm text-muted-foreground mb-2">✅ Роутинг работает!</div>
          <code className="bg-muted px-3 py-1 rounded font-mono text-sm">{id}</code>
        </div>
      </div>
    </div>
  )
}
