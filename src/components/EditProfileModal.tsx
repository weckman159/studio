
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import type { User, Car } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Checkbox } from './ui/checkbox';
import { ScrollArea } from './ui/scroll-area';

interface EditProfileModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  user: User;
  userCars: Car[];
  onSave: (updatedUser: User) => void;
}

export function EditProfileModal({ isOpen, setIsOpen, user, userCars, onSave }: EditProfileModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState(user.name);
  const [nickname, setNickname] = useState(user.nickname || '');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [currentCarIds, setCurrentCarIds] = useState<string[]>(user.currentCarIds || []);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setNickname(user.nickname || '');
      const userAvatar = PlaceHolderImages.find(img => img.id === user.avatarId);
      setAvatarUrl(userAvatar?.imageUrl || '');
      setCurrentCarIds(user.currentCarIds || []);
    }
  }, [user, isOpen]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarUrl(URL.createObjectURL(file));
    }
  };
  
  const handleCarSelection = (carId: string) => {
    setCurrentCarIds(prev => 
      prev.includes(carId) 
        ? prev.filter(id => id !== carId) 
        : [...prev, carId]
    );
  };
  
  const handleSaveChanges = () => {
    const updatedUser: User = {
        ...user,
        name,
        nickname,
        currentCarIds,
    };
    
    onSave(updatedUser);
    toast({ title: "Профиль обновлен", description: "Ваши изменения были сохранены." });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Редактировать профиль</DialogTitle>
          <DialogDescription>
            Внесите изменения в свой профиль. Нажмите "Сохранить", когда закончите.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
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
          <div className="space-y-2">
            <Label htmlFor="name">Имя</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nickname">Псевдоним (ник)</Label>
            <Input id="nickname" value={nickname} onChange={e => setNickname(e.target.value)} placeholder="Ваш никнейм" />
          </div>
          <div className="space-y-2">
            <Label>Мое текущее авто</Label>
            <ScrollArea className="h-32 w-full rounded-md border p-4">
              <div className="space-y-2">
                {userCars && userCars.length > 0 ? (
                  userCars.map(car => (
                    <div key={car.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`car-${car.id}`}
                        checked={currentCarIds.includes(car.id)}
                        onCheckedChange={() => handleCarSelection(car.id)}
                      />
                      <Label htmlFor={`car-${car.id}`} className="font-normal">{car.brand} {car.model}</Label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">В вашем гараже нет автомобилей.</p>
                )}
              </div>
            </ScrollArea>
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
