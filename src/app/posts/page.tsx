// src/app/posts/page.tsx – Лента постов в стиле Medium
import Link from 'next/link'
import { getAdminDb } from '@/lib/firebase-admin'
import { Badge } from '@/components/ui/badge'
import { Heart, MessageCircle } from 'lucide-react'

type Post = {
  id: string
  title: string
  excerpt?: string
  coverImage?: string
  category?: string
  likes?: number
  commentsCount?: number
  authorName?: string
  createdAt?: FirebaseFirestore.Timestamp
}

export default async function PostsPage() {
  const db = getAdminDb()

  // Берём реальные посты, последние сверху
  const snap = await db
    .collection('posts')
    .orderBy('createdAt', 'desc')
    .limit(30)
    .get()

  const posts: Post[] = snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as any),
  }))

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Заголовок + кнопка */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Публикации
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Истории, обзоры и мысли автолюбителей AutoSphere
            </p>
          </div>
          <Link
            href="/posts/create"
            className="inline-flex items-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90 transition"
          >
            Новый пост
          </Link>
        </div>

        {/* Пустое состояние */}
        {posts.length === 0 && (
          <div className="border border-dashed border-white/10 rounded-2xl p-10 text-center text-muted-foreground bg-white/5">
            Пока нет ни одного поста.
            <br />
            <Link
              href="/posts/create"
              className="text-primary hover:underline font-medium"
            >
              Станьте первым, кто что‑то опубликует.
            </Link>
          </div>
        )}

        {/* Лента в один столбец */}
        <div className="space-y-8">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              className="block rounded-2xl border border-white/5 bg-white/5 hover:bg-white/[0.07] transition-shadow hover:shadow-2xl hover:shadow-black/40 overflow-hidden backdrop-blur group"
            >
              {/* Обложка */}
              {post.coverImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full aspect-[16/9] object-cover group-hover:scale-[1.02] transition-transform duration-500"
                />
              )}

              <div className="px-5 md:px-6 py-5">
                {/* Категория / мета */}
                <div className="mb-3 flex items-center gap-3 text-xs text-muted-foreground">
                  {post.category && (
                    <Badge
                      variant="outline"
                      className="border-white/20 bg-black/30 text-[0.68rem] uppercase tracking-wide"
                    >
                      {post.category}
                    </Badge>
                  )}
                  <span>
                    {post.authorName ?? 'Автор'}
                  </span>
                  <span>•</span>
                  <span>
                    {post.createdAt?.toDate
                      ? post.createdAt
                          .toDate()
                          .toLocaleDateString('ru-RU', {
                            day: '2-digit',
                            month: 'short',
                          })
                      : ''}
                  </span>
                </div>

                {/* Заголовок */}
                <h2 className="text-xl md:text-2xl font-semibold leading-snug group-hover:text-primary transition-colors mb-2">
                  {post.title}
                </h2>

                {/* Краткое описание */}
                {post.excerpt && (
                  <p className="text-sm md:text-[0.95rem] text-muted-foreground line-clamp-3 mb-4">
                    {post.excerpt}
                  </p>
                )}

                {/* Низ карточки: реакции */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center gap-1.5">
                      <Heart className="h-4 w-4 group-hover:text-red-400 group-hover:fill-red-500 transition-colors" />
                      <span>{post.likes ?? 0}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MessageCircle className="h-4 w-4" />
                      <span>{post.commentsCount ?? 0}</span>
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
