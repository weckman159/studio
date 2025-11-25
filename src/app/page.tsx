
'use client';

import { PostCard } from "@/components/PostCard";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from 'firebase/firestore';
import type { Post, User, Car } from '@/lib/data';
import { users, cars } from "@/lib/data"; // Using mock users/cars for now

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
          {isLoading && <p>Загрузка постов...</p>}
          {allPosts && allPosts.map((post) => {
            // In a real app, you might fetch user/car data based on post.userId/post.carId
            // Or you might denormalize this data onto the post document itself.
            const user = users.find((u) => u.id === post.userId) || users[0];
            const car = cars.find((c) => c.id === post.carId) || cars[0];
            if (!user || !car) return null;
            return <PostCard key={post.id} post={post} user={user} car={car} />;
          })}
        </div>
    </div>
  );
}
