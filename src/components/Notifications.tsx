
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Bell, Loader2 } from 'lucide-react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  updateDoc,
  doc,
  FirestoreError,
} from 'firebase/firestore';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import type { Notification } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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
          {notification.createdAt?.toDate().toLocaleString('ru-RU')}
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

  // Memoize the query to prevent re-renders and conform to security rules
  const notificationsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    // This query now includes the 'where' clause required by security rules
    return query(
        collection(firestore, 'notifications'),
        where('recipientId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(20)
    );
  }, [user, firestore]);

  useEffect(() => {
    if (!notificationsQuery) {
      setLoading(false);
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      notificationsQuery,
      (snapshot) => {
        const notifs = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Notification)
        );
        setNotifications(notifs);
        setUnreadCount(notifs.filter((n) => !n.read).length);
        setLoading(false);
      },
      (error: FirestoreError) => {
        if (error.code === 'permission-denied') {
            const contextualError = new FirestorePermissionError({
                operation: 'list',
                path: `notifications`
            });
            errorEmitter.emit('permission-error', contextualError);
        } else if (error.code === 'failed-precondition') {
             console.warn(
              'Firestore query for notifications failed. This is likely because a composite index is still building. ' +
              'This warning is expected after changing security rules and should resolve itself in a few minutes. ' +
              'Original error: ', error
            );
        } else {
           console.error("Error fetching notifications:", error);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [notificationsQuery]);

  const handleMarkAsRead = (notificationId: string) => {
    if (!firestore) return;
    const notifRef = doc(firestore, 'notifications', notificationId);
    updateDoc(notifRef, { read: true }).catch(error => {
      const contextualError = new FirestorePermissionError({
        operation: 'update',
        path: notifRef.path,
        requestResourceData: { read: true }
      });
      errorEmitter.emit('permission-error', contextualError);
    });
  };
  
  const handleMarkAllAsRead = async () => {
      if (!firestore || !user) return;
      
      const unreadNotifications = notifications.filter(n => !n.read);
      
      const promises = unreadNotifications.map(n => {
          const notifRef = doc(firestore, 'notifications', n.id);
          return updateDoc(notifRef, { read: true }).catch(error => {
            const contextualError = new FirestorePermissionError({
              operation: 'update',
              path: notifRef.path,
              requestResourceData: { read: true }
            });
            errorEmitter.emit('permission-error', contextualError);
          });
      });

      try {
          await Promise.all(promises);
      } catch (error) {
          // Errors are already being emitted inside the catch blocks above
      }
  }

  return (
    <Popover>
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
