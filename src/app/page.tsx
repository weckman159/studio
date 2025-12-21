
import React from 'react';
import { getAdminDb } from '@/lib/firebase-admin';
import { serializeFirestoreData } from '@/lib/utils';
import type { Post, User, AutoNews } from '@/lib/types';
import { PostCard } from '@/components/PostCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Import the new reusable widgets
import { TopUsersWidget } from '@/components/TopUsersWidget';
import { AutoNewsWidget } from '@/components/AutoNewsWidget';

// Data fetching function for the server component
async function getHomePageData() {
  const db = getAdminDb();
  try {
    const [postsSnap, newsSnap, authorsSnap] = await Promise.all([
      db.collection('posts').orderBy('createdAt', 'desc').limit(5).get(),
      db.collection('autoNews').orderBy('publishedAt', 'desc').limit(3).get(),
      db.collection('users').orderBy('stats.postsCount', 'desc').limit(3).get(),
    ]);

    const posts = postsSnap.docs.map(doc => serializeFirestoreData({ id: doc.id, ...doc.data() }) as Post);
    const latestNews = newsSnap.docs.map(doc => serializeFirestoreData({ id: doc.id, ...doc.data() }) as AutoNews);
    const topAuthors = authorsSnap.docs.map(doc => serializeFirestoreData({ id: doc.id, ...doc.data() }) as User);
    
    return { posts, latestNews, topAuthors };
  } catch (error) {
    console.error("Error fetching home page data:", error);
    return { posts: [], latestNews: [], topAuthors: [] };
  }
}

// Main Page Component (now a Server Component)
export default async function HomePage() {
  const { posts, latestNews, topAuthors } = await getHomePageData();

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 overflow-y-auto scroll-effect p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <main className="lg:col-span-3 space-y-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Лента</h1>
                    <Button asChild variant="outline">
                        <Link href="/posts">Смотреть все</Link>
                    </Button>
                </div>
                {posts.length > 0 ? (
                    posts.map(post => <PostCard key={post.id} post={post} />)
                ) : (
                    <div className="text-center py-16 border-2 border-dashed rounded-xl">
                    <p className="text-muted-foreground">Публикаций пока нет.</p>
                    </div>
                )}
            </main>
            <aside className="lg:col-span-1 space-y-6 hidden lg:block">
                <TopUsersWidget topAuthors={topAuthors} loading={false} />
                <AutoNewsWidget news={latestNews} loading={false} />
            </aside>
        </div>
      </div>
    </div>
  );
}
