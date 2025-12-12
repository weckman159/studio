import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Search, Rss } from 'lucide-react';
import type { Post } from '@/lib/types';
import { PostCard } from '@/components/PostCard';
import { FeedSidebar } from './FeedSidebar';

const sections = [
  { title: 'Все', url: '#' },
  { title: 'Тюнинг', url: '#' },
  { title: 'Проекты', url: '#' },
  { title: 'Ремонт', url: '#' },
  { title: 'Фото', url: '#' },
  { title: 'События', url: '#' },
];

function MainFeaturedPost({ post }: { post: Post }) {
  return (
    <div className="relative p-8 md:p-12 mb-8 rounded-2xl bg-muted overflow-hidden text-white glass">
      <div className="absolute inset-0 z-0">
        {post.imageUrl && (
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            className="object-cover opacity-20 blur-sm"
          />
        )}
      </div>
      <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4 text-shadow">
            {post.title}
          </h1>
          <p className="text-lg text-white/80 mb-6 line-clamp-3">
             {post.content.replace(/<[^>]*>?/gm, '')}
          </p>
          <Button size="lg" asChild>
            <Link href={`/posts/${post.id}`}>Читать далее</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function FeaturedPost({ post }: { post: Post }) {
  return (
    <Link href={`/posts/${post.id}`}>
        <div className="group relative overflow-hidden rounded-2xl glass-card h-full flex flex-col">
            <div className="relative h-48 w-full">
                {post.imageUrl ? (
                <Image
                    src={post.imageUrl}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                ) : <div className="h-full w-full bg-muted"></div>}
            </div>
            <div className="p-4 flex-1 flex flex-col">
                <h2 className="text-xl font-bold mb-2 line-clamp-2">{post.title}</h2>
                <p className="text-sm text-muted-foreground line-clamp-3 flex-1">{post.content.replace(/<[^>]*>?/gm, '')}</p>
                <div className="text-xs text-muted-foreground mt-2">{new Date(post.createdAt).toLocaleDateString('ru-RU')}</div>
            </div>
        </div>
    </Link>
  );
}

interface FeedLayoutProps {
  title: string;
  mainFeaturedPost: Post | null;
  featuredPosts: Post[];
  posts: Post[];
}

export function FeedLayout({ title, mainFeaturedPost, featuredPosts, posts }: FeedLayoutProps) {
  return (
    <div className="w-full">
      {/* Header */}
      <header className="flex items-center justify-between py-4 border-b border-border/50 mb-8">
        <div className="flex items-center gap-2">
            <Rss className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold hidden sm:block">{title}</h2>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {sections.map((section) => (
            <Link key={section.title} href={section.url} className="text-muted-foreground hover:text-foreground transition-colors">
              {section.title}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Поиск..." className="pl-9 h-9" />
          </div>
          <Button asChild>
            <Link href="/posts/create">Создать пост</Link>
          </Button>
        </div>
      </header>

      {/* Main Featured Post */}
      {mainFeaturedPost && <MainFeaturedPost post={mainFeaturedPost} />}

      {/* Featured Posts */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {featuredPosts.map((post) => (
          <FeaturedPost key={post.id} post={post} />
        ))}
      </div>
      
      <Separator className="my-8" />

      {/* Main Content */}
      <div className="grid lg:grid-cols-12 gap-8">
        <main className="lg:col-span-8">
          <h3 className="text-3xl font-bold mb-6">Последние публикации</h3>
          <div className="space-y-8">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
            {posts.length === 0 && <p className="text-muted-foreground">Публикаций пока нет.</p>}
          </div>
        </main>
        
        {/* Sidebar */}
        <aside className="lg:col-span-4 lg:sticky top-24 self-start">
            <FeedSidebar />
        </aside>
      </div>
    </div>
  );
}
