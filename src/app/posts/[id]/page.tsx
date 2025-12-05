// src/app/posts/[id]/page.tsx
import { getAdminDb } from '@/lib/firebase-admin';
import { PostActions } from './_components/PostActions';
import { PostComments } from './_components/PostComments';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, FileText } from 'lucide-react';
import type { Post, Comment } from '@/lib/types';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

async function getPostData(postId: string): Promise<{ post: Post | null, comments: Comment[] }> {
    try {
        const adminDb = getAdminDb();
        if (!adminDb) {
            console.error("Firebase Admin not initialized");
            return { post: null, comments: [] };
        }
        const postDocRef = adminDb.collection('posts').doc(postId);
        const postDocSnap = await postDocRef.get();

        if (!postDocSnap.exists) {
            return { post: null, comments: [] };
        }

        const post = { id: postDocSnap.id, ...postDocSnap.data() } as Post;

        const commentsQuery = adminDb.collection('comments')
            .where('postId', '==', postId)
            .orderBy('createdAt', 'asc');
        
        const commentsSnapshot = await commentsQuery.get();
        const comments = commentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));

        return { post, comments };
    } catch (error) {
        console.error("Error fetching post data on server:", error);
        return { post: null, comments: [] };
    }
}

const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    // Firestore Timestamps on the server are different from the client
    const date = timestamp._seconds ? new Date(timestamp._seconds * 1000) : new Date(timestamp);
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { post } = await getPostData(id);

  if (!post) return { title: 'Пост не найден' };

  const cleanDescription = post.content?.replace(/<[^>]*>?/gm, '').slice(0, 150) || 'Смотрите подробнее на AutoSphere';

  return {
    title: `${post.title} | ${post.authorName}`,
    description: cleanDescription,
    openGraph: {
      title: post.title,
      description: cleanDescription,
      images: post.imageUrl ? [post.imageUrl] : [],
      type: 'article',
      siteName: 'AutoSphere',
    },
  };
}


export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: postId } = await params;
    const { post, comments } = await getPostData(postId);

    if (!post) {
        notFound();
    }
    
    return (
        <div className="min-h-screen">
          {post.imageUrl ? (
            <div className="w-full h-[400px] overflow-hidden bg-muted relative">
              <Image
                src={post.imageUrl}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          ) : (
             <div className="w-full h-[400px] bg-muted flex items-center justify-center">
                <FileText className="w-24 h-24 text-muted-foreground/50"/>
             </div>
          )}
    
          <div className="max-w-4xl mx-auto px-4 py-8">
            <article>
              {post.category && (
                <div className="mb-4">
                  <Badge>{post.category}</Badge>
                </div>
              )}
    
              <div className="flex items-start justify-between gap-4 mb-6">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                  {post.title}
                </h1>
              </div>
    
              <div className="flex flex-wrap items-center gap-6 mb-8 pb-6 border-b">
                <Link href={`/profile/${post.authorId}`}>
                  <div className="flex items-center gap-3 hover:opacity-80 cursor-pointer">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={post.authorAvatar} />
                      <AvatarFallback>{post.authorName ? post.authorName[0] : 'A'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{post.authorName}</p>
                      <p className="text-xs text-muted-foreground">Автор</p>
                    </div>
                  </div>
                </Link>
    
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(post.createdAt)}</span>
                </div>
    
                <PostActions post={post} />
              </div>
    
              <div 
                className="prose prose-lg dark:prose-invert max-w-none mb-8"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
    
              <PostComments post={post} initialComments={comments} />
            </article>
          </div>
        </div>
      );
}
