
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
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
import { Settings, User, LogOut, CarFront, Menu, Shield, PlusSquare } from 'lucide-react';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useSidebar } from './ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/hooks/useUserProfile';
import { ThemeToggle } from './ThemeToggle';
import { Notifications } from './Notifications';
import { Skeleton } from './ui/skeleton';


export function Header() {
  const { user: authUser, isUserLoading } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  const { toggleSidebar } = useSidebar();
  const [isScrolled, setIsScrolled] = useState(false);

  const { profile, isLoading: isProfileLoading } = useUserProfile(authUser?.uid);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isLoading = isUserLoading || isProfileLoading;

  const userAvatar = profile?.photoURL || authUser?.photoURL;
  const userName = profile?.name || authUser?.displayName || authUser?.email;


  const handleLogout = () => {
    if (auth) {
      signOut(auth).then(() => {
        document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        toast({ title: 'Вы вышли из системы.' });
      });
    }
  };
  
  const navLinks = [
    { href: '/', label: 'Лента' },
    { href: '/garage', label: 'Гаражи' },
    { href: '/communities', label: 'Сообщества' },
    { href: '/marketplace', label: 'Маркет' },
    { href: '/events', label: 'События' },
  ];

  return (
    <header className={cn(
      "sticky top-0 z-30 w-full h-18 border-b transition-colors duration-300",
      isScrolled ? "border-white/10 bg-black/20 backdrop-blur-lg" : "border-transparent"
    )}>
      <div className="container flex items-center max-w-7xl mx-auto px-4">
        {/* Mobile Menu Trigger */}
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden mr-2">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Sidebar</span>
        </Button>
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mr-6">
            <CarFront className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl hidden sm:inline-block">AutoSphere</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
                <Link key={link.label} href={link.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                </Link>
            ))}
        </nav>

        <div className="flex-1" />

        {/* Right side actions */}
        <div className="flex items-center justify-end space-x-2">
          <ThemeToggle />
          {isLoading ? (
             <Skeleton className="h-10 w-24" />
          ) : authUser ? (
            <>
              <Button asChild className="hidden sm:flex bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                <Link href="/posts/create">
                  <PlusSquare className="h-4 w-4 mr-2"/>
                  Создать пост
                </Link>
              </Button>
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
                   {profile?.roles?.isAdmin && (
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
