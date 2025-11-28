
'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2, Edit3 } from 'lucide-react';
import type { Post } from '@/lib/types';
import Link from 'next/link';

interface PostActionsProps {
  post: Post;
}

export function PostActions({ post }: PostActionsProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);

  useEffect(() => {
    if (user && post.likedBy) {
      setIsLiked(post.likedBy.includes(user.uid));
    }
  }, [user, post.likedBy]);

  const handleLike = async () => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Необходимо войти в систему' });
      return;
    }

    const postRef = doc(firestore, 'posts', post.id);
    // Optimistic update
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);

    try {
      if (isLiked) {
        await updateDoc(postRef, {
          likedBy: arrayRemove(user.uid),
          likesCount: increment(-1)
        });
      } else {
        await updateDoc(postRef, {
          likedBy: arrayUnion(user.uid),
          likesCount: increment(1)
        });
      }
    } catch (error) {
      console.error('Ошибка лайка:', error);
      // Revert optimistic update on error
      setIsLiked(isLiked);
      setLikesCount(prev => isLiked ? prev + 1 : prev - 1);
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Не удалось обработать лайк' });
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => toast({ title: 'Ссылка на пост скопирована!' }))
      .catch(() => toast({ variant: 'destructive', title: 'Не удалось скопировать ссылку' }));
  };

  const isAuthor = user && post.authorId === user.uid;

  return (
    <>
      <div className="flex items-center gap-4 ml-auto">
        {isAuthor && (
            <Link href={`/posts/edit/${post.id}`}>
                <Button variant="outline" size="icon">
                <Edit3 className="h-4 w-4" />
                </Button>
            </Link>
        )}
        <Button
          variant={isLiked ? 'default' : 'outline'}
          size="sm"
          onClick={handleLike}
          disabled={!user}
        >
          <Heart className={`mr-2 h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          {likesCount}
        </Button>
        <Button variant="outline" size="sm" asChild>
            <a href="#comments">
                <MessageCircle className="mr-2 h-4 w-4" />
                {post.commentsCount}
            </a>
        </Button>
        <Button variant="outline" size="sm" onClick={handleShare}>
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}
