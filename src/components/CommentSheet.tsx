
'use client';

import { useState, useEffect } from 'react';
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
import { useUser } from '@/firebase';
import type { Comment, User } from '@/lib/data';
import { comments as mockComments, users as mockUsers } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';
import { Send } from 'lucide-react';

interface CommentSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  postId: string;
}

function CommentItem({ comment, user }: { comment: Comment; user: User }) {
  const userAvatar = PlaceHolderImages.find(p => p.id === user.avatarId);
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    if (comment.createdAt) {
      const date = new Date(comment.createdAt);
      if (!isNaN(date.getTime())) {
        setFormattedDate(date.toLocaleString('ru-RU', {
          year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        }));
      }
    }
  }, [comment.createdAt]);

  return (
    <div className="flex items-start space-x-4 py-4">
      <Link href={`/profile/${user.id}`}>
        <Avatar>
          {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt={user.name} data-ai-hint={userAvatar.imageHint}/>}
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
      </Link>
      <div className="flex-1">
        <div className="flex items-center justify-between">
            <Link href={`/profile/${user.id}`} className="font-semibold hover:underline">{user.name}</Link>
            <span className="text-xs text-muted-foreground">{formattedDate}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{comment.text}</p>
      </div>
    </div>
  );
}

export function CommentSheet({ isOpen, onOpenChange, postId }: CommentSheetProps) {
  const { user: authUser } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (isOpen) {
      // In a real app, you would fetch comments for the postId from Firestore
      const postComments = mockComments.filter(c => c.postId === postId);
      setComments(postComments);
    }
  }, [isOpen, postId]);

  const handleAddComment = () => {
    if (!newComment.trim() || !authUser) return;

    // This is mock logic. In a real app, you would add the comment to Firestore.
    const currentUser = mockUsers.find(u => u.id === authUser.uid) || mockUsers[0];
    const comment: Comment = {
      id: String(Date.now()),
      postId,
      userId: currentUser.id,
      text: newComment,
      createdAt: new Date().toISOString(),
    };
    setComments(prev => [comment, ...prev]);
    setNewComment('');
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Комментарии ({comments.length})</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1 -mx-6">
            <div className="px-6 divide-y">
            {comments.map(comment => {
                const user = mockUsers.find(u => u.id === comment.userId);
                if (!user) return null;
                return <CommentItem key={comment.id} comment={comment} user={user} />;
            })}
            </div>
        </ScrollArea>
        <SheetFooter>
            {authUser ? (
                <div className="flex w-full space-x-2">
                    <Textarea
                        placeholder="Написать комментарий..."
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        rows={1}
                        className="flex-1"
                    />
                    <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
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
