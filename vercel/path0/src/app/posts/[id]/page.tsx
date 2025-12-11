import { notFound } from 'next/navigation'
import { getAdminDb } from '@/lib/firebase-admin'
import type { Metadata } from 'next'

type PostPageProps = {
  params: { id: string }
}

export async function generateMetadata(
  { params }: PostPageProps
): Promise<Metadata> {
  const db = getAdminDb()
  const snap = await db.collection('posts').doc(params.id).get()

  if (!snap.exists) {
    return {
      title: 'Пост не найден',
    }
  }

  const data = snap.data() as any;
  const description = (data.content as string)?.replace(/<[^>]*>?/gm, '').slice(0, 150) ?? data.excerpt ?? '';

  return {
    title: data.title ?? 'Пост',
    description: description,
    openGraph: {
      title: data.title ?? 'Пост',
      description: description,
      images: data.coverImage ? [{ url: data.coverImage }] : (data.imageUrl ? [{ url: data.imageUrl }] : undefined),
    },
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const db = getAdminDb()
  const doc = await db.collection('posts').doc(params.id).get()

  if (!doc.exists) {
    notFound()
  }

  const post = doc.data() as any
  const coverImage = post.coverImage || post.imageUrl;

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8">
      {/* Заголовок */}
      <h1 className="text-3xl md:text-4xl font-bold mb-4">
        {post.title}
      </h1>

      {/* Автор + дата */}
      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6">
        {post.authorAvatar && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.authorAvatar}
            alt={post.authorName ?? 'Автор'}
            className="w-9 h-9 rounded-full object-cover"
          />
        )}
        <div>
          <div className="font-medium">
            {post.authorName ?? 'Автор'}
          </div>
          <div>
            {post.createdAt?.toDate
              ? post.createdAt.toDate().toLocaleString('ru-RU')
              : ''}
          </div>
        </div>
      </div>

      {/* Обложка */}
      {coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverImage}
          alt={post.title}
          className="w-full max-h-[420px] object-cover rounded-2xl mb-8 shadow-xl"
        />
      )}

      {/* Контент (HTML из Tiptap) */}
      <article
        className="prose prose-invert max-w-none prose-img:rounded-xl prose-img:shadow-lg prose-a:text-sky-400 prose-a:no-underline hover:prose-a:underline prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-pre:bg-black/40 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl"
        dangerouslySetInnerHTML={{ __html: post.content ?? '' }}
      />
    </div>
  )
}