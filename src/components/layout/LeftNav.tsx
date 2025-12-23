
// src/components/layout/LeftNav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, Car, Users, Rss, Store, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';

const navItems = [
  { href: '/', label: 'Лента', icon: Sparkles },
  { href: '/garage', label: 'Гараж', icon: Car },
  { href: '/communities', label: 'Сообщества', icon: Users },
  { href: '/posts', label: 'Блоги', icon: Rss },
  { href: '/marketplace', label: 'Маркет', icon: Store },
  { href: '/messages', label: 'Чат', icon: MessageSquare, badgeKey: 'messages' },
];

export function LeftNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const firestore = useFirestore();
  const [unreadCounts, setUnreadCounts] = useState({ messages: 0 });

  useEffect(() => {
    if (!user || !firestore) {
      setUnreadCounts({ messages: 0 });
      return;
    }

    const q = query(
      collection(firestore, 'dialogs'),
      where('participantIds', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let totalUnread = 0;
      snapshot.forEach(doc => {
        const dialog = doc.data();
        totalUnread += dialog.unreadCount?.[user.uid] || 0;
      });
      setUnreadCounts(prev => ({ ...prev, messages: totalUnread }));
    });

    return () => unsubscribe();
  }, [user, firestore]);

  return (
    <nav className="flex flex-col gap-2 p-4">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const badgeCount = item.badgeKey ? unreadCounts[item.badgeKey as keyof typeof unreadCounts] : 0;

        return (
          <Link 
            key={item.href} 
            href={item.href}
            className={cn(
              "group relative flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300",
              isActive 
                ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(10,170,255,0.1)]" 
                : "text-muted-foreground hover:text-white hover:bg-white/5 border border-transparent"
            )}
          >
            {isActive && (
              <motion.div 
                layoutId="nav-active"
                className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              />
            )}

            <item.icon className={cn(
              "h-5 w-5 transition-transform duration-300",
              isActive ? "scale-110" : "group-hover:scale-110"
            )} />
            
            <span className="text-sm font-bold tracking-wide uppercase">{item.label}</span>

            {badgeCount > 0 && (
              <span className="ml-auto flex items-center justify-center h-5 min-w-[1.25rem] rounded-full bg-secondary text-secondary-foreground text-xs px-1.5 shadow-[0_0_8px_#f43f5e]">
                {badgeCount > 9 ? '9+' : badgeCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

    