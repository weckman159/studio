'use client';

import { useUser, useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { doc, DocumentReference }from 'firebase/firestore';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import type { Post } from '@/lib/types';
import { PostForm } from '@/components/PostForm';


function EditPostClient({ postId }: { postId: string }) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const postQuery = useMemoFirebase(
    () => (firestore && postId ? doc(firestore, 'posts', postId) : null),
    [firestore, postId]
  ) as DocumentReference<Post> | null;

  const { data: post, isLoading: isPostLoading } = useDoc<Post>(postQuery);
  
  const loading = isUserLoading || isPostLoading;

  if (loading) {
    return <div className="flex justify-center items-center h-96"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Для редактирования необходимо войти в систему.
            <Link href="/auth" className="ml-2 underline">
              Войти
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!post) {
     return <div className="text-center p-8">Пост не найден.</div>;
  }

  if (post.authorId !== user.uid) {
    return <div className="text-center p-8 text-destructive">У вас нет прав для редактирования этого поста.</div>;
  }
  
  return <PostForm postToEdit={post} />;
}


export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
    const [postId, setPostId] = React.useState<string>('');

    React.useEffect(() => {
        params.then(({ id }) => setPostId(id));
    }, [params]);

    return <EditPostClient postId={postId} />
}
