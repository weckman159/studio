
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';

interface UserListDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
  users: User[];
}

function UserItem({ user }: { user: User }) {
  const userAvatar = PlaceHolderImages.find(p => p.id === user.avatarId);

  return (
    <div className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-md">
      <Link href={`/profile/${user.id}`} className="flex items-center space-x-4">
        <Avatar>
          {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt={user.name} data-ai-hint={userAvatar.imageHint} />}
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{user.name}</p>
          <p className="text-sm text-muted-foreground">@{user.nickname}</p>
        </div>
      </Link>
      <Button variant="outline" size="sm">Подписаться</Button>
    </div>
  );
}


export function UserListDialog({ isOpen, onOpenChange, title, users }: UserListDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Список пользователей, которые {title.toLowerCase().endsWith('и') ? 'подписаны на этого пользователя.' : 'на которых подписан этот пользователь.'}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] -mx-6">
          <div className="px-6 divide-y">
            {users.map(user => (
              <UserItem key={user.id} user={user} />
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
