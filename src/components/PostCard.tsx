
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
  MoreHorizontal,
  Eye
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Post } from '@/lib/data'
import { useToast } from '@/hooks/use-toast'

export function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(post.isLiked || false)
  const [bookmarked, setBookmarked] = useState(post.isBookmarked || false)
  const [likesCount, setLikesCount] = useState(post.likes)
  const { toast } = useToast()

  const handleLike = () => {
    setLiked(!liked)
    setLikesCount(prev => liked ? prev - 1 : prev + 1)
  }

  const handleBookmark = () => {
    setBookmarked(!bookmarked)
  }
  
  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      
      try {
        const success = document.execCommand('copy');
        textArea.remove();
        return success;
      } catch {
        textArea.remove();
        return false;
      }
    } catch {
      return false;
    }
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/posts/${post.id}`;
    const success = await copyToClipboard(url);
    
    if (success) {
      toast({
        title: 'Ссылка скопирована',
        description: 'Можете поделиться постом',
      });
    } else {
      toast({
        title: 'Ошибка',
        description: 'Не удалось скопировать ссылку',
        variant: 'destructive',
      });
    }
  }

  return (
    <Card className="overflow-hidden rounded-2xl flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      {/* Изображение */}
      {post.coverImage && (
        <Link href={`/posts/${post.id}`} className="block relative aspect-video overflow-hidden">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {post.carBrand && (
                <Badge variant="secondary" className="absolute bottom-2 left-2 bg-black/50 text-white border-0">
                  {post.carBrand} {post.carModel}
                </Badge>
            )}
            <Button
                variant="ghost"
                size="icon"
                onClick={(e) => { e.preventDefault(); handleBookmark(); }}
                className={`absolute top-2 right-2 h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white ${bookmarked ? 'text-yellow-400' : ''}`}
            >
                <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-current' : ''}`} />
            </Button>
        </Link>
      )}

      {/* Контент */}
      <div className="p-4 flex flex-col flex-1">
        {/* Header: Автор */}
        <div className="flex items-center gap-3 mb-3">
            <Link href={`/profile/${post.authorId}`} className="flex-shrink-0">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={post.authorAvatar} alt={post.authorName} />
                    <AvatarFallback>{post.authorName[0]}</AvatarFallback>
                </Avatar>
            </Link>
            <div>
                <Link href={`/profile/${post.authorId}`} className="font-semibold text-sm hover:underline">{post.authorName}</Link>
                <p className="text-xs text-muted-foreground">{formatDistanceToNow(post.createdAt, { addSuffix: true, locale: ru })}</p>
            </div>
        </div>

        {/* Заголовок и текст */}
        <Link href={`/posts/${post.id}`} className="flex-1">
            <h3 className="font-bold text-base mb-2 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                {post.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {post.excerpt}
            </p>
        </Link>

        {/* Footer: Действия и статистика */}
        <div className="pt-3 mt-auto flex items-center justify-between">
            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-xs h-8 px-2"
                    onClick={handleLike}
                >
                    <Heart className={`h-4 w-4 ${liked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
                    <span>{likesCount}</span>
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-xs h-8 px-2"
                    asChild
                >
                    <Link href={`/posts/${post.id}#comments`}>
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                        <span>{post.comments}</span>
                    </Link>
                </Button>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span suppressHydrationWarning>{post.views.toLocaleString('ru-RU')}</span>
            </div>
        </div>
      </div>
    </Card>
  )
}
