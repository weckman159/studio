
'use client';

import { PostCard } from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, deleteDoc, doc } from 'firebase/firestore';
import type { Post } from '@/lib/data';
import { users, cars } from "@/lib/data"; // for mock user/car data
import { Plus, Edit, Trash2 } from "lucide-react";
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


export default function PostsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const postsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'posts'), where('userId', '==', user.uid));
  }, [user, firestore]);
  
  const { data: userPosts, isLoading: postsLoading } = useCollection<Post>(postsQuery);

  const loading = isUserLoading || postsLoading;

  const handleDelete = async (postId: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'posts', postId));
      toast({ title: "Успех!", description: "Пост был удален." });
    } catch (error: any) {
      toast({ variant: 'destructive', title: "Ошибка", description: "Не удалось удалить пост." });
    }
  };

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
        <Button asChild>
          <Link href="/posts/create">
            <Plus className="mr-2 h-4 w-4" /> Создать пост
          </Link>
        </Button>
      </div>

      {userPosts && userPosts.length > 0 ? (
        <div className="space-y-6">
          {userPosts.map(post => {
            const postUser = users.find(u => u.id === post.userId) || users[0];
            const postCar = cars.find(c => c.id === post.carId) || cars[0];
            
            return (
              <Card key={post.id} className="relative group">
                <PostCard post={post} user={postUser} car={postCar} />
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                  <Button size="icon" variant="outline">
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Редактировать пост</span>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                       <Button size="icon" variant="destructive">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Удалить пост</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Вы абсолютно уверены?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Это действие невозможно отменить. Пост будет удален навсегда.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(post.id)}>Да, удалить</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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
                <Button asChild className="mt-4">
                  <Link href="/posts/create">
                    <Plus className="mr-2 h-4 w-4" /> Создать первый пост
                  </Link>
                </Button>
            </CardContent>
        </Card>
      )}
    </div>
  );
}

