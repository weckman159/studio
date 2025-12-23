// src/app/posts/[id]/_components/PostActions.tsx
'use client';

import { useOptimistic, useTransition } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { toggleLike } from '@/app/lib/actions/like-actions';

// UI
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Heart, MessageCircle, Share2, Edit3, MoreHorizontal, Flag, Loader2 } from 'lucide-react';
import type { Post } from '@/lib/types';


interface PostActionsProps {
  post: Post;
  isLiked: boolean; // Начальное состояние лайка от сервера
}

type OptimisticLikeState = {
  isLiked: boolean;
  likesCount: number;
};

export function PostActions({ post, isLiked: initialIsLiked }: PostActionsProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // --- Optimistic UI с помощью useOptimistic ---
  const [optimisticState, setOptimisticLike] = useOptimistic<OptimisticLikeState>(
    { isLiked: initialIsLiked, likesCount: post.likesCount || 0 },
    (state, newLikeState: boolean) => ({
      isLiked: newLikeState,
      likesCount: newLikeState ? state.likesCount + 1 : state.likesCount - 1,
    })
  );

  const handleLikeAction = async () => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Войдите, чтобы оценить' });
      return;
    }
    
    startTransition(async () => {
      // Мгновенно обновляем UI
      setOptimisticLike(!optimisticState.isLiked);
      
      try {
        // Выполняем Server Action
        await toggleLike(post.id, optimisticState.isLiked);
      } catch (error) {
        // Если Server Action вернул ошибку, useOptimistic автоматически
        // откатит состояние. Дополнительно показываем ошибку.
        toast({ variant: 'destructive', title: 'Ошибка', description: (error as Error).message });
      }
    });
  };

  const handleShare = async () => {
     const url = window.location.href;
     try {
        await navigator.share({ title: post.title, url });
     } catch(e) {
        toast({ title: 'Ссылка скопирована', description: 'Вы можете вставить ее в любом приложении.' });
        await navigator.clipboard.writeText(url);
     }
  };
  
  const isAuthor = user && post.authorId === user.uid;
  
  const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

  return (
    <div className="flex items-center gap-1 ml-auto">
        <form action={handleLikeAction}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              disabled={isPending}
              className={cn(optimisticState.isLiked ? 'text-red-500 hover:text-red-600' : 'text-text-secondary hover:text-white')}
            >
              <AnimatePresence>
                <motion.div
                  key={optimisticState.isLiked ? 'liked' : 'unliked'}
                  initial={{ scale: 0.8, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10, duration: 0.2 }}
                  className="flex items-center"
                >
                  <Heart className={cn("mr-2 h-5 w-5", optimisticState.isLiked && 'fill-current')} />
                </motion.div>
              </AnimatePresence>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : optimisticState.likesCount}
            </Button>
        </form>
        
        <Button variant="ghost" size="sm" asChild className="text-text-secondary hover:text-white">
           <a href="#comments">
             <MessageCircle className="mr-2 h-5 w-5" />
             {post.commentsCount || 0}
           </a>
        </Button>

        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-text-secondary hover:text-white"><MoreHorizontal className="h-5 w-5" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={handleShare}><Share2 className="mr-2 h-4 w-4" /><span>Поделиться</span></DropdownMenuItem>
                {isAuthor && (<DropdownMenuItem asChild><Link href={`/posts/edit/${post.id}`}><Edit3 className="mr-2 h-4 w-4" /><span>Редактировать</span></Link></DropdownMenuItem>)}
                {!isAuthor && (<DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive"><Flag className="mr-2 h-4 w-4" /><span>Пожаловаться</span></DropdownMenuItem>)}
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
  );
}
