
// src/app/messages/[id]/page.tsx
// Диалог 1:1, список сообщений, отправка, auto-scroll

'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserProfile } from '@/hooks/useUserProfile';
import Link from 'next/link';

interface Message {
    id: string;
    dialogId: string;
    authorId: string;
    text: string;
    createdAt: any;
}

function DialogClient({ dialogId }: { dialogId: string }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!firestore || !dialogId) return;

    setLoading(true);
    const q = query(
      collection(firestore, 'messages'),
      where('dialogId', '==', dialogId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Message));
      setMessages(msgs);
      setLoading(false);
      setTimeout(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
      }, 100);
    }, (error) => {
        console.error("Error fetching messages:", error);
        setLoading(false);
    });

    return () => unsubscribe();

  }, [dialogId, firestore]);

  const sendMessage = async () => {
    if (!input.trim() || !user || !firestore) return;
    const messageText = input;
    setInput('');

    try {
        await addDoc(collection(firestore, 'messages'), {
            dialogId: dialogId,
            authorId: user.uid,
            text: messageText,
            createdAt: serverTimestamp()
        });

        // Update dialog's last message
        const dialogRef = doc(firestore, 'dialogs', dialogId);
        await updateDoc(dialogRef, {
            lastMessageText: messageText,
            lastMessageAt: serverTimestamp()
        });

    } catch (error) {
        console.error("Error sending message:", error);
        // Optionally revert UI or show an error
        setInput(messageText);
    }
  };

  return (
    <div className="mx-auto px-4 py-8 max-w-2xl flex flex-col h-[calc(100vh-12rem)]">
      <h1 className="text-2xl font-bold mb-4">Диалог</h1>
      <div ref={listRef} className="flex-1 overflow-y-auto mb-4 space-y-4 bg-muted/50 rounded-lg p-4">
        {loading ? (
            <div className="space-y-4">
                <div className="flex justify-start items-end gap-2"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-12 w-3/4 rounded-lg" /></div>
                <div className="flex justify-end items-end gap-2"><Skeleton className="h-12 w-1/2 rounded-lg" /><Skeleton className="h-10 w-10 rounded-full" /></div>
                <div className="flex justify-start items-end gap-2"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-16 w-2/3 rounded-lg" /></div>
            </div>
        ) : messages.map(msg => (
          <div key={msg.id} className={`flex items-end gap-2 ${msg.authorId === user?.uid ? 'justify-end' : 'justify-start'}`}>
            {msg.authorId !== user?.uid && (
                <Avatar className="h-8 w-8">
                    <AvatarImage />
                    <AvatarFallback>O</AvatarFallback>
                </Avatar>
            )}
            <Card className={`max-w-xs md:max-w-md ${msg.authorId === user?.uid ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
              <CardContent className="p-3">
                <p>{msg.text}</p>
              </CardContent>
            </Card>
             {msg.authorId === user?.uid && user.photoURL && (
                <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || undefined}/>
                    <AvatarFallback>{user.displayName?.[0] || 'Я'}</AvatarFallback>
                </Avatar>
            )}
          </div>
        ))}
      </div>
      <form
        className="flex gap-3"
        onSubmit={e => {
          e.preventDefault();
          sendMessage();
        }}>
        <Input
          placeholder="Напишите сообщение…"
          value={input}
          maxLength={400}
          onChange={e => setInput(e.target.value)}
          disabled={!user}
        />
        <Button type="submit" disabled={!input.trim() || !user}>
            <Send className="h-4 w-4"/>
        </Button>
      </form>
    </div>
  );
}

export default async function DialogPage({ params }: { params: { id: string } }) {
    const { id } = params;
    return <DialogClient dialogId={id} />
}
