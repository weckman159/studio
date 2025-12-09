'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusSquare, Heart, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

export function MobileNav() {
  const pathname = usePathname();
  const { user } = useUser();

  if (pathname === '/auth') return null;

  const isActive = (path: string) => pathname === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border/50 z-50 pb-4 pt-1">
      <div className="flex justify-around items-center h-16 px-2">
        <Link href="/" className={cn("p-3 rounded-full transition-colors", isActive('/') ? "text-primary" : "text-muted-foreground")}>
          <Home className="h-6 w-6" strokeWidth={isActive('/') ? 2.5 : 2} />
        </Link>
        
        <Link href="/search" className={cn("p-3 rounded-full transition-colors", isActive('/search') ? "text-primary" : "text-muted-foreground")}>
          <Search className="h-6 w-6" strokeWidth={isActive('/search') ? 2.5 : 2} />
        </Link>

        <Link href="/posts/create" className="p-3">
          <PlusSquare className="h-7 w-7 text-foreground" strokeWidth={2} />
        </Link>

        <Link href="/car-of-the-day" className={cn("p-3 rounded-full transition-colors", isActive('/car-of-the-day') ? "text-primary" : "text-muted-foreground")}>
           <Heart className="h-6 w-6" strokeWidth={isActive('/car-of-the-day') ? 2.5 : 2} />
        </Link>

        <Link href={user ? `/profile/${user.uid}` : '/auth'} className="p-3">
           {user ? (
               <Avatar className={cn("h-7 w-7 border-2", isActive(`/profile/${user.uid}`) ? "border-primary" : "border-transparent")}>
                   <AvatarImage src={user.photoURL || undefined} />
                   <AvatarFallback className="text-[10px]">{user.displayName?.[0]}</AvatarFallback>
               </Avatar>
           ) : (
               <User className="h-6 w-6 text-muted-foreground" />
           )}
        </Link>
      </div>
    </div>
  );
}
