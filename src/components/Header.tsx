

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
import { users } from '@/lib/data';
import { SidebarTrigger, useSidebar } from './ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import GlobalSearch from './GlobalSearch';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { User as UserData } from '@/lib/data';


export function Header() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { toggleSidebar } = useSidebar();
  const [profile, setProfile] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
        if (user && firestore) {
            try {
                const docRef = doc(firestore, 'users', user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setProfile({ id: docSnap.id, ...docSnap.data() } as UserData);
                } else {
                    // Fallback to mock data if not in Firestore (for demo purposes)
                    const mockUser = users.find(u => u.id === user.uid);
                    setProfile(mockUser || null);
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
                // Fallback to mock data on error
                const mockUser = users.find(u => u.id === user.uid);
                setProfile(mockUser || null);
            }
        } else {
            setProfile(null);
        }
    };
    fetchProfile();
  }, [user, firestore]);

  const userAvatar = profile?.photoURL || user?.photoURL;
  const userName = profile?.name || user?.displayName || user?.email;


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
        <div className="flex items-center justify-end space-x-4">
          <GlobalSearch />
          {isUserLoading ? (
             <div className="h-8 w-20 bg-muted rounded-md animate-pulse" />
          ) : user && user.uid ? (
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

    