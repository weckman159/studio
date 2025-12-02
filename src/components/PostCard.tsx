
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from "next/image";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  Car as CarIcon
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Post } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { useUser, useFirestore } from '@/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { CommentSheet } from './CommentSheet';
import { stripHtml } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function PostCard({ post }: { post: Post }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [isCommentSheetOpen, setCommentSheetOpen] = useState(false);

  useEffect(() => {
    if (user && post.likedBy) {
      setIsLiked(post.likedBy.includes(user.uid));
    } else {
      setIsLiked(false);
    }
    setLikesCount(post.likesCount || 0);
  }, [user, post]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Необходимо войти в систему' });
      return;
    }
    
    const postRef = doc(firestore, 'posts', post.id);
    const newIsLiked = !isLiked;
    
    // Optimistic update
    setIsLiked(newIsLiked);
    setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1);

    try {
      if (!newIsLiked) {
        await updateDoc(postRef, {
          likesCount: increment(-1),
          likedBy: arrayRemove(user.uid)
        });
      } else {
        await updateDoc(postRef, {
          likesCount: increment(1),
          likedBy: arrayUnion(user.uid)
        });
      }
    } catch(err) {
        console.error("Like error: ", err);
        setIsLiked(!newIsLiked);
        setLikesCount(prev => !newIsLiked ? prev + 1 : prev - 1);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/posts/${post.id}`;
    try {
        await navigator.clipboard.writeText(url);
        toast({ title: 'Ссылка скопирована' });
    } catch (err) {
        toast({ title: 'Ошибка', variant: 'destructive' });
    }
  }

  // Очищаем контент от HTML тегов для превью
  const previewText = post.content ? stripHtml(post.content).slice(0, 150) : '';

  return (
    <>
      <CommentSheet isOpen={isCommentSheetOpen} onOpenChange={setCommentSheetOpen} postId={post.id} />
      
      <Card className="overflow-hidden border-0 shadow-md dark:bg-card/60 dark:border dark:border-border">
        {/* Header */}
        <CardHeader className="p-4 flex flex-row items-center gap-3 space-y-0">
          <Link href={`/profile/${post.authorId}`} className="relative">
            <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
              <AvatarImage src={post.authorAvatar} alt={post.authorName} />
              <AvatarFallback>{post.authorName?.[0]}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link href={`/profile/${post.authorId}`} className="font-semibold text-sm hover:underline truncate">
                {post.authorName}
              </Link>
              {post.type && <Badge variant="secondary" className="text-[10px] px-1.5 h-5">{post.type}</Badge>}
            </div>
            <p className="text-xs text-muted-foreground">
               {post.createdAt?.toDate ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true, locale: ru }) : 'Только что'}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleShare}>Поделиться</DropdownMenuItem>
              {user?.uid === post.authorId && (
                 <DropdownMenuItem asChild>
                    <Link href={`/posts/edit/${post.id}`}>Редактировать</Link>
                 </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        {/* Image Content */}
        {post.imageUrl && (
          <Link href={`/posts/${post.id}`} className="block relative w-full bg-muted">
             <div className="relative w-full aspect-[4/3] sm:aspect-video">
                <Image
                  src={post.imageUrl}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
             </div>
             {post.carBrand && (
               <div className="absolute bottom-3 left-3">
                 <Badge className="bg-black/60 hover:bg-black/80 text-white border-0 backdrop-blur-sm flex gap-1">
                   <CarIcon className="h-3 w-3" />
                   {post.carBrand} {post.carModel}
                 </Badge>
               </div>
             )}
          </Link>
        )}

        {/* Text Content */}
        <CardContent className="p-4 pb-2">
            <Link href={`/posts/${post.id}`} className="block group">
                <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-primary transition-colors">
                    {post.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {previewText}...
                </p>
            </Link>
        </CardContent>

        {/* Footer Actions */}
        <CardFooter className="p-3 pt-0 flex items-center justify-between border-t bg-muted/10 mt-2">
           <div className="flex gap-1">
             <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLike}
                className={`gap-2 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 ${isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
             >
               <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
               <span className="text-sm font-medium">{likesCount > 0 && likesCount}</span>
             </Button>

             <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => { e.stopPropagation(); setCommentSheetOpen(true); }}
                className="gap-2 text-muted-foreground hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950"
             >
               <MessageCircle className="h-5 w-5" />
               <span className="text-sm font-medium">{post.commentsCount > 0 && post.commentsCount}</span>
             </Button>
           </div>
           
           <Button variant="ghost" size="icon" onClick={handleShare} className="text-muted-foreground">
             <Share2 className="h-5 w-5" />
           </Button>
        </CardFooter>
      </Card>
    </>
  )
}
