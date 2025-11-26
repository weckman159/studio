
'use client';

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from 'react';
import type { Post, User, Car } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Bookmark, FileText } from "lucide-react";
import { Badge } from "./ui/badge";
import { CommentSheet } from "./CommentSheet";
import { useUser } from "@/firebase";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel";
import { updateDoc, doc, increment, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

interface PostCardProps {
  post: Post;
  user: User;
  car: Car;
}

export function PostCard({ post, user, car }: PostCardProps) {
  const { user: authUser } = useUser();
  const firestore = useFirestore();
  
  const getImageUrls = () => {
    let urls: {url: string, hint: string}[] = [];
    if(post.imageUrls) {
       urls = post.imageUrls.map(url => ({url, hint: 'uploaded image'}));
    } else if (post.imageIds) {
      post.imageIds.forEach(id => {
        const placeholder = PlaceHolderImages.find(p => p.id === id);
        if(placeholder) urls.push({url: placeholder.imageUrl, hint: placeholder.imageHint});
      });
    } else if (post.imageUrl) {
      urls.push({ url: post.imageUrl, hint: "uploaded image" });
    }
    return urls;
  }
  
  const finalImageUrls = getImageUrls();
  const userAvatar = user.photoURL;
  const [formattedDate, setFormattedDate] = useState('');
  const [isCommentSheetOpen, setCommentSheetOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(post.likedBy?.includes(authUser?.uid || '') || false);
  const [likeCount, setLikeCount] = useState(post.likesCount || 0);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    if (post.createdAt) {
       const date = new Date(post.createdAt);
       if (!isNaN(date.getTime())) {
          setFormattedDate(date.toLocaleDateString('ru-RU', {
             year: 'numeric',
             month: 'long',
             day: 'numeric'
          }));
       }
    }
  }, [post.createdAt]);
  
   useEffect(() => {
    if (authUser?.uid) {
      setIsLiked(post.likedBy?.includes(authUser.uid));
    }
   }, [authUser, post.likedBy]);

  const handleLike = async () => {
    if (!authUser || !firestore) return;
    
    const newLikedState = !isLiked;
    const newLikeCount = newLikedState ? likeCount + 1 : likeCount - 1;
    
    setIsLiked(newLikedState);
    setLikeCount(newLikeCount);

    try {
      const postRef = doc(firestore, 'posts', post.id);
      await updateDoc(postRef, {
        likesCount: increment(newLikedState ? 1 : -1),
        likedBy: newLikedState ? arrayUnion(authUser.uid) : arrayRemove(authUser.uid),
      });
    } catch (error) {
      // Revert UI on error
      setIsLiked(!newLikedState);
      setLikeCount(likeCount);
      console.error("Error updating like:", error);
    }
  };

  const handleFavorite = () => {
    if(!authUser) return;
    setIsFavorited(!isFavorited);
    // Here you would typically call a function to update the backend
  };

  return (
    <>
    <CommentSheet 
        isOpen={isCommentSheetOpen}
        onOpenChange={setCommentSheetOpen}
        postId={post.id}
    />
    <Card className="overflow-hidden">
      {finalImageUrls.length > 0 ? (
          <Carousel className="w-full rounded-t-lg overflow-hidden bg-muted">
            <CarouselContent>
              {finalImageUrls.map((img, index) => (
                <CarouselItem key={index}>
                   <Link href={`/posts/${post.id}`} className="block">
                      <div className="relative aspect-video">
                        <Image
                          src={img.url}
                          alt={`${post.title} - image ${index + 1}`}
                          fill
                          className="object-cover"
                          data-ai-hint={img.hint}
                        />
                      </div>
                   </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            {finalImageUrls.length > 1 && (
              <>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </>
            )}
          </Carousel>
        ) : (
          <div className="aspect-video w-full bg-muted flex items-center justify-center rounded-t-lg">
            <FileText className="h-16 w-16 text-muted-foreground/30" />
          </div>
        )
      }
      <CardHeader>
        <div className="flex items-center space-x-3 mb-2">
          <Avatar>
            {userAvatar && <AvatarImage src={userAvatar} alt={user.name} />}
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <Link href={`/profile/${user.id}`} className="font-semibold hover:underline">
              {user.name}
            </Link>
            <p className="text-sm text-muted-foreground">
              в бортжурнале{' '}
              <Link href={`/car/${car.id}`} className="font-medium text-primary hover:underline">
                {car.brand} {car.model}
              </Link>
            </p>
          </div>
           {formattedDate && <p className="text-sm text-muted-foreground ml-auto">{formattedDate}</p>}
        </div>
        <CardTitle>
            <Link href={`/posts/${post.id}`} className="text-2xl font-bold hover:underline">
                {post.title}
            </Link>
        </CardTitle>
        {post.type && <Badge variant="outline" className="w-fit">{post.type}</Badge>}
      </CardHeader>
      <CardContent>
        <div 
          className="text-card-foreground/80 line-clamp-4 whitespace-pre-line prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        {post.tags && (
            <div className="flex flex-wrap gap-2 mt-4">
                {post.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
            </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="flex space-x-1 text-muted-foreground">
          <Button variant="ghost" size="sm" onClick={handleLike} disabled={!authUser} aria-label="Like post">
            <Heart className={`mr-2 h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            {likeCount}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setCommentSheetOpen(true)} aria-label="View comments">
            <MessageCircle className="mr-2 h-4 w-4" />
            {post.commentsCount || 0}
          </Button>
        </div>
        <div className="flex items-center">
             <Button variant="ghost" size="icon" onClick={handleFavorite} disabled={!authUser} aria-label="Add to favorites">
                 <Bookmark className={`h-5 w-5 ${isFavorited ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
             </Button>
        </div>
      </CardFooter>
    </Card>
    </>
  );
}
