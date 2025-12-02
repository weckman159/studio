'use client';

import { useState, useEffect, useRef } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, getDoc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Send, ArrowLeft, MoreVertical } from 'lucide-react';
import Link from 'next/link';

export default function DialogClient({ params }: { params: { id: string } }) {
  const { id: dialogId } = params;
  const { user } = useUser();
  const firestore = useFirestore();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [partner, setPartner] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Загрузка собеседника
  useEffect(() => {
      if (!firestore || !dialogId || !user) return;
      getDoc(doc(firestore, 'dialogs', dialogId)).then(async (snap) => {
          if (snap.exists()) {
              const data = snap.data();
              const partnerId = data.participantIds.find((id: string) => id !== user.uid);
              if (partnerId) {
                  const userSnap = await getDoc(doc(firestore, 'users', partnerId));
                  if (userSnap.exists()) setPartner(userSnap.data());
              }
          }
      });
  }, [firestore, dialogId, user]);

  // Подписка на сообщения
  useEffect(() => {
    if (!firestore || !dialogId) return;
    const q = query(collection(firestore, 'messages'), where('dialogId', '==', dialogId), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    return () => unsub();
  }, [dialogId, firestore]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;
    const text = input;
    setInput('');
    
    await addDoc(collection(firestore, 'messages'), {
        dialogId,
        authorId: user.uid,
        text,
        createdAt: serverTimestamp()
    });
    
    await updateDoc(doc(firestore, 'dialogs', dialogId), {
        lastMessageText: text,
        lastMessageAt: serverTimestamp()
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] md:h-[calc(100vh-100px)] max-w-2xl mx-auto bg-background border-x">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-background/95 backdrop-blur sticky top-0 z-10">
          <div className="flex items-center gap-3">
              <Link href="/messages"><Button variant="ghost" size="icon"><ArrowLeft /></Button></Link>
              <Avatar className="h-10 w-10">
                  <AvatarImage src={partner?.photoURL} />
                  <AvatarFallback>{partner?.displayName?.[0]}</AvatarFallback>
              </Avatar>
              <div className="leading-tight">
                  <div className="font-bold text-sm">{partner?.displayName || 'Чат'}</div>
                  <div className="text-xs text-muted-foreground">в сети недавно</div>
              </div>
          </div>
          <Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5"/></Button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/10">
          {messages.map((msg) => {
              const isMe = msg.authorId === user?.uid;
              return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                          isMe 
                          ? 'bg-primary text-primary-foreground rounded-br-none' 
                          : 'bg-muted/80 rounded-bl-none'
                      }`}>
                          {msg.text}
                          <div className={`text-[10px] mt-1 text-right opacity-70 ${isMe ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                              {msg.createdAt?.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                      </div>
                  </div>
              );
          })}
          <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={sendMessage} className="p-3 border-t flex gap-2 bg-background">
          <Input 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              placeholder="Сообщение..." 
              className="flex-1 rounded-full bg-muted border-0 focus-visible:ring-1"
          />
          <Button type="submit" size="icon" rounded="full" disabled={!input.trim()}>
              <Send className="h-5 w-5" />
          </Button>
      </form>
    </div>
  );
}
