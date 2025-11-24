import Link from "next/link";
import Image from "next/image";
import type { Car, User } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface GarageCardProps {
  car: Car;
  user: User;
}

export function GarageCard({ car, user }: GarageCardProps) {
  const carImage = PlaceHolderImages.find((img) => img.id === car.imageId);

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="p-0">
        <Link href={`/car/${car.id}`} className="block aspect-video relative">
          {carImage && (
            <Image
              src={carImage.imageUrl}
              alt={`${car.brand} ${car.model}`}
              fill
              className="object-cover"
              data-ai-hint={carImage.imageHint}
            />
          )}
        </Link>
      </CardHeader>
      <div className="flex flex-col flex-1 p-4">
        <CardTitle className="text-xl">
            <Link href={`/car/${car.id}`} className="hover:text-primary transition-colors">
                {car.brand} {car.model}
            </Link>
        </CardTitle>
        <CardDescription>{car.year} год</CardDescription>
        <div className="flex-1" />
      </div>
       <CardFooter>
          <Button asChild variant="outline" className="w-full">
            <Link href={`/car/${car.id}`}>Просмотреть</Link>
          </Button>
        </CardFooter>
    </Card>
  );
}
