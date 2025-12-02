'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from "next/image";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { 
  Heart, 
  MessageCircle, 
  Send, // Иконка "самолетика" как в Инсте
  Bookmark,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn, stripHtml } from '@/lib/utils';
import { Badge } from './ui/badge';

export function PostCard({ post }: { post: Post }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isCommentSheetOpen, setCommentSheetOpen] = useState(false);

  useEffect(() => {
    if (user && post.likedBy) {
      setIsLiked(post.likedBy.includes(user.uid));
    }
    setLikesCount(post.likesCount || 0);
  }, [user, post]);

  const handleLike = async () => {
    if (!user || !firestore) return toast({ title: 'Войдите, чтобы оценить' });
    
    const postRef = doc(firestore, 'posts', post.id);
    const newLikedState = !isLiked;
    
    // Optimistic update
    setIsLiked(newLikedState);
    setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);

    try {
      if (!newLikedState) {
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
        setIsLiked(!newLikedState); // Revert on error
    }
  };

  const previewText = post.content ? stripHtml(post.content).substring(0, 120) : '';

  return (
    <>
      <CommentSheet isOpen={isCommentSheetOpen} onOpenChange={setCommentSheetOpen} postId={post.id} />
      
      <div className="bg-background border-b md:border md:rounded-xl overflow-hidden mb-4 md:mb-8 last:border-b-0">
        
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            <Link href={`/profile/${post.authorId}`} className="relative">
              <div className="p-[2px] rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600">
                <Avatar className="h-8 w-8 border-2 border-background">
                  <AvatarImage src={post.authorAvatar} className="object-cover" />
                  <AvatarFallback>{post.authorName?.[0]}</AvatarFallback>
                </Avatar>
              </div>
            </Link>
            <div className="flex flex-col">
                <Link href={`/profile/${post.authorId}`} className="text-sm font-semibold hover:opacity-80 transition-opacity">
                  {post.authorName}
                </Link>
                {post.location && (
                  <span className="text-[11px] text-muted-foreground leading-none">{post.location}</span>
                )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Пожаловаться</DropdownMenuItem>
              <DropdownMenuItem>Копировать ссылку</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {post.imageUrl && (
          <div className="relative w-full aspect-[4/3] bg-muted/30" onDoubleClick={handleLike}>
             <Link href={`/posts/${post.id}`}>
                <Image
                  src={post.imageUrl}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 640px, 50vw"
                />
             </Link>
             {post.carBrand && (
               <div className="absolute bottom-3 left-3">
                 <Badge className="bg-black/60 hover:bg-black/80 text-white border-0 backdrop-blur-sm flex gap-1">
                   <CarIcon className="h-3 w-3" />
                   {post.carBrand} {post.carModel}
                 </Badge>
               </div>
             )}
          </div>
        )}

        <div className="p-3 pb-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <button onClick={handleLike} className="hover:opacity-60 transition-opacity focus:outline-none scale-100 active:scale-90 duration-150">
                <Heart 
                    className={cn("h-7 w-7 transition-colors", isLiked ? "fill-red-500 text-red-500" : "text-foreground")} 
                    strokeWidth={1.5}
                />
              </button>
              <button onClick={() => setCommentSheetOpen(true)} className="hover:opacity-60 transition-opacity focus:outline-none">
                <MessageCircle className="h-7 w-7 -rotate-90 text-foreground" strokeWidth={1.5} />
              </button>
              <button className="hover:opacity-60 transition-opacity focus:outline-none">
                <Send className="h-7 w-7 -rotate-45 -mt-1 text-foreground" strokeWidth={1.5} />
              </button>
            </div>
            <button onClick={() => setIsBookmarked(!isBookmarked)} className="hover:opacity-60 transition-opacity">
                <Bookmark className={cn("h-7 w-7", isBookmarked ? "fill-foreground" : "")} strokeWidth={1.5} />
            </button>
          </div>

          <div className="font-semibold text-sm mb-1">
            {likesCount > 0 ? `${likesCount.toLocaleString()} отметок "Нравится"` : 'Станьте первым, кто оценит'}
          </div>

          <div className="text-sm leading-snug">
            <Link href={`/profile/${post.authorId}`} className="font-semibold mr-2">
                {post.authorName}
            </Link>
            <span className="">{post.title}</span>
            {previewText && (
                <span className="text-muted-foreground ml-1 font-light">
                    - {previewText}...
                </span>
            )}
          </div>

          {post.commentsCount > 0 && (
            <button 
                onClick={() => setCommentSheetOpen(true)} 
                className="block text-muted-foreground text-sm mt-1 mb-1"
            >
                Посмотреть все комментарии ({post.commentsCount})
            </button>
          )}

          <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-1">
            {post.createdAt?.toDate ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true, locale: ru }) : 'Только что'}
          </div>
        </div>
      </div>
    </>
  )
}
