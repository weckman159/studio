// src/app/posts/page.tsx – Лента в стиле Хабр
import Link from 'next/link'
import { getAdminDb } from '@/lib/firebase-admin'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Heart, MessageCircle, Clock, Bookmark } from 'lucide-react'
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore'

export const dynamic = 'force-dynamic'

export default async function PostsPage() {
  const db = getAdminDb()
  
  const postsSnap = await db
    .collection('posts')
    .orderBy('createdAt', 'desc')
    .limit(30)
    .get()

  const posts = postsSnap.docs.map((d: QueryDocumentSnapshot) => ({
    id: d.id,
    ...(d.data() as any),
  }))

  const formatDate = (timestamp: any) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'только что'
    if (diffMins < 60) return `${diffMins} минут назад`
    if (diffHours < 24) return `${diffHours} часов назад`
    if (diffDays === 1) return 'вчера'
    if (diffDays < 7) return `${diffDays} дней назад`
    
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getExcerpt = (html: string) => {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 300)
  }

  const getReadTime = (html: string) => {
    const words = html.replace(/<[^>]*>/g, '').split(/\s+/).length
    const minutes = Math.ceil(words / 200)
    return `${minutes} мин`
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Хедер с кнопкой */}
      <div className="border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <div className="container mx-auto px-4 max-w-4xl py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Публикации</h1>
            <Link href="/posts/create">
              <Button size="sm">
                Написать
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Лента */}
      <div className="container mx-auto px-4 max-w-4xl py-6">
        {posts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            Пока нет публикаций
          </div>
        ) : (
          <div className="space-y-0">
            {posts.map((post: any) => {
              const likesCount = post.likesCount ?? post.likes ?? 0
              const commentsCount = post.commentsCount ?? post.comments ?? 0
              
              return (
                <article
                  key={post.id}
                  className="py-6 border-b border-border last:border-0 hover:bg-accent/30 transition-colors -mx-4 px-4 rounded-lg"
                >
                  {/* Автор + время */}
                  <div className="flex items-center gap-3 mb-3">
                    <Link 
                      href={`/profile/${post.authorId}`}
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={post.authorAvatar} />
                        <AvatarFallback className="text-xs">
                          {post.authorName?.[0]?.toUpperCase() || 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">
                        {post.authorName}
                      </span>
                    </Link>
                    <span className="text-sm text-muted-foreground">•</span>
                    <time className="text-sm text-muted-foreground">
                      {formatDate(post.createdAt)}
                    </time>
                  </div>

                  <Link href={`/posts/${post.id}`} className="block group">
                    {/* Заголовок */}
                    <h2 className="text-xl md:text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                      {post.title}
                    </h2>

                    {/* Мета: сложность, время, категория */}
                    <div className="flex flex-wrap items-center gap-3 mb-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {getReadTime(post.content)}
                      </div>
                      {post.category && (
                        <>
                          <span>•</span>
                          <Badge variant="secondary" className="font-normal">
                            {post.category}
                          </Badge>
                        </>
                      )}
                    </div>

                    {/* Краткое описание */}
                    <p className="text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                      {getExcerpt(post.content)}
                    </p>

                    {/* Читать далее + статистика */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-primary font-medium group-hover:underline">
                        Читать далее
                      </span>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          <span>{likesCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bookmark className="w-4 h-4" />
                          <span>0</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>{commentsCount}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
