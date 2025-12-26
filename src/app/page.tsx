// src/app/page.tsx
import React from 'react';
import { getAdminDb } from '@/lib/firebase-admin';
import { postConverter, userConverter, autoNewsConverter } from '@/lib/firestore-converters';
import type { Post, User, AutoNews } from '@/lib/types';
import { PostCard } from '@/components/PostCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { TopUsersWidget } from '@/components/TopUsersWidget';
import { AutoNewsWidget } from '@/components/AutoNewsWidget';
import { Skeleton } from '@/components/ui/skeleton';

// Data fetching function for the server component
async function getHomePageData() {
  const db = getAdminDb();
  try {
    const [postsSnap, newsSnap, authorsSnap] = await Promise.all([
      db.collection('posts').withConverter(postConverter).orderBy('createdAt', 'desc').limit(9).get(),
      db.collection('autoNews').withConverter(autoNewsConverter).orderBy('publishedAt', 'desc').limit(3).get(),
      db.collection('users').withConverter(userConverter).orderBy('stats.postsCount', 'desc').limit(3).get(),
    ]);

    const posts = postsSnap.docs.map(doc => doc.data());
    const latestNews = newsSnap.docs.map(doc => doc.data());
    const topAuthors = authorsSnap.docs.map(doc => doc.data());
    
    return { posts, latestNews, topAuthors };
  } catch (error) {
    console.error("Error fetching home page data:", error);
    // Return empty arrays in case of error to prevent crashing the page
    return { posts: [], latestNews: [], topAuthors: [] };
  }
}

function HomePageSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <main className="lg:col-span-3 space-y-8">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-9 w-32" />
                    <Skeleton className="h-10 w-24" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {[...Array(9)].map((_, i) => (
                        <Skeleton key={i} className="aspect-square w-full rounded-xl" />
                    ))}
                </div>
            </main>
            <aside className="lg:col-span-1 space-y-6 hidden lg:block">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
            </aside>
        </div>
    );
}


// Main Page Component (now a Server Component)
export default async function HomePage() {
  const { posts, latestNews, topAuthors } = await getHomePageData();

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 overflow-y-auto scroll-effect p-4 md:p-8">
        <React.Suspense fallback={<HomePageSkeleton />}>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <main className="lg:col-span-3 space-y-8">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold">Лента</h1>
                         <Button asChild variant="outline">
                            <Link href="/posts">Смотреть все</Link>
                        </Button>
                    </div>
                    {posts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {posts.map(post => <PostCard key={post.id} post={post} isSquare={true} />)}
                        </div>
                    ) : (
                        <div className="text-center py-16 border-2 border-dashed rounded-xl">
                        <p className="text-muted-foreground">Публикаций пока нет.</p>
                        </div>
                    )}
                    {/* Pagination can be added back here using a Client Component */}
                </main>
                <aside className="lg:col-span-1 space-y-6 hidden lg:block">
                    <TopUsersWidget topAuthors={topAuthors} loading={false} />
                    <AutoNewsWidget news={latestNews} loading={false} />
                </aside>
            </div>
        </React.Suspense>
      </div>
    </div>
  );
}
