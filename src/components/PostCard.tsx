
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Heart, MessageCircle, ChevronRight, Image as ImageIcon } from 'lucide-react'

interface PostCardProps {
  post: {
    id: string
    title: string
    content: string
    category?: string
    coverImage?: string
    imageUrl?: string
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
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getExcerpt = (html: string) => {
    if (!html) return '';
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 180)
  }

  const likesCount = post.likesCount ?? post.likes ?? 0
  const commentsCount = post.commentsCount ?? post.comments ?? 0
  const coverImage = post.coverImage || post.imageUrl

  const postUrl = communityId 
    ? `/communities/${communityId}/posts/${post.id}`
    : `/posts/${post.id}`

  return (
    <Link href={postUrl}>
      <article className="group mb-6 rounded-3xl border border-border/40 bg-card overflow-hidden transition-all duration-300 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1">
        <div className="flex flex-col md:flex-row">
          <div className="relative w-full md:w-2/5 h-56 md:h-auto bg-muted overflow-hidden">
            {coverImage ? (
              <Image
                src={coverImage}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                <ImageIcon className="w-16 h-16 text-muted-foreground/30" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>

          <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-4 transition-colors duration-300 group-hover:text-primary">
                {post.title}
              </h2>

              <p className="text-muted-foreground leading-relaxed mb-6 line-clamp-2">
                {getExcerpt(post.content)}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div 
                  className="flex items-center gap-3"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    window.location.href = `/profile/${post.authorId}`
                  }}
                >
                  <Avatar className="w-10 h-10 ring-2 ring-border/30">
                    <AvatarImage src={post.authorAvatar} />
                    <AvatarFallback className="text-sm font-semibold">
                      {post.authorName?.[0]?.toUpperCase() || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold leading-none mb-1">
                      {post.authorName || 'Автор'}
                    </p>
                    <time className="text-xs text-muted-foreground">
                      {formatDate(post.createdAt)}
                    </time>
                  </div>
                </div>

                <div className="text-primary transition-transform duration-300 group-hover:translate-x-1">
                  <ChevronRight className="w-6 h-6" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/30">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-muted-foreground transition-colors duration-300 group-hover:text-red-500">
                    <Heart className="w-5 h-5 transition-all duration-300 group-hover:fill-red-500" />
                    <span className="text-sm font-semibold">{likesCount}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm font-semibold">{commentsCount}</span>
                  </div>
                </div>

                {post.category && (
                  <Badge 
                    variant="secondary" 
                    className="bg-primary/10 text-primary border-primary/20 font-medium px-3 py-1.5"
                  >
                    {post.category}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
