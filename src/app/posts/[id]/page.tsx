
// src/app/posts/[id]/page.tsx
import { notFound } from 'next/navigation'
import { getAdminDb } from '@/lib/firebase-admin'
import type { Metadata } from 'next'
import { stripHtml, serializeFirestoreData } from '@/lib/utils'
import Image from 'next/image'
import type { Post, Comment } from '@/lib/types'
import { PostComments } from './_components/PostComments'
import { PostActions } from './_components/PostActions'
import { Calendar } from 'lucide-react'

type PostPageProps = {
  params: Promise<{ id: string }>
}

async function getPostData(postId: string) {
    const db = getAdminDb();
    const postRef = db.collection('posts').doc(postId);
    const commentsRef = postRef.collection('comments').orderBy('createdAt', 'asc');
    
    const [postSnap, commentsSnap] = await Promise.all([
      postRef.get(),
      commentsRef.get()
    ]);

    if (!postSnap.exists) {
        notFound();
    }

    const post = serializeFirestoreData({ id: postSnap.id, ...postSnap.data() }) as Post;
    const comments = commentsSnap.docs.map(doc => serializeFirestoreData({ id: doc.id, ...doc.data() })) as Comment[];
    
    return { post, comments };
}

export async function generateMetadata(
  { params }: PostPageProps
): Promise<Metadata> {
  const { id } = await params;
  const { post } = await getPostData(id);

  if (!post) {
    return {
      title: 'Пост не найден',
    }
  }

  const description = stripHtml(post.content || '').slice(0, 150) || 'Статья из AutoSphere';
  const coverImage = post.imageUrl;

  return {
    title: `${post.title} | AutoSphere`,
    description: description,
    openGraph: {
      title: post.title,
      description: description,
      images: coverImage ? [{ url: coverImage }] : undefined,
    },
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;
  const { post, comments } = await getPostData(id);

  const coverImage = post.imageUrl;

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8">
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
      
      <h1 className="text-3xl md:text-4xl font-bold mb-4">
        {post.title}
      </h1>

      <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground mb-6 pb-6 border-b">
        <div className="flex items-center gap-2">
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
                <div className="font-medium text-foreground">
                    {post.authorName ?? 'Автор'}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {post.createdAt
                    ? new Date(post.createdAt).toLocaleDateString('ru-RU')
                    : ''}
                  </span>
                </div>
            </div>
        </div>
        <PostActions post={post} />
      </div>

      <article
        className="prose dark:prose-invert max-w-none prose-img:rounded-xl prose-img:shadow-lg prose-a:text-primary hover:prose-a:underline prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-pre:bg-black/40 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl"
        dangerouslySetInnerHTML={{ __html: post.content ?? '' }}
      />
      
      <div className="mt-12">
        <PostComments post={post} initialComments={comments} />
      </div>
    </div>
  )
}
