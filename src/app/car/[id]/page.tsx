import Image from "next/image";
import { cars, posts, users } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PostCard } from "@/components/PostCard";
import { Award, Calendar, Wrench } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function CarProfilePage({ params }: { params: { id: string } }) {
  const car = cars.find((c) => c.id === params.id);
  
  if (!car) {
    notFound();
  }

  const carImage = PlaceHolderImages.find((img) => img.id === car.imageId);
  const owner = users.find((u) => u.id === car.userId);
  const relatedPosts = posts.filter((p) => p.carId === car.id);
  const isCarOfTheDay = car.isCarOfTheDay;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader className="p-0">
               {carImage && (
                <div className="relative aspect-video">
                  <Image
                    src={carImage.imageUrl}
                    alt={`${car.brand} ${car.model}`}
                    fill
                    className="object-cover"
                    data-ai-hint={carImage.imageHint}
                  />
                  {isCarOfTheDay && (
                     <div className="absolute top-4 right-4">
                        <Badge variant="destructive" className="text-base font-bold py-2 px-4 shadow-lg animate-pulse">
                           <Award className="mr-2 h-5 w-5" />
                           Автомобиль дня
                        </Badge>
                     </div>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent className="p-6">
                <CardTitle className="text-4xl font-bold">{car.brand} {car.model}</CardTitle>
                {owner && <CardDescription className="text-lg mt-1">Владелец: {owner.name}</CardDescription>}
            </CardContent>
          </Card>

           <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">История постов</h2>
                <div className="space-y-6">
                 {relatedPosts.length > 0 ? (
                    relatedPosts.map(post => {
                        const postUser = users.find(u => u.id === post.userId);
                        const postCar = cars.find(c => c.id === post.carId);
                        if (!postUser || !postCar) return null;
                        return <PostCard key={post.id} post={post} user={postUser} car={postCar} />
                    })
                 ) : (
                    <Card>
                        <CardContent className="p-6 text-center text-muted-foreground">
                            <p>У этого автомобиля еще нет постов в бортжурнале.</p>
                        </CardContent>
                    </Card>
                 )}
                </div>
            </div>

        </div>
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Характеристики</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-3 text-muted-foreground"/>
                    <div>
                        <p className="text-sm text-muted-foreground">Год выпуска</p>
                        <p className="font-semibold">{car.year}</p>
                    </div>
                </div>
                <Separator/>
                <div className="flex items-center">
                    <Wrench className="h-5 w-5 mr-3 text-muted-foreground"/>
                    <div>
                        <p className="text-sm text-muted-foreground">Двигатель</p>
                        <p className="font-semibold">{car.engine}</p>
                    </div>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
