
import Link from 'next/link'
import { getAdminDb } from '@/lib/firebase-admin'
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore'
import Image from 'next/image'

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const { id } = params
  const db = getAdminDb()

  const userSnap = await db.collection('users').doc(id).get()
  if (!userSnap.exists) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Профиль не найден
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

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Профиль</h1>

      <div className="flex items-center gap-6 mb-10">
        {user.photoURL && (
            <div className="relative w-20 h-20">
                <Image
                    src={user.photoURL}
                    alt={user.displayName ?? 'Пользователь'}
                    fill
                    className="rounded-full object-cover"
                />
            </div>
        )}
        <div>
          <div className="text-2xl font-semibold">
            {user.displayName ?? 'Без имени'}
          </div>
          <div className="text-sm text-muted-foreground">
            {user.email}
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Посты</h2>

      {posts.length === 0 ? (
        <div className="text-muted-foreground">
          У этого пользователя пока нет постов.
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              className="block bg-card border border-border rounded-xl px-4 py-3 hover:bg-muted transition"
            >
              <div className="flex justify-between gap-4">
                <div>
                  <div className="font-medium mb-1">
                    {post.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {post.createdAt?.toDate
                      ? post.createdAt.toDate().toLocaleString('ru-RU')
                      : ''}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
