import Link from "next/link";
import Image from "next/image";
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
import { Heart, MessageCircle } from "lucide-react";
import { Badge } from "./ui/badge";

interface PostCardProps {
  post: Post;
  user: User;
  car: Car;
}

export function PostCard({ post, user, car }: PostCardProps) {
  const postImage = PlaceHolderImages.find((img) => img.id === post.imageId);
  const userAvatar = PlaceHolderImages.find((img) => img.id === user.avatarId);

  return (
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
        {postImage && (
          <div className="relative aspect-video mb-4 rounded-lg overflow-hidden">
            <Image
              src={postImage.imageUrl}
              alt={post.title}
              fill
              className="object-cover"
              data-ai-hint={postImage.imageHint}
            />
          </div>
        )}
        <p className="text-card-foreground/80 whitespace-pre-line">
          {post.content}
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="flex space-x-4 text-muted-foreground">
          <Button variant="ghost" size="sm">
            <Heart className="mr-2 h-4 w-4" />
            {post.likes}
          </Button>
          <Button variant="ghost" size="sm">
            <MessageCircle className="mr-2 h-4 w-4" />
            {post.comments}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</p>
      </CardFooter>
    </Card>
  );
}
