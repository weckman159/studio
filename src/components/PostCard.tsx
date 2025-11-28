
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from "next/image";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Share2, 
  Eye
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Post } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { useUser, useFirestore } from '@/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { CommentSheet } from './CommentSheet';

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
    e.preventDefault();
    e.stopPropagation();

    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Необходимо войти в систему' });
      return;
    }
    
    const postRef = doc(firestore, 'posts', post.id);

    try {
      if (isLiked) {
        // Unlike
        setLikesCount(prev => prev - 1);
        setIsLiked(false);
        await updateDoc(postRef, {
          likesCount: increment(-1),
          likedBy: arrayRemove(user.uid)
        });
      } else {
        // Like
        setLikesCount(prev => prev + 1);
        setIsLiked(true);
        await updateDoc(postRef, {
          likesCount: increment(1),
          likedBy: arrayUnion(user.uid)
        });
      }
    } catch(err) {
        console.error("Like error: ", err);
        // Revert state on error
        setLikesCount(post.likesCount || 0);
        setIsLiked(post.likedBy?.includes(user.uid) || false);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/posts/${post.id}`;
    try {
        await navigator.clipboard.writeText(url);
        toast({ title: 'Ссылка скопирована', description: 'Можете поделиться постом' });
    } catch (err) {
        toast({ title: 'Ошибка', description: 'Не удалось скопировать ссылку', variant: 'destructive' });
    }
  }

  const openComments = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCommentSheetOpen(true);
  }

  return (
    <>
      <CommentSheet isOpen={isCommentSheetOpen} onOpenChange={setCommentSheetOpen} postId={post.id} />
      <Card className="overflow-hidden rounded-2xl flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        {post.imageUrl && (
          <Link href={`/posts/${post.id}`} className="block relative aspect-video overflow-hidden group">
              <Image
                src={post.imageUrl}
                alt={post.title}
                fill
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {post.carBrand && post.carId && (
                  <Link href={`/car/${post.carId}`} onClick={(e) => e.stopPropagation()}>
                    <Badge variant="secondary" className="absolute bottom-2 left-2 bg-black/50 text-white border-0 hover:bg-black/70">
                        {post.carBrand} {post.carModel}
                    </Badge>
                  </Link>
              )}
          </Link>
        )}

        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-center gap-3 mb-3">
              <Link href={`/profile/${post.authorId}`} className="flex-shrink-0">
                  <Avatar className="h-10 w-10">
                      <AvatarImage src={post.authorAvatar} alt={post.authorName} />
                      <AvatarFallback>{post.authorName?.[0]}</AvatarFallback>
                  </Avatar>
              </Link>
              <div>
                  <Link href={`/profile/${post.authorId}`} className="font-semibold text-sm hover:underline">{post.authorName}</Link>
                  <p className="text-xs text-muted-foreground">
                    {post.createdAt?.toDate ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true, locale: ru }) : 'Недавно'}
                  </p>
              </div>
          </div>

          <Link href={`/posts/${post.id}`} className="flex-1">
              <h3 className="font-bold text-md mb-2 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                  {post.title}
              </h3>
              <div 
                  className="text-sm text-muted-foreground line-clamp-3 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: post.content || '' }}
              />
          </Link>

          <div className="pt-3 mt-auto flex items-center justify-between">
              <div className="flex items-center gap-1">
                  <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-xs h-8 px-2"
                      onClick={handleLike}
                  >
                      <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
                      <span>{likesCount}</span>
                  </Button>
                  <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-xs h-8 px-2"
                      onClick={openComments}
                  >
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      <span>{post.commentsCount || 0}</span>
                  </Button>
              </div>
               <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleShare}
                >
                    <Share2 className="h-4 w-4" />
                </Button>
          </div>
        </div>
      </Card>
    </>
  )
}
