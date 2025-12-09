
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, writeBatch, increment } from 'firebase/firestore';
import type { Post, Comment } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Send, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { GithubEditor } from '@/components/GithubEditor';

interface PostCommentsProps {
  post: Post;
  initialComments: Comment[];
}

const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }).format(date);
};

export function PostComments({ post, initialComments }: PostCommentsProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!firestore) return;

    setLoading(true);
    const q = query(
      collection(firestore, 'comments'),
      where('postId', '==', post.id),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
      setComments(fetchedComments);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching comments in real-time:", error);
        setComments(initialComments); // fallback to initial server-rendered comments
        setLoading(false);
    });

    return () => unsubscribe();
  }, [firestore, post.id, initialComments]);

  const handleAddComment = async () => {
    if (!user || !commentText.trim() || !firestore) return;
    setSubmitting(true);
    try {
      const batch = writeBatch(firestore);
      
      // 1. Создаем комментарий
      const commentRef = doc(collection(firestore, 'comments'));
      batch.set(commentRef, {
        postId: post.id,
        authorId: user.uid,
        authorName: user.displayName || 'Пользователь',
        authorAvatar: user.photoURL,
        content: commentText.trim(),
        createdAt: serverTimestamp()
      });

      // 2. Обновляем счетчик поста
      const postRef = doc(firestore, 'posts', post.id);
      batch.update(postRef, {
        commentsCount: increment(1)
      });

      await batch.commit();
      setCommentText('');
    } catch (error) {
      console.error('Ошибка:', error);
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading && initialComments.length === 0) {
      return <Skeleton className="h-40 w-full" />
  }

  return (
    <Card id="comments">
      <CardHeader>
        <CardTitle>
          Комментарии ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {user ? (
          <div className="flex flex-col gap-3">
             <GithubEditor
                value={commentText}
                onChange={setCommentText}
                placeholder="Оставьте комментарий..."
              />
              <Button
                onClick={handleAddComment}
                disabled={!commentText.trim() || submitting}
                size="sm"
                className="self-end"
              >
                <Send className="mr-2 h-4 w-4" />
                Отправить
              </Button>
          </div>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Для комментирования необходимо войти в систему.
              <Link href="/auth" className="ml-2 underline">
                Войти
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {comments.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Комментариев пока нет. Будьте первым!
          </p>
        ) : (
          <div className="space-y-6">
            {comments.map(comment => (
              <div key={comment.id} className="flex gap-3">
                <Link href={`/profile/${comment.authorId}`}>
                  <Avatar>
                    <AvatarImage src={comment.authorAvatar} />
                    <AvatarFallback>{comment.authorName?.[0]}</AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Link href={`/profile/${comment.authorId}`}>
                      <span className="font-semibold hover:underline">
                        {comment.authorName}
                      </span>
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-line break-words">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
