import { getAdminDb } from '@/lib/firebase-admin'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PostCard } from '@/components/PostCard'
import { Mail, Calendar, FileText } from 'lucide-react'
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore'

export const dynamic = 'force-dynamic'

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getAdminDb()

  const userSnap = await db.collection('users').doc(id).get()
  if (!userSnap.exists) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Профиль не найден</h1>
          <p className="text-muted-foreground">Пользователь с таким ID не существует</p>
        </div>
      </div>
    )
  }

  const user = userSnap.data() as any

  const postsSnap = await db
    .collection('posts')
    .where('authorId', '==', id)
    .orderBy('createdAt', 'desc')
    .limit(20)
    .get()

  const posts = postsSnap.docs.map((d: QueryDocumentSnapshot) => ({
    id: d.id,
    ...(d.data() as any),
  }))

  const formatDate = (timestamp: any) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/95">
      {/* Шапка профиля */}
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 max-w-5xl py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Аватар */}
            <Avatar className="w-24 h-24 ring-4 ring-border/50">
              <AvatarImage src={user.photoURL} />
              <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-primary/20 to-primary/5">
                {user.displayName?.[0]?.toUpperCase() || 'A'}
              </AvatarFallback>
            </Avatar>

            {/* Инфо */}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                {user.displayName || 'Без имени'}
              </h1>
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {user.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                )}
                {user.createdAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Регистрация: {formatDate(user.createdAt)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>{posts.length} {posts.length === 1 ? 'пост' : 'постов'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Посты */}
      <div className="container mx-auto px-4 max-w-5xl py-12">
        <h2 className="text-2xl font-bold mb-8">Публикации</h2>

        {posts.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Постов пока нет</h3>
            <p className="text-muted-foreground">
              Этот пользователь ещё не опубликовал ни одного поста
            </p>
          </div>
        ) : (
          <div>
            {posts.map((post: any) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
