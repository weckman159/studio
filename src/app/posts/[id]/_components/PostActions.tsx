
'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, deleteDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
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

  // Проверяем, лайкнул ли текущий юзер этот пост
  useEffect(() => {
    if (!user || !firestore) return;
    
    // Слушаем конкретный документ лайка текущего пользователя
    const likeDocRef = doc(firestore, 'posts', post.id, 'likes', user.uid);
    const unsubscribe = onSnapshot(likeDocRef, (snap) => {
        setIsLiked(snap.exists());
    });
    
    return () => unsubscribe();
  }, [user, firestore, post.id]);

  // Следим за изменением счетчика из базы (если Cloud Function обновит его)
  useEffect(() => {
      setLikesCount(post.likesCount || 0);
  }, [post.likesCount]);

  const handleLike = async () => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Войдите, чтобы оценить' });
      return;
    }

    // Оптимистичное обновление UI (чтобы было мгновенно)
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    setIsLiked(!isLiked);

    const likeDocRef = doc(firestore, 'posts', post.id, 'likes', user.uid);

    try {
      if (isLiked) {
        // Удаляем лайк (Cloud Function уменьшит счетчик)
        await deleteDoc(likeDocRef);
      } else {
        // Создаем лайк (Cloud Function увеличит счетчик и отправит уведомление)
        await setDoc(likeDocRef, {
            userId: user.uid,
            createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Ошибка лайка:', error);
      // Откат изменений при ошибке
      setIsLiked(isLiked); 
      setLikesCount(prev => isLiked ? prev + 1 : prev - 1);
    }
  };

  const handleShare = async () => {
     const url = window.location.href;
     try {
        if (navigator.share) {
            await navigator.share({ title: post.title, url });
        } else {
            await navigator.clipboard.writeText(url);
            toast({ title: 'Ссылка скопирована' });
        }
     } catch(e) {
        toast({ title: 'Ошибка', description: 'Не удалось поделиться', variant: 'destructive' });
     }
  };

  const isAuthor = user && post.authorId === user.uid;

  return (
    <div className="flex items-center gap-4 ml-auto">
        {isAuthor && (
            <Link href={`/posts/edit/${post.id}`}>
                <Button variant="outline" size="icon">
                <Edit3 className="h-4 w-4" />
                </Button>
            </Link>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className={isLiked ? 'text-red-500 hover:text-red-600' : ''}
        >
          <Heart className={`mr-2 h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
          {likesCount}
        </Button>
        
        <Button variant="ghost" size="sm" asChild>
           <a href="#comments">
             <MessageCircle className="mr-2 h-5 w-5" />
             {post.commentsCount}
           </a>
        </Button>

        <Button variant="ghost" size="icon" onClick={handleShare}>
          <Share2 className="h-5 w-5" />
        </Button>
      </div>
  );
}
