'use client';

import { PostCard } from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { posts, users, cars } from "@/lib/data";
import { useAuth } from "@/hooks/use-auth";
import { Plus, Edit, Trash2 } from "lucide-react";
import Link from 'next/link';

export default function PostsPage() {
  const { user, loading } = useAuth();
  
  // For demonstration, we'll filter posts for the first user if no one is logged in.
  const userId = user ? user.uid : '1';
  const userPosts = posts.filter(post => post.userId === userId);

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Загрузка...</div>;
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Бортжурналы</h1>
        <p className="mb-4">Пожалуйста, <Link href="/auth" className="text-primary underline">войдите</Link>, чтобы управлять своими постами.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Бортжурналы</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Создать пост
        </Button>
      </div>

      {userPosts.length > 0 ? (
        <div className="space-y-6">
          {userPosts.map(post => {
            const postUser = users.find(u => u.id === post.userId);
            const postCar = cars.find(c => c.id === post.carId);
            if (!postUser || !postCar) return null;
            return (
              <Card key={post.id} className="relative group">
                <PostCard post={post} user={postUser} car={postCar} />
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                  <Button size="icon" variant="outline">
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit Post</span>
                  </Button>
                  <Button size="icon" variant="destructive">
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete Post</span>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="text-center py-16 border-2 border-dashed">
            <CardContent>
                <h2 className="text-xl font-semibold text-muted-foreground">У вас пока нет постов</h2>
                <p className="text-muted-foreground mt-2">Расскажите о своем автомобиле, поделитесь опытом ремонта или планами на тюнинг.</p>
                <Button className="mt-4">
                    <Plus className="mr-2 h-4 w-4" /> Создать первый пост
                </Button>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
