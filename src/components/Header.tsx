
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
import { Settings, User, LogOut, CarFront, Menu, Shield } from 'lucide-react';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { SidebarTrigger, useSidebar } from './ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import GlobalSearch from './GlobalSearch';
import { useUserProfile } from '@/hooks/useUserProfile';
import { ThemeToggle } from './ThemeToggle';
import { Notifications } from './Notifications';
import { Skeleton } from './ui/skeleton';


export function Header() {
  const { user: authUser, isUserLoading } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  const { toggleSidebar } = useSidebar();
  
  // Use the centralized hook to get the profile of the currently authenticated user
  const { profile, isLoading: isProfileLoading } = useUserProfile(authUser?.uid);

  const isLoading = isUserLoading || isProfileLoading;

  const userAvatar = profile?.photoURL || authUser?.photoURL;
  const userName = profile?.name || authUser?.displayName || authUser?.email;


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
        <div className="flex-1" />
        <div className="flex items-center justify-end space-x-2">
          <GlobalSearch />
          <ThemeToggle />
          {isLoading ? (
             <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-20 rounded-md" />
             </div>
          ) : authUser ? (
            <>
              <Notifications />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      {userAvatar && <AvatarImage src={userAvatar} alt="User Avatar" />}
                      <AvatarFallback>{userName?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {userName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {authUser.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {authUser.uid && (
                      <DropdownMenuItem asChild>
                          <Link href={`/profile/${authUser.uid}`}>
                              <User className="mr-2 h-4 w-4" />
                              <span>Профиль</span>
                          </Link>
                      </DropdownMenuItem>
                  )}
                   <DropdownMenuItem asChild>
                    <Link href="/garage">
                      <CarFront className="mr-2 h-4 w-4" />
                      <span>Гараж</span>
                    </Link>
                  </DropdownMenuItem>
                   {profile?.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Админка</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
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
            </>
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
