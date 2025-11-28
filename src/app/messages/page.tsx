
'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';

// Интерфейс диалога
interface Dialog {
  id: string;
  participantIds: string[];
  lastMessageText?: string;
  lastMessageAt?: any;
}

// Интерфейс пользователя для отображения
interface ParticipantProfile {
    id: string;
    name: string;
    photoURL?: string;
}

// Компонент одного диалога
function DialogItem({ dialog, currentUser }: { dialog: Dialog, currentUser: any }) {
    const otherUserId = dialog.participantIds.find(id => id !== currentUser.uid);
    const { profile: otherUser, isLoading } = useUserProfile(otherUserId);

    const formatDate = (timestamp: any) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return new Intl.DateTimeFormat('ru-RU', {
            hour: '2-digit', minute: '2-digit'
        }).format(date);
    };

    if(isLoading) {
        return (
             <div className="flex items-center gap-4 p-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                </div>
            </div>
        )
    }

    if (!otherUser) return null;

    return (
        <Link href={`/messages/${dialog.id}`} className="block">
            <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors">
                <Avatar className="h-12 w-12">
                    {otherUser.photoURL && <AvatarImage src={otherUser.photoURL} alt={otherUser.name} />}
                    <AvatarFallback>{otherUser.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <p className="font-semibold">{otherUser.name}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(dialog.lastMessageAt)}</p>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                        {dialog.lastMessageText || 'Нет сообщений'}
                    </p>
                </div>
            </div>
        </Link>
    );
}


export default function MessagesPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [dialogs, setDialogs] = useState<Dialog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !firestore) return;

    setLoading(true);
    const q = query(
      collection(firestore, 'dialogs'),
      where('participantIds', 'array-contains', user.uid),
      orderBy('lastMessageAt', 'desc')
    );

    getDocs(q).then(snapshot => {
      const dialogsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Dialog));
      setDialogs(dialogsData);
      setLoading(false);
    }).catch(err => {
        console.error("Error fetching dialogs:", err);
        setLoading(false);
    });

  }, [user, firestore]);

  if (loading) {
     return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Сообщения</h1>
            <Card>
                <CardContent className="p-4 space-y-2">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-3">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-48" />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
     );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Сообщения</h1>
      <Card>
        <CardContent className="p-2">
          {dialogs.length === 0 ? (
             <div className="text-center py-16">
                <MessageSquare className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Нет диалогов</h3>
                <p className="text-muted-foreground">
                    Начните общение с другими пользователями.
                </p>
             </div>
          ) : (
            <div className="divide-y">
                {dialogs.map(dialog => (
                    <DialogItem key={dialog.id} dialog={dialog} currentUser={user} />
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
