
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Heart, MessageCircle } from 'lucide-react'
import type { Post } from '@/lib/types'
import { cn } from '@/lib/utils'

export function PostCard({ post, communityId, isSquare = false }: { post: Post, communityId?: string, isSquare?: boolean }) {
  const formatDate = (timestamp: any) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getExcerpt = (html: string, length: number = 100) => {
    if (!html) return '';
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, length)
  }

  const postUrl = communityId 
    ? `/communities/${communityId}/posts/${post.id}`
    : `/posts/${post.id}`

  if (isSquare) {
    return (
        <Link href={postUrl} className="group relative aspect-square rounded-sm overflow-hidden bg-[#151515] transition-all duration-300">
            {post.imageUrl && (
                 <Image
                    src={post.imageUrl}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-4">
                 <h3 className="text-sm font-bold text-[#EEE] line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                    {post.title}
                 </h3>
                 <div className="flex items-center justify-between text-xs text-[#AAA]">
                    <div className="flex items-center gap-2">
                        <Avatar className="w-5 h-5">
                            <AvatarImage src={post.authorAvatar} />
                            <AvatarFallback className="text-[10px]">{post.authorName?.[0]}</AvatarFallback>
                        </Avatar>
                        <span className="truncate">{post.authorName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {post.likesCount || 0}</span>
                        <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {post.commentsCount || 0}</span>
                    </div>
                 </div>
            </div>
        </Link>
    )
  }

  // Default non-square layout
  return (
    <Link href={postUrl} className="group flex flex-col space-y-4 rounded-xl holographic-panel p-4 transition-transform duration-300 hover:-translate-y-1">
      {post.imageUrl && (
        <div className="relative w-full aspect-[16/10] bg-muted rounded-lg overflow-hidden">
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      )}

      <div className="flex flex-col flex-1 space-y-3">
        {post.category && (
            <Badge variant="secondary" className="w-fit">{post.category}</Badge>
        )}
        <h2 className="text-xl font-bold leading-tight line-clamp-2 text-white group-hover:text-primary transition-colors">
          {post.title}
        </h2>
        <p className="text-sm text-text-secondary line-clamp-2 flex-grow">
          {getExcerpt(post.content)}...
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border/20">
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = `/profile/${post.authorId}`;
          }}
        >
          <Avatar className="w-8 h-8">
            <AvatarImage src={post.authorAvatar} />
            <AvatarFallback className="text-xs">
              {post.authorName?.[0]?.toUpperCase() || 'A'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold leading-none text-white">
              {post.authorName || 'Автор'}
            </p>
            <time className="text-xs text-text-secondary">
              {formatDate(post.createdAt)}
            </time>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-text-secondary">
          <span className="flex items-center gap-1.5"><Heart className="w-4 h-4" /> {post.likesCount || 0}</span>
          <span className="flex items-center gap-1.5"><MessageCircle className="w-4 h-4" /> {post.commentsCount || 0}</span>
        </div>
      </div>
    </Link>
  )
}
