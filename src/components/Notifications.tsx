
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Bell, Loader2 } from 'lucide-react';
import {
  doc,
  updateDoc,
  writeBatch
} from 'firebase/firestore';
import { useUser, useFirestore } from '@/firebase';
import type { Notification } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';

function formatDate(timestamp: any): string {
    if (!timestamp) return '';
    // Handle client-side Timestamp object with .toDate() method
    if (typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toLocaleString('ru-RU');
    }
    // Handle ISO string or other date string from API
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return ''; // Invalid date string
    }
    return date.toLocaleString('ru-RU');
}

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
     <div
      className={`flex items-start gap-4 p-3 hover:bg-accent ${
        !notification.read ? 'bg-primary/5' : ''
      }`}
      onClick={handleClick}
    >
      <Avatar className="h-10 w-10 mt-1">
        <AvatarImage src={notification.senderData?.photoURL} />
        <AvatarFallback>
          {notification.senderData?.displayName?.[0] || '?'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="font-semibold">{notification.senderData?.displayName || notification.title}</p>
        <p className="text-sm text-muted-foreground">{notification.message}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDate(notification.createdAt)}
        </p>
      </div>
    </div>
  )

  return notification.actionURL ? (
    <Link href={notification.actionURL}>
        {content}
    </Link>
  ) : content;
}

export function Notifications() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
        setLoading(false);
        return;
    };
    
    setLoading(true);
    try {
        const token = await user.getIdToken();
        const response = await fetch('/api/notifications', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch notifications');
        }

        const data: Notification[] = await response.json();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);

    } catch (error) {
        console.error("Error fetching notifications via API:", error);
    } finally {
        setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Poll every 60 seconds
        return () => clearInterval(interval);
    } else {
        setLoading(false);
        setNotifications([]);
        setUnreadCount(0);
    }
  }, [user, fetchNotifications]);
  

  const handleMarkAsRead = (notificationId: string) => {
    if (!firestore || !user) return;
    const notifRef = doc(firestore, 'notifications', notificationId);
    updateDoc(notifRef, { read: true }).then(() => {
        // Optimistically update UI
        setNotifications(prev => prev.map(n => n.id === notificationId ? {...n, read: true} : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    }).catch(console.error);
  };
  
  const handleMarkAllAsRead = async () => {
      if (!firestore || !user) return;
      
      const unreadNotifications = notifications.filter(n => !n.read);
      if (unreadNotifications.length === 0) return;

      const batch = writeBatch(firestore);
      unreadNotifications.forEach(n => {
          const notifRef = doc(firestore, 'notifications', n.id);
          batch.update(notifRef, { read: true });
      });

      try {
          await batch.commit();
          // Optimistically update UI
          setNotifications(prev => prev.map(n => ({...n, read: true})));
          setUnreadCount(0);
      } catch (error) {
          console.error("Error marking all as read:", error);
      }
  }

  return (
    <Popover onOpenChange={(open) => open && fetchNotifications()}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4">
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-xs items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between p-3 border-b">
            <CardTitle className="text-lg">Уведомления</CardTitle>
            {unreadCount > 0 && <Button variant="link" size="sm" className="p-0 h-auto" onClick={handleMarkAllAsRead}>Отметить все как прочитанные</Button>}
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {loading ? (
                 <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin" />
                 </div>
              ) : notifications.length === 0 ? (
                <div className="text-center text-muted-foreground py-16">
                  <p>Нет новых уведомлений</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((n) => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      onRead={handleMarkAsRead}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
          <CardFooter className="p-2 border-t">
              <Button variant="ghost" className="w-full" asChild>
                  <Link href="/settings?tab=notifications">Настройки уведомлений</Link>
              </Button>
          </CardFooter>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
