
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
import Link from 'next/link';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Skeleton } from './ui/skeleton';

interface UserListDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
  userIds: string[];
}

function UserItem({ userId }: { userId: string }) {
  const { profile, isLoading } = useUserProfile(userId);

  if (isLoading) {
    return (
        <div className="flex items-center space-x-4 p-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-3 w-[100px]" />
            </div>
        </div>
    )
  }

  if (!profile) return null;

  return (
    <div className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-md">
      <Link href={`/profile/${profile.id}`} className="flex items-center space-x-4">
        <Avatar>
          {profile.photoURL && <AvatarImage src={profile.photoURL} alt={profile.name} />}
          <AvatarFallback>{profile.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{profile.name}</p>
          {profile.nickname && <p className="text-sm text-muted-foreground">@{profile.nickname}</p>}
        </div>
      </Link>
      <Button variant="outline" size="sm">Подписаться</Button>
    </div>
  );
}


export function UserListDialog({ isOpen, onOpenChange, title, userIds }: UserListDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title} ({userIds.length})</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] -mx-6">
          <div className="px-6 divide-y">
            {userIds.map(userId => (
              <UserItem key={userId} userId={userId} />
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
