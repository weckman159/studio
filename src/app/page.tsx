
'use client';

import { PostCard } from "@/components/PostCard";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, where } from 'firebase/firestore';
import type { Post, User, Car } from '@/lib/data';
import { users, cars } from "@/lib/data"; 
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { CarOfTheDay } from "@/components/CarOfTheDay";
import { PostFilters } from "@/components/PostFilters";
import { useState } from "react";

export default function Home() {
  const firestore = useFirestore();
  const [activeType, setActiveType] = useState('Все');
  const [searchQuery, setSearchQuery] = useState('');
  
  const postsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    
    let q = query(collection(firestore, 'posts'), orderBy('createdAt', 'desc'));
    
    if (activeType !== 'Все') {
      q = query(q, where('type', '==', activeType));
    }
    
    return q;
  }, [firestore, activeType]);

  const { data: allPosts, isLoading } = useCollection<Post>(postsQuery);

  const filteredPosts = allPosts?.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="lg:col-span-1">
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
        <div className="space-y-6">
          {isLoading && (
            <>
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-64" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <Skeleton className="aspect-video w-full rounded-lg" />
                  </CardContent>
                  <CardFooter className="flex justify-between">
                     <Skeleton className="h-8 w-24" />
                     <Skeleton className="h-8 w-24" />
                  </CardFooter>
                </Card>
              ))}
            </>
          )}
          {filteredPosts && filteredPosts.map((post) => {
            const user = users.find((u) => u.id === post.authorId) || users[0];
            const car = cars.find((c) => c.id === post.carId) || cars[0];
            if (!user || !car) return null;
            return <PostCard key={post.id} post={post} user={user} car={car} />;
          })}
           {!isLoading && filteredPosts?.length === 0 && (
            <Card>
              <CardContent className="p-10 text-center text-muted-foreground">
                <p>Посты, соответствующие вашим фильтрам, не найдены.</p>
              </CardContent>
            </Card>
          )}
        </div>
    </div>
    </div>
  );
}
