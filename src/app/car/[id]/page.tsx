import Image from "next/image";
import { cars, posts, users } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PostCard } from "@/components/PostCard";
import { Award, Calendar, Wrench, Car as CarIcon, ImageIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function CarProfilePage({ params }: { params: { id: string } }) {
  // This is a temporary fix to prevent 404 on Firestore IDs.
  // It attempts to find the car in the mock data. If it fails,
  // it uses the first mock car as a fallback to render the page,
  // preventing a crash while indicating that the data is not the correct one.
  let car = cars.find((c) => c.id === params.id);
  let pageTitle: string;

  if (car) {
    pageTitle = `${car.brand} ${car.model}`;
  } else {
    // If car not found in mock data, it's likely a Firestore ID.
    // Use a placeholder car to render the page structure and avoid a 404 error.
    car = { ...cars[0], id: params.id, brand: 'Загрузка данных...', model: '', photos: [] };
    pageTitle = `Автомобиль ${params.id}`;
  }

  const mainImage = car.photoUrl || car.photos?.[0] || PlaceHolderImages.find((img) => img.id === car.imageId)?.imageUrl;
  const mainImageHint = car.photoUrl ? "user uploaded car" : PlaceHolderImages.find((img) => img.id === car.imageId)?.imageHint;
  const galleryImages = car.photos || (car.imageId ? [PlaceHolderImages.find(img => img.id === car.imageId)!.imageUrl] : []);


  const owner = users.find((u) => u.id === car.userId);
  const relatedPosts = posts.filter((p) => p.carId === car.id);
  const isCarOfTheDay = car.isCarOfTheDay;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <Card className="overflow-hidden">
            <CardHeader className="p-0">
               <div className="relative aspect-video bg-muted">
                  {mainImage ? (
                    <Image
                      src={mainImage}
                      alt={pageTitle}
                      fill
                      className="object-cover"
                      data-ai-hint={mainImageHint}
                    />
                  ) : (
                     <div className="flex items-center justify-center h-full">
                       <CarIcon className="w-24 h-24 text-muted-foreground"/>
                     </div>
                  )}
                  {isCarOfTheDay && (
                     <div className="absolute top-4 right-4">
                        <Badge variant="destructive" className="text-base font-bold py-2 px-4 shadow-lg animate-pulse">
                           <Award className="mr-2 h-5 w-5" />
                           Автомобиль дня
                        </Badge>
                     </div>
                  )}
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <CardTitle className="text-4xl font-bold">{pageTitle}</CardTitle>
                {owner && <CardDescription className="text-lg mt-1">Владелец: {owner.name}</CardDescription>}
                 {car.brand === 'Загрузка данных...' && (
                   <CardDescription className="text-amber-500 mt-2">
                     Не удалось загрузить полные данные об автомобиле. Отображается временная информация.
                   </CardDescription>
                 )}
            </CardContent>
          </Card>
          
           {galleryImages.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center"><ImageIcon className="mr-2 h-5 w-5"/>Галерея</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                       {galleryImages.map((imgUrl, index) => (
                           <div key={index} className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                               <Image 
                                 src={imgUrl}
                                 alt={`${pageTitle} gallery image ${index + 1}`}
                                 fill
                                 className="object-cover"
                               />
                           </div>
                       ))}
                    </CardContent>
                </Card>
           )}


           <div>
                <h2 className="text-2xl font-bold mb-4">История постов</h2>
                <div className="space-y-6">
                 {relatedPosts.length > 0 ? (
                    relatedPosts.map(post => {
                        const postUser = users.find(u => u.id === post.userId);
                        // Use the potentially placeholder car for the post card
                        const postCar = car;
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
                 {car.description && (
                  <>
                    <Separator/>
                    <div>
                        <p className="text-sm text-muted-foreground mb-1">Описание</p>
                        <p className="text-sm whitespace-pre-line">{car.description}</p>
                    </div>
                  </>
                 )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
