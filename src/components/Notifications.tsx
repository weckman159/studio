// src/components/Notifications.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Bell, Loader2 } from 'lucide-react';
import { doc, updateDoc, writeBatch, collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useUser, useFirestore } from '@/firebase';
import type { Notification } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { markNotificationAsRead } from '@/app/lib/actions/notifications';
import { cn } from '@/lib/utils';

// Форматирование даты
function formatDate(timestamp: any): string {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  if (isNaN(date.getTime())) return '';
  
  const diffDays = Math.round((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 1) {
      return new Intl.RelativeTimeFormat('ru', { numeric: 'auto' }).format(0, 'day');
  }

  return new Intl.RelativeTimeFormat('ru', { numeric: 'auto' }).format(-diffDays, 'day');
}

// Компонент одного уведомления
function NotificationItem({
  notification,
  onRead,
}: {
  notification: Notification;
  onRead: (id: string) => void;
}) {
  const handleClick = () => {
    if (!notification.read) {
      onRead(notification.id);
    }
  };

  const content = (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex items-start gap-4 p-3 hover:bg-white/5 transition-colors",
        !notification.read && "bg-primary/10"
      )}
      onClick={handleClick}
    >
      <Avatar className="h-10 w-10 mt-1">
        <AvatarImage src={notification.senderData?.photoURL} />
        <AvatarFallback>
          {notification.senderData?.displayName?.[0] || '?'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="font-semibold text-sm">{notification.senderData?.displayName || notification.title}</p>
        <p className="text-xs text-muted-foreground">{notification.message}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDate(notification.createdAt)}
        </p>
      </div>
       {!notification.read && <div className="w-2 h-2 rounded-full bg-primary self-center shrink-0" />}
    </motion.div>
  );

  return notification.actionURL ? <Link href={notification.actionURL}>{content}</Link> : <div className="cursor-pointer">{content}</div>;
}

// Основной компонент
export function Notifications() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Real-time подписка на уведомления
  useEffect(() => {
    if (!user || !firestore) {
      setLoading(false);
      setNotifications([]);
      return;
    }

    setLoading(true);
    const q = query(
      collection(firestore, 'notifications'),
      where('recipientId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const data: Notification[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Notification));
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
        setLoading(false);
      },
      (error) => {
        console.error("Real-time notifications error:", error);
        toast({ variant: 'destructive', title: 'Ошибка', description: 'Не удалось загрузить уведомления.' });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, firestore, toast]);

  // Вызов Server Action для отметки о прочтении
  const handleMarkAsRead = async (notificationId: string) => {
    // Optimistic UI: отмечаем прочитанным локально, не дожидаясь ответа сервера
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));

    const result = await markNotificationAsRead(notificationId);
    if (!result.success) {
      toast({ variant: 'destructive', title: 'Ошибка', description: result.error });
      // Rollback optimistic update on failure
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: false } : n));
      setUnreadCount(prev => prev + 1);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!firestore) return;
    const unread = notifications.filter(n => !n.read);
    if (unread.length === 0) return;

    const batch = writeBatch(firestore);
    unread.forEach(n => batch.update(doc(firestore, 'notifications', n.id), { read: true }));
    
    try {
      await batch.commit();
      // onSnapshot обновит UI автоматически
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4">
              <span className="relative inline-flex rounded-full h-4 w-4 bg-primary text-primary-foreground text-xs items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 border-white/10 bg-black/50 backdrop-blur-xl" align="end">
        <Card className="border-0 shadow-none bg-transparent text-white">
          <CardHeader className="flex flex-row items-center justify-between p-3 border-b border-white/10">
            <CardTitle className="text-lg">Уведомления</CardTitle>
            {unreadCount > 0 && <Button variant="link" size="sm" className="p-0 h-auto text-primary" onClick={handleMarkAllAsRead}>Прочитать все</Button>}
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {loading ? (
                <div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : notifications.length === 0 ? (
                <div className="text-center text-muted-foreground py-16"><p>Нет новых уведомлений</p></div>
              ) : (
                <div className="divide-y divide-white/10">
                  <AnimatePresence>
                    {notifications.map((n) => <NotificationItem key={n.id} notification={n} onRead={handleMarkAsRead} />)}
                  </AnimatePresence>
                </div>
              )}
            </ScrollArea>
          </CardContent>
          <CardFooter className="p-2 border-t border-white/10">
            <Button variant="ghost" className="w-full" asChild>
              <Link href="/settings?tab=notifications">Настройки</Link>
            </Button>
          </CardFooter>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
