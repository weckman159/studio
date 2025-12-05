
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUser, useFirestore } from '@/firebase';
import type { Comment, User } from '@/lib/types';
import Link from 'next/link';
import { Send, MessageSquare } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { Skeleton } from './ui/skeleton';

interface CommentSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  postId: string;
}

function CommentItem({ comment }: { comment: Comment }) {
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    if (comment.createdAt?.toDate) {
        setFormattedDate(comment.createdAt.toDate().toLocaleString('ru-RU', {
          year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        }));
    }
  }, [comment.createdAt]);

  return (
    <div className="flex items-start space-x-4 py-4">
      <Link href={`/profile/${comment.authorId}`}>
        <Avatar>
          {comment.authorAvatar && <AvatarImage src={comment.authorAvatar} alt={comment.authorName} />}
          <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
        </Avatar>
      </Link>
      <div className="flex-1">
        <div className="flex items-center justify-between">
            <Link href={`/profile/${comment.authorId}`} className="font-semibold hover:underline">{comment.authorName}</Link>
            <span className="text-xs text-muted-foreground">{formattedDate}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{comment.content}</p>
      </div>
    </div>
  );
}

export function CommentSheet({ isOpen, onOpenChange, postId }: CommentSheetProps) {
  const { user: authUser } = useUser();
  const firestore = useFirestore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (isOpen && firestore) {
      setLoading(true);
      const q = query(collection(firestore, 'comments'), where('postId', '==', postId), orderBy('createdAt', 'asc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedComments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
        setComments(fetchedComments);
        setLoading(false);
         setTimeout(() => {
            listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
        }, 100);
      });
      return () => unsubscribe();
    }
  }, [isOpen, postId, firestore]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !authUser || !firestore) return;
    
    const commentData = {
        postId,
        authorId: authUser.uid,
        authorName: authUser.displayName || 'Пользователь',
        authorAvatar: authUser.photoURL || '',
        content: newComment.trim(),
        createdAt: serverTimestamp(),
    };

    try {
        await addDoc(collection(firestore, 'comments'), commentData);
        await updateDoc(doc(firestore, 'posts', postId), {
            commentsCount: increment(1)
        });
        setNewComment('');
    } catch(e) {
        console.error("Error adding comment: ", e);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Комментарии ({comments.length})</SheetTitle>
        </SheetHeader>
        <ScrollArea ref={listRef} className="flex-1 -mx-6">
            <div className="px-6 divide-y">
            {loading ? (
                <div className="space-y-4 py-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex space-x-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-full" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : comments.length > 0 ? (
                comments.map(comment => (
                    <CommentItem key={comment.id} comment={comment} />
                ))
            ) : (
                <div className="text-center py-16">
                    <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">Комментариев пока нет.</p>
                </div>
            )}
            </div>
        </ScrollArea>
        <SheetFooter>
            {authUser ? (
                <form 
                    onSubmit={(e) => {e.preventDefault(); handleAddComment();}}
                    className="flex w-full space-x-2"
                >
                    <Textarea
                        placeholder="Написать комментарий..."
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        rows={1}
                        className="flex-1"
                    />
                    <Button type="submit" disabled={!newComment.trim()}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            ) : (
                <p className="text-sm text-muted-foreground w-full text-center">
                    <Link href="/auth" className="text-primary underline">Войдите</Link>, чтобы оставить комментарий.
                </p>
            )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
