
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface EditProfileModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  user: User;
  onSave: (updatedUser: User) => void;
}

export function EditProfileModal({ isOpen, setIsOpen, user, onSave }: EditProfileModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setBio(user.bio);
      const userAvatar = PlaceHolderImages.find(img => img.id === user.avatarId);
      setAvatarUrl(userAvatar?.imageUrl || '');
    }
  }, [user, isOpen]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarUrl(URL.createObjectURL(file));
    }
  };
  
  const handleSaveChanges = () => {
    // In a real app, you'd handle file upload to a storage service (like Firebase Storage)
    // and get a new URL. For this mock, we'll just use the local object URL if a new file was selected.
    
    // Also, you'd update the user document in Firestore. Here we just update the local state.
    const updatedUser = {
        ...user,
        name,
        bio,
        // The avatarId would be updated with a real ID after upload.
        // For now, we're not changing it.
    };
    
    // We are not actually changing the image in the mock data, just displaying the preview.
    onSave(updatedUser);
    toast({ title: "Профиль обновлен", description: "Ваши изменения были сохранены." });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Редактировать профиль</DialogTitle>
          <DialogDescription>
            Внесите изменения в свой профиль. Нажмите "Сохранить", когда закончите.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
                <AvatarImage src={avatarUrl} alt={name} />
                <AvatarFallback>{name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="picture">Аватар</Label>
                <Input id="picture" type="file" onChange={handleAvatarChange} accept="image/*" />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Имя
            </Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="bio" className="text-right">
              О себе
            </Label>
            <Textarea id="bio" value={bio} onChange={e => setBio(e.target.value)} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Отмена</Button>
          <Button onClick={handleSaveChanges}>Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
