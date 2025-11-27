
'use client';

import { PostCard } from "@/components/PostCard";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, where } from 'firebase/firestore';
import type { Post, User, Car } from '@/lib/data';
import { users, cars, posts as mockPosts } from "@/lib/data"; 
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { useState } from "react";
import { CarOfTheDay } from "@/components/CarOfTheDay";
import { PostFilters } from "@/components/PostFilters";

function PostFeed({ posts, loading }: { posts: Post[], loading?: boolean }) {
  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="border rounded-xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="aspect-video w-full rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}


export default function Home() {
  const [activeType, setActiveType] = useState('Все');
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredPosts = mockPosts.filter(post => 
    (activeType === 'Все' || post.category === activeType) &&
    (post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <CarOfTheDay />
        </div>
        <div className="lg:col-span-1">
          <PostFilters 
            activeType={activeType}
            onTypeChange={setActiveType}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>
      </div>
      <div>
        <h1 className="text-3xl font-bold mb-6">Лента постов</h1>
        <PostFeed posts={filteredPosts} loading={false} />
      </div>
    </div>
  );
}

    