
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Settings, User, LogOut, CarFront, Menu } from 'lucide-react';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { users } from '@/lib/data';
import { SidebarTrigger, useSidebar } from './ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function Header() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  const { toggleSidebar } = useSidebar();


  const currentUser = user ? users.find(u => u.id === user.uid) || users.find(u => u.id === '1') : null;
  const userAvatar = currentUser ? PlaceHolderImages.find(img => img.id === currentUser.avatarId) : null;

  const handleLogout = () => {
    if (auth) {
      signOut(auth).then(() => {
        toast({ title: 'Вы вышли из системы.' });
      });
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex items-center space-x-2 md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          {isUserLoading ? (
             <div className="h-8 w-20 bg-muted rounded-md animate-pulse" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="User Avatar" data-ai-hint={userAvatar.imageHint} />}
                    <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {currentUser?.name || user.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/profile/${user.uid}`}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Профиль</span>
                  </Link>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                  <Link href="/garage">
                    <CarFront className="mr-2 h-4 w-4" />
                    <span>Гараж</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Настройки</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Выйти</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link href="/auth">Войти</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
