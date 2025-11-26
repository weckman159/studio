
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser, useFirestore, useStorage } from '@/firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';
import type { User as UserData } from '@/lib/data';
import { useFileUpload } from '@/hooks/use-file-upload';

interface EditProfileModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  user: UserData;
  onSave: (updatedUser: UserData) => void;
}

const profileFormSchema = z.object({
  name: z.string()
    .min(2, { message: 'Имя должно содержать минимум 2 символа' })
    .max(50, { message: 'Имя не должно превышать 50 символов' }),
  nickname: z.string().max(50, { message: 'Никнейм не должен превышать 50 символов' }).optional(),
  bio: z.string().max(500, { message: 'Биография не должна превышать 500 символов' }).optional(),
  location: z.string().max(100, { message: 'Местоположение не должно превышать 100 символов' }).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function EditProfileModal({ isOpen, setIsOpen, user, onSave }: EditProfileModalProps) {
  const { toast } = useToast();
  const { user: authUser, auth } = useUser();
  const firestore = useFirestore();
  const storage = useStorage();

  const { uploadFiles, uploading, progress, error: uploadError } = useFileUpload({ maxFiles: 1, maxSizeInMB: 5 });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      nickname: '',
      bio: '',
      location: '',
    },
  });

  useEffect(() => {
    if (user && isOpen) {
      form.reset({
        name: user.name || '',
        nickname: user.nickname || '',
        bio: user.bio || '',
        location: user.location || '',
      });
      setAvatarPreview(user.photoURL || '');
      setAvatarFile(null);
    }
  }, [user, isOpen, form]);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!authUser || !firestore || !storage || !auth) {
      toast({ variant: "destructive", title: "Ошибка", description: "Необходима авторизация." });
      return;
    }

    try {
      let newAvatarUrl = user.photoURL || '';

      if (avatarFile) {
        const uploadResult = await uploadFiles([avatarFile], 'avatars', authUser.uid);
        if (uploadResult.length > 0) {
          newAvatarUrl = uploadResult[0].url;
        } else {
          throw new Error(uploadError || "Не удалось загрузить аватар.");
        }
      }

      const updatedUserData = {
        ...user,
        name: data.name,
        nickname: data.nickname,
        bio: data.bio,
        location: data.location,
        photoURL: newAvatarUrl,
        updatedAt: new Date().toISOString(),
      };
      
      // Update Firestore
      const userRef = doc(firestore, 'users', authUser.uid);
      await setDoc(userRef, { 
        displayName: updatedUserData.name,
        nickname: updatedUserData.nickname,
        bio: updatedUserData.bio,
        location: updatedUserData.location,
        photoURL: newAvatarUrl,
        updatedAt: serverTimestamp(),
       }, { merge: true });

      // Update Firebase Auth profile
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: updatedUserData.name,
          photoURL: newAvatarUrl,
        });
      }
      
      onSave(updatedUserData as UserData);
      toast({ title: "Профиль обновлен", description: "Ваши изменения были сохранены." });
      setIsOpen(false);

    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Ошибка сохранения', description: e.message });
    }
  };
  
  const isSaving = form.formState.isSubmitting || uploading;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Редактировать профиль</DialogTitle>
          <DialogDescription>
            Внесите изменения в свой профиль. Нажмите "Сохранить", когда закончите.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarPreview} alt={form.getValues('name')} />
                <AvatarFallback>{form.getValues('name')?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="picture">Аватар</Label>
                <Input id="picture" type="file" onChange={handleAvatarSelect} accept="image/*" disabled={isSaving} />
              </div>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Имя</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isSaving} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Псевдоним (ник)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ваш уникальный ник" {...field} disabled={isSaving} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Местоположение</FormLabel>
                  <FormControl>
                    <Input placeholder="Город, Страна" {...field} disabled={isSaving} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>О себе</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Расскажите о себе..." {...field} disabled={isSaving} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSaving}>Отмена</Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {uploading ? `Загрузка... ${progress}%` : 'Сохранить'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
