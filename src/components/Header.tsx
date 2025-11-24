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
import { CarFront, Home, BookOpen, Users, ShoppingCart, Wrench, Calendar, CheckSquare, Radio, Settings, User, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { auth } from '@/lib/firebase/client';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { users } from '@/lib/data';

const navLinks = [
  { href: '/', label: 'Главная', icon: Home },
  { href: '/journals', label: 'Журналы', icon: BookOpen },
  { href: '/communities', label: 'Сообщества', icon: Users },
  { href: '/marketplace', label: 'Маркетплейс', icon: ShoppingCart },
  { href: '/workshops', label: 'Мастерские', icon: Wrench },
  { href: '/events', label: 'События', icon: Calendar },
  { href: '/voting', label: 'Голосование', icon: CheckSquare },
  { href: '/news', label: 'Автоновости', icon: Radio },
];

export function Header() {
  const { user, loading } = useAuth();

  // Demo data for logged in user's avatar
  const currentUser = user ? users.find(u => u.id === user.uid) || users.find(u => u.id === '1') : null;
  const userAvatar = currentUser ? PlaceHolderImages.find(img => img.id === currentUser.avatarId) : null;


  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <CarFront className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">AutoSphere</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-4 text-sm font-medium">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="flex items-center transition-colors hover:text-primary">
              <link.icon className="mr-2 h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          {loading ? (
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
