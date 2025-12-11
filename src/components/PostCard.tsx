'use client'

import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Heart, MessageCircle, Clock, Bookmark } from 'lucide-react'

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
    if (diffMins < 60) return `${diffMins} минут назад`
    if (diffHours < 24) return `${diffHours} часов назад`
    if (diffDays === 1) return 'вчера'
    if (diffDays < 7) return `${diffDays} дней назад`
    
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getExcerpt = (html: string) => {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 300)
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
    <article className="py-6 border-b border-border last:border-0 hover:bg-accent/30 transition-colors -mx-4 px-4 rounded-lg">
      <div className="flex items-center gap-3 mb-3">
        <Link 
          href={`/profile/${post.authorId}`}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <Avatar className="w-6 h-6">
            <AvatarImage src={post.authorAvatar} />
            <AvatarFallback className="text-xs">
              {post.authorName?.[0]?.toUpperCase() || 'A'}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">
            {post.authorName}
          </span>
        </Link>
        <span className="text-sm text-muted-foreground">•</span>
        <time className="text-sm text-muted-foreground">
          {formatDate(post.createdAt)}
        </time>
      </div>

      <Link href={postUrl} className="block group">
        <h2 className="text-xl md:text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
          {post.title}
        </h2>

        <div className="flex flex-wrap items-center gap-3 mb-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {getReadTime(post.content)}
          </div>
          {post.category && (
            <>
              <span>•</span>
              <Badge variant="secondary" className="font-normal">
                {post.category}
              </Badge>
            </>
          )}
        </div>

        <p className="text-muted-foreground leading-relaxed mb-4 line-clamp-3">
          {getExcerpt(post.content)}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-sm text-primary font-medium group-hover:underline">
            Читать далее
          </span>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              <span>{likesCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bookmark className="w-4 h-4" />
              <span>0</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              <span>{commentsCount}</span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}
