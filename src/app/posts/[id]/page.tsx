
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'

type PostPageProps = {
  params: Promise<{ id: string }>
}

async function getPostData(postId: string) {
    const db = getAdminDb();
    const postRef = db.collection('posts').doc(postId);
    const commentsQuery = db.collection('comments').where('postId', '==', postId).orderBy('createdAt', 'asc');
    
    const [postSnap, commentsSnap] = await Promise.all([
      postRef.get(),
      commentsQuery.get()
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
    <div className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
            {coverImage && (
                <div className="relative w-full aspect-video mb-8 rounded-2xl overflow-hidden shadow-2xl shadow-black/20">
                    <Image
                        src={coverImage}
                        alt={post.title}
                        fill
                        className="object-cover"
                        priority
                    />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
            )}
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                {post.title}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-text-secondary mb-6 pb-6 border-b border-border">
                <Link href={`/profile/${post.authorId}`} className="flex items-center gap-3 group">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={post.authorAvatar} alt={post.authorName} />
                        <AvatarFallback>{post.authorName?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-medium text-text-primary group-hover:text-primary transition-colors">
                            {post.authorName ?? 'Автор'}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-3 w-3" />
                            <span>
                                {post.createdAt ? new Date(post.createdAt).toLocaleDateString('ru-RU') : ''}
                            </span>
                        </div>
                    </div>
                </Link>
                <PostActions post={post} />
            </div>

            <article
                className="prose prose-lg dark:prose-invert max-w-none text-text-secondary prose-headings:text-text-primary prose-strong:text-text-primary prose-a:text-primary hover:prose-a:underline prose-code:bg-surface prose-code:p-1 prose-code:rounded-md prose-pre:bg-surface prose-pre:border prose-pre:border-border prose-pre:rounded-xl"
                dangerouslySetInnerHTML={{ __html: post.content ?? '' }}
            />
            
            <div className="mt-12">
                <PostComments post={post} initialComments={comments} />
            </div>
        </div>
    </div>
  )
}
