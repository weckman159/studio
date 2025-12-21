
'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, onSnapshot, writeBatch, increment, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Heart, MessageCircle, Share2, Edit3, MoreHorizontal, Flag } from 'lucide-react';
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
  const [isReporting, setIsReporting] = useState(false);

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

    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1);

    try {
      const batch = writeBatch(firestore);
      const postRef = doc(firestore, 'posts', post.id);
      const likeRef = doc(firestore, 'posts', post.id, 'likes', user.uid);

      if (newIsLiked) {
        batch.set(likeRef, { userId: user.uid, createdAt: serverTimestamp() });
        batch.update(postRef, { likesCount: increment(1) });
      } else {
        batch.delete(likeRef);
        batch.update(postRef, { likesCount: increment(-1) });
      }

      await batch.commit();
    } catch (error) {
      console.error('Like error:', error);
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
  
  const handleReport = async () => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Необходимо войти в систему', description: 'Вы должны быть авторизованы, чтобы отправить жалобу.' });
      return;
    }
    if (isReporting) return;

    setIsReporting(true);
    try {
      await addDoc(collection(firestore, 'reports'), {
        entityId: post.id,
        entityType: 'post',
        entityTitle: post.title,
        reportedBy: user.uid,
        status: 'open',
        createdAt: serverTimestamp(),
      });
      toast({ title: 'Жалоба отправлена', description: 'Спасибо! Модераторы рассмотрят вашу жалобу в ближайшее время.' });
    } catch (error) {
      console.error('Failed to submit report', error);
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Не удалось отправить жалобу.' });
    } finally {
      setIsReporting(false);
    }
  };

  const isAuthor = user && post.authorId === user.uid;

  return (
    <div className="flex items-center gap-2 ml-auto">
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
             {post.commentsCount || 0}
           </a>
        </Button>

        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={handleShare}>
                    <Share2 className="mr-2 h-4 w-4" />
                    <span>Поделиться</span>
                </DropdownMenuItem>
                {isAuthor && (
                    <DropdownMenuItem asChild>
                        <Link href={`/posts/edit/${post.id}`}>
                            <Edit3 className="mr-2 h-4 w-4" />
                            <span>Редактировать</span>
                        </Link>
                    </DropdownMenuItem>
                )}
                {!isAuthor && (
                    <DropdownMenuItem onSelect={handleReport} disabled={isReporting} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                        <Flag className="mr-2 h-4 w-4" />
                        <span>{isReporting ? 'Отправка...' : 'Пожаловаться'}</span>
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
  );
}
