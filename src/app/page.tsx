
'use client';

import { PostCard } from "@/components/PostCard";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from 'firebase/firestore';
import type { Post, User, Car } from '@/lib/data';
import { users, cars } from "@/lib/data"; // Using mock users/cars for now
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const firestore = useFirestore();
  
  const postsQuery = useMemoFirebase(() => 
    firestore 
      ? query(collection(firestore, 'posts'), orderBy('createdAt', 'desc')) 
      : null,
    [firestore]
  );

  const { data: allPosts, isLoading } = useCollection<Post>(postsQuery);

  return (
    <div>
        <h1 className="text-3xl font-bold mb-6">Лента постов</h1>
        <div className="space-y-6">
          {isLoading && (
            <>
              <Card>
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
              <Card>
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
            </>
          )}
          {allPosts && allPosts.map((post) => {
            // In a real app, you might fetch user/car data based on post.userId/post.carId
            // Or you might denormalize this data onto the post document itself.
            const user = users.find((u) => u.id === post.authorId) || users[0];
            const car = cars.find((c) => c.id === post.carId) || cars[0];
            if (!user || !car) return null;
            return <PostCard key={post.id} post={post} user={user} car={car} />;
          })}
        </div>
    </div>
  );
}
