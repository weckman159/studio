'use client'

import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Heart, MessageCircle, Clock, Bookmark, TrendingUp } from 'lucide-react'

interface PostCardProps {
  post: {
    id: string
    title: string
    content: string
    category?: string
    authorId: string
    authorName?: string
    authorAvatar?: string
    createdAt: any
    likesCount?: number
    likes?: number
    commentsCount?: number
    comments?: number
  }
  communityId?: string
}

export function PostCard({ post, communityId }: PostCardProps) {
  const formatDate = (timestamp: any) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'только что'
    if (diffMins < 60) return `${diffMins} мин назад`
    if (diffHours < 24) return `${diffHours} ч назад`
    if (diffDays === 1) return 'вчера'
    if (diffDays < 7) return `${diffDays} д назад`
    
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short'
    })
  }

  const getExcerpt = (html: string) => {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 280)
  }

  const getReadTime = (html: string) => {
    const words = html.replace(/<[^>]*>/g, '').split(/\s+/).length
    const minutes = Math.ceil(words / 200)
    return `${minutes} мин`
  }

  const likesCount = post.likesCount ?? post.likes ?? 0
  const commentsCount = post.commentsCount ?? post.comments ?? 0

  const postUrl = communityId 
    ? `/communities/${communityId}/posts/${post.id}`
    : `/posts/${post.id}`

  return (
    <article className="group relative mb-6 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-6 transition-all duration-300 hover:border-primary/30 hover:bg-card/50 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
      {/* Градиентный акцент */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      <div className="relative">
        {/* Автор + мета */}
        <div className="flex items-center justify-between mb-4">
          <Link 
            href={`/profile/${post.authorId}`}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <Avatar className="w-9 h-9 ring-2 ring-border/50 transition-all duration-300 group-hover:ring-primary/50">
              <AvatarImage src={post.authorAvatar} />
              <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-primary/20 to-primary/5">
                {post.authorName?.[0]?.toUpperCase() || 'A'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium leading-none mb-1">
                {post.authorName}
              </p>
              <time className="text-xs text-muted-foreground">
                {formatDate(post.createdAt)}
              </time>
            </div>
          </Link>

          {/* Категория */}
          {post.category && (
            <Badge 
              variant="secondary" 
              className="bg-primary/10 text-primary border-primary/20 font-medium px-3 py-1"
            >
              {post.category}
            </Badge>
          )}
        </div>

        <Link href={postUrl} className="block space-y-3">
          {/* Заголовок */}
          <h2 className="text-2xl md:text-3xl font-bold leading-tight tracking-tight transition-colors duration-300 group-hover:text-primary">
            {post.title}
          </h2>

          {/* Краткое описание */}
          <p className="text-muted-foreground leading-relaxed line-clamp-2 text-base">
            {getExcerpt(post.content)}
          </p>

          {/* Футер: время чтения + статистика */}
          <div className="flex items-center justify-between pt-3 border-t border-border/30">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{getReadTime(post.content)}</span>
              </div>
              
              <div className="flex items-center gap-1.5 transition-colors duration-300 group-hover:text-red-500">
                <Heart className="w-4 h-4 transition-all duration-300 group-hover:fill-red-500" />
                <span className="font-medium">{likesCount}</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4" />
                <span className="font-medium">{commentsCount}</span>
              </div>
            </div>

            {/* Читать далее */}
            <div className="flex items-center gap-2 text-sm font-semibold text-primary transition-all duration-300 group-hover:gap-3">
              <span>Читать</span>
              <TrendingUp className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </div>
        </Link>
      </div>
    </article>
  )
}
