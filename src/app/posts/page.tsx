import React from 'react';
import { FeedLayout } from '@/components/posts/FeedLayout';
import type { Post } from '@/lib/types';
import { getAdminDb } from '@/lib/firebase-admin';
import { serializeFirestoreData } from '@/lib/utils';
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Revalidate every 60 seconds

// Data fetching function (will be moved to lib/posts.ts in a later stage)
async function getPosts(): Promise<{ posts: Post[], mainFeatured: Post | null, featured: Post[] }> {
  try {
    const db = getAdminDb();
    const postsSnap = await db.collection('posts')
      .where('status', '==', 'published')
      .orderBy('createdAt', 'desc')
      .limit(12)
      .get();
      
    if (postsSnap.empty) {
      return { posts: [], mainFeatured: null, featured: [] };
    }

    const allPosts = postsSnap.docs.map((d: QueryDocumentSnapshot) => serializeFirestoreData({ id: d.id, ...d.data() }) as Post);
    
    const mainFeatured = allPosts.length > 0 ? allPosts[0] : null;
    const featured = allPosts.length > 2 ? [allPosts[1], allPosts[2]] : [];
    const posts = allPosts.slice(3);

    return { posts, mainFeatured, featured };
  } catch (error) {
    console.error("Error fetching posts for feed:", error);
    // Return empty state on error
    return { posts: [], mainFeatured: null, featured: [] };
  }
}

export default async function PostsPage() {
  const { posts, mainFeatured, featured } = await getPosts();

  return (
    <FeedLayout
      title="Лента AutoSphere"
      mainFeaturedPost={mainFeatured}
      featuredPosts={featured}
      posts={posts}
    />
  );
}
