import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Bookmark, Share2 } from 'lucide-react';
import Link from 'next/link';

interface PostCardProps {
  post: {
    id: string;
    title: string;
    author: string;
    avatarUrl: string;
    imageUrl: string;
    imageHint?: string;
    excerpt: string;
    likes: number;
    comments: number;
    tags: string[];
  };
}

export function PostCard({ post }: PostCardProps) {
  return (
    <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl overflow-hidden transition-all duration-300 hover:border-primary/30">
      {/* Image */}
      <div className="relative aspect-video bg-muted overflow-hidden">
        <Image 
          src={post.imageUrl} 
          alt={post.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          data-ai-hint={post.imageHint}
        />
      </div>

      {/* Content */}
      <div className="p-6 bg-card/80">
        {/* Tags */}
        <div className="flex gap-2 mb-3">
          {post.tags.map(tag => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
        </div>

        {/* Title & Excerpt */}
        <h2 className="text-2xl font-bold mb-2 leading-tight">
          <Link href={`/posts/${post.id}`} className="hover:text-primary transition-colors">
            {post.title}
          </Link>
        </h2>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
          {post.excerpt}
        </p>

        {/* Author & Reactions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={post.avatarUrl} alt={post.author} />
              <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{post.author}</p>
              <p className="text-xs text-muted-foreground">2 дня назад</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
             {/* ReactionBar */}
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary">
              <Heart className="h-5 w-5" />
            </Button>
            <span className="text-sm font-medium text-muted-foreground">{post.likes}</span>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
              <MessageCircle className="h-5 w-5" />
            </Button>
            <span className="text-sm font-medium text-muted-foreground">{post.comments}</span>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
              <Bookmark className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
