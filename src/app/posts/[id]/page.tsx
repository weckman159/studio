// src/app/posts/[id]/page.tsx
import { notFound } from 'next/navigation'
import { getAdminDb } from '@/lib/firebase-admin'
import type { Metadata } from 'next'
import { stripHtml } from '@/lib/utils'
import Image from 'next/image'

// Correct type for Next.js 15
type PostPageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata(
  { params }: PostPageProps
): Promise<Metadata> {
  const { id } = await params; // Await the promise
  const db = getAdminDb()
  const snap = await db.collection('posts').doc(id).get()

  if (!snap.exists) {
    return {
      title: 'Пост не найден',
    }
  }

  const data = snap.data() as any;
  const description = data.excerpt || stripHtml(data.content || '').slice(0, 150) || 'Статья из AutoSphere';
  const coverImage = data.coverImage || data.imageUrl;

  return {
    title: data.title ?? 'Пост',
    description: description,
    openGraph: {
      title: data.title ?? 'Пост',
      description: description,
      images: coverImage ? [{ url: coverImage }] : undefined,
    },
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params; // Await the promise
  const db = getAdminDb()
  const doc = await db.collection('posts').doc(id).get()

  if (!doc.exists) {
    notFound()
  }

  const post = doc.data() as any
  const coverImage = post.coverImage || post.imageUrl;

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">
        {post.title}
      </h1>

      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6">
        {post.authorAvatar && (
          <Image
            src={post.authorAvatar}
            alt={post.authorName ?? 'Автор'}
            width={36}
            height={36}
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

      {coverImage && (
        <div className="relative w-full max-h-[420px] aspect-video mb-8">
            <Image
                src={coverImage}
                alt={post.title}
                fill
                className="object-cover rounded-2xl shadow-xl"
                priority
            />
        </div>
      )}

      <article
        className="prose dark:prose-invert max-w-none prose-img:rounded-xl prose-img:shadow-lg prose-a:text-primary hover:prose-a:underline prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-pre:bg-black/40 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl"
        dangerouslySetInnerHTML={{ __html: post.content ?? '' }}
      />
    </div>
  )
}
