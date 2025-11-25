

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
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Bookmark } from "lucide-react";
import { Badge } from "./ui/badge";
import { CommentSheet } from "./CommentSheet";
import { useUser } from "@/firebase";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel";

interface PostCardProps {
  post: Post;
  user: User;
  car: Car;
}

export function PostCard({ post, user, car }: PostCardProps) {
  const { user: authUser } = useUser();
  
  const getImageUrls = () => {
    let urls: {url: string, hint: string}[] = [];
    if(post.imageUrls) {
       urls = post.imageUrls.map(url => ({url, hint: 'uploaded image'}));
    } else if (post.imageIds) {
      post.imageIds.forEach(id => {
        const placeholder = PlaceHolderImages.find(p => p.id === id);
        if(placeholder) urls.push({url: placeholder.imageUrl, hint: placeholder.imageHint});
      });
    } else if (post.imageId) {
      const placeholder = PlaceHolderImages.find(p => p.id === post.imageId);
      if(placeholder) urls.push({url: placeholder.imageUrl, hint: placeholder.imageHint});
    }
    return urls;
  }
  
  const finalImageUrls = getImageUrls();

  const userAvatar = PlaceHolderImages.find((img) => img.id === user.avatarId);
  const [formattedDate, setFormattedDate] = useState('');
  const [isCommentSheetOpen, setCommentSheetOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    // Safely format the date on the client side to avoid hydration mismatch
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

  const handleLike = () => {
    if(!authUser) return;
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    // Here you would typically call a function to update the backend
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
      <CardHeader>
        <div className="flex items-center space-x-3">
          <Avatar>
            {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt={user.name} data-ai-hint={userAvatar.imageHint} />}
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <Link href={`/profile/${user.id}`} className="font-semibold hover:underline">
              {user.name}
            </Link>
            <p className="text-sm text-muted-foreground">
              добавил(а) пост в бортжурнал{' '}
              <Link href={`/car/${car.id}`} className="font-medium text-primary hover:underline">
                {car.brand} {car.model}
              </Link>
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <h2 className="text-2xl font-bold mb-4">{post.title}</h2>
        
        {finalImageUrls.length > 0 && (
          <Carousel className="w-full mb-4 rounded-lg overflow-hidden">
            <CarouselContent>
              {finalImageUrls.map((img, index) => (
                <CarouselItem key={index}>
                   <Link href={`/car/${car.id}?postId=${post.id}`} className="block">
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
        )}

        <p className="text-card-foreground/80 whitespace-pre-line">
          {post.content}
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="flex space-x-1 text-muted-foreground">
          <Button variant="ghost" size="sm" onClick={handleLike} aria-label="Like post">
            <Heart className={`mr-2 h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            {likeCount}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setCommentSheetOpen(true)} aria-label="View comments">
            <MessageCircle className="mr-2 h-4 w-4" />
            {post.comments}
          </Button>
        </div>
        <div className="flex items-center">
             <Button variant="ghost" size="icon" onClick={handleFavorite} aria-label="Add to favorites">
                 <Bookmark className={`h-5 w-5 ${isFavorited ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
             </Button>
            {formattedDate && <p className="text-sm text-muted-foreground ml-4">{formattedDate}</p>}
        </div>
      </CardFooter>
    </Card>
    </>
  );
}
