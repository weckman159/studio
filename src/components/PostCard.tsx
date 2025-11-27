'use client'
import { useState } from 'react'
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
    // TODO: Отправить в Firestore
  }

  const handleBookmark = () => {
    setBookmarked(!bookmarked)
    // TODO: Отправить в Firestore
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
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group border-border/50">
      {/* Header: Автор и метаданные */}
      <div className="p-4 flex items-start justify-between">
        <Link 
          href={`/profile/${post.authorId}`}
          className="flex items-center gap-3 flex-1 hover:opacity-80 transition-opacity"
        >
          <Avatar className="h-12 w-12 ring-2 ring-background shadow-md">
            <AvatarImage src={post.authorAvatar} alt={post.authorName} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
              {post.authorName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm truncate">{post.authorName}</span>
              {post.carBrand && (
                <Badge variant="secondary" className="text-xs">
                  {post.carBrand} {post.carModel}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>в бортжурнале</span>
              <span>•</span>
              <time>{formatDistanceToNow(post.createdAt, { addSuffix: true, locale: ru })}</time>
            </div>
          </div>
        </Link>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Пожаловаться</DropdownMenuItem>
            <DropdownMenuItem>Скрыть пост</DropdownMenuItem>
            <DropdownMenuItem onClick={handleShare}>Скопировать ссылку</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Контент: Заголовок и превью */}
      <Link href={`/posts/${post.id}`} className="block">
        <div className="px-4 pb-3">
          <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {post.excerpt}
          </p>
        </div>

        {/* Изображение (если есть) */}
        {post.coverImage && (
          <div className="relative aspect-video overflow-hidden">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Категория поверх фото */}
            <Badge className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm border-0 text-white">
              {post.category}
            </Badge>
          </div>
        )}
      </Link>

      {/* Footer: Действия и статистика */}
      <div className="px-4 py-3 flex items-center justify-between border-t border-border/50">
        {/* Левая часть: основные действия */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className={`gap-2 ${liked ? 'text-red-500' : 'text-muted-foreground'} hover:text-red-500 transition-colors`}
            onClick={handleLike}
          >
            <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
            <span className="font-medium">{likesCount}</span>
          </Button>

          <Link href={`/posts/${post.id}#comments`}>
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
              <MessageCircle className="h-5 w-5" />
              <span className="font-medium">{post.comments}</span>
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="sm"
            className={`gap-2 ${bookmarked ? 'text-yellow-500' : 'text-muted-foreground'} hover:text-yellow-500 transition-colors`}
            onClick={handleBookmark}
          >
            <Bookmark className={`h-5 w-5 ${bookmarked ? 'fill-current' : ''}`} />
          </Button>
        </div>

        {/* Правая часть: просмотры и шаринг */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="h-4 w-4" />
            <span suppressHydrationWarning>
              {post.views.toLocaleString('ru-RU')}
            </span>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
