
'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, onSnapshot, writeBatch, increment, serverTimestamp, collection } from 'firebase/firestore';
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

  // Следим за состоянием лайка текущего юзера
  useEffect(() => {
    if (!user || !firestore) return;
    const likeDocRef = doc(firestore, 'posts', post.id, 'likes', user.uid);
    const unsub = onSnapshot(likeDocRef, (snap) => setIsLiked(snap.exists()));
    return () => unsub();
  }, [user, firestore, post.id]);

  // Следим за реальным счетчиком поста (чтобы видеть лайки других)
  useEffect(() => {
      if (!firestore) return;
      const postRef = doc(firestore, 'posts', post.id);
      const unsub = onSnapshot(postRef, (snap) => {
          if (snap.exists()) setLikesCount(snap.data().likesCount || 0);
      });
      return () => unsub();
  }, [firestore, post.id]);

  const handleLike = async () => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Войдите, чтобы оценить' });
      return;
    }

    // Оптимистичное обновление (для мгновенной реакции интерфейса)
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1);

    try {
      const batch = writeBatch(firestore);
      const postRef = doc(firestore, 'posts', post.id);
      const likeRef = doc(firestore, 'posts', post.id, 'likes', user.uid);

      if (newIsLiked) {
        // Создаем лайк
        batch.set(likeRef, { userId: user.uid, createdAt: serverTimestamp() });
        // Увеличиваем счетчик
        batch.update(postRef, { likesCount: increment(1) });
        
        // Опционально: Создаем уведомление (тоже с клиента)
        if (post.authorId !== user.uid) {
            const notifRef = doc(collection(firestore, 'notifications'));
            batch.set(notifRef, {
                recipientId: post.authorId,
                senderId: user.uid,
                type: 'like',
                title: 'Новый лайк',
                message: 'понравился ваш пост',
                actionURL: `/posts/${post.id}`,
                read: false,
                createdAt: serverTimestamp()
            });
        }
      } else {
        // Удаляем лайк
        batch.delete(likeRef);
        // Уменьшаем счетчик
        batch.update(postRef, { likesCount: increment(-1) });
      }

      await batch.commit();
    } catch (error) {
      console.error('Like error:', error);
      // Откат при ошибке
      setIsLiked(!newIsLiked);
      setLikesCount(prev => !newIsLiked ? prev + 1 : prev - 1);
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
