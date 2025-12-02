'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusSquare, Heart, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';

export function MobileNav() {
  const pathname = usePathname();
  const { user } = useUser();

  // Скрываем на десктопе и на странице авторизации
  if (pathname === '/auth') return null;

  const isActive = (path: string) => pathname === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-50 pb-safe">
      <div className="flex justify-around items-center h-14">
        <Link href="/" className={cn("p-2", isActive('/') ? "text-primary" : "text-muted-foreground")}>
          <Home className="h-6 w-6" />
        </Link>
        
        <Link href="/search" className={cn("p-2", isActive('/search') ? "text-primary" : "text-muted-foreground")}>
          <Search className="h-6 w-6" />
        </Link>

        <Link href="/posts/create" className="p-2">
          <PlusSquare className="h-7 w-7 text-primary" />
        </Link>

        <Link href="/car-of-the-day" className={cn("p-2", isActive('/car-of-the-day') ? "text-primary" : "text-muted-foreground")}>
           <Heart className="h-6 w-6" />
        </Link>

        <Link href={user ? `/profile/${user.uid}` : '/auth'} className={cn("p-2", isActive(user ? `/profile/${user.uid}` : '/auth') ? "text-primary" : "text-muted-foreground")}>
           <User className="h-6 w-6" />
        </Link>
      </div>
    </div>
  );
}
