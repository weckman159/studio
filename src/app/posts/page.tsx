import Link from 'next/link'
import { getAdminDb } from '@/lib/firebase-admin'
import { Button } from '@/components/ui/button'
import { PostCard } from '@/components/PostCard'
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
            {posts.map((post: any) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
