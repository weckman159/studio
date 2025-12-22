
import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Heart, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface PostCardProps {
  post: Post;
  className?: string;
}

export function PostCard({ post, className }: PostCardProps) {
  // Создаем краткое описание из HTML-контента
  const excerpt = post.content?.replace(/<[^>]*>?/gm, '').substring(0, 100) + '...' || 'Нет описания.';
  const postUrl = post.communityId ? `/communities/${post.communityId}/posts/${post.id}` : `/posts/${post.id}`;

  return (
    <div className={cn(
      "group rounded-xl border border-white/10 bg-black/20 backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10",
      "hover:scale-[1.02] transition-transform duration-300",
      className
    )}>
      <Link href={postUrl} className="flex flex-col h-full">
        <div className="relative w-full h-1/2 overflow-hidden">
          {post.imageUrl ? (
            <Image
              src={post.imageUrl}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-muted/30 flex items-center justify-center">
              <span className="text-muted-foreground text-sm">Нет фото</span>
            </div>
          )}
        </div>
        <div className="p-4 flex flex-col flex-grow justify-between">
          <div>
            {post.category && <Badge variant="secondary" className="mb-2">{post.category}</Badge>}
            <h3 className="font-bold text-lg leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">
              {post.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{excerpt}</p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={post.authorAvatar} />
                <AvatarFallback>{post.authorName?.[0]}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">{post.authorName}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Heart className="h-3 w-3"/>{post.likesCount || 0}</span>
              <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3"/>{post.commentsCount || 0}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
