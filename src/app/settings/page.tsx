'use client';

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { users } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
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
import Link from 'next/link';

export default function SettingsPage() {
  const { user, loading } = useAuth();

  // Demo data for a logged-in user
  const currentUser = user ? users.find(u => u.id === user.uid) || users.find(u => u.id === '1') : users.find(u => u.id === '1');
  const userAvatar = currentUser ? PlaceHolderImages.find(img => img.id === currentUser.avatarId) : null;
  
  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Загрузка...</div>;
  }

  if (!user) {
     return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Настройки</h1>
        <p className="mb-4">Пожалуйста, <Link href="/auth" className="text-primary underline">войдите</Link>, чтобы изменить настройки профиля.</p>
      </div>
    );
  }

  if (!currentUser) {
    return <div className="container mx-auto px-4 py-8 text-center">Не удалось загрузить данные пользователя.</div>;
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Настройки</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Профиль</CardTitle>
          <CardDescription>Измените свои личные данные.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Имя</Label>
            <Input id="name" defaultValue={currentUser.name} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">О себе</Label>
            <Textarea id="bio" defaultValue={currentUser.bio} />
          </div>
          <Button>Сохранить изменения</Button>
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Аватар</CardTitle>
          <CardDescription>Загрузите новый аватар.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt={currentUser.name} />}
            <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <Input id="picture" type="file" className="max-w-xs" />
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle>Опасная зона</CardTitle>
          <CardDescription>Удаление аккаунта - необратимое действие.</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Удалить аккаунт</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Вы абсолютно уверены?</AlertDialogTitle>
                <AlertDialogDescription>
                  Это действие невозможно отменить. Ваш аккаунт, все автомобили и посты будут навсегда удалены с наших серверов.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction>Да, удалить</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
