
'use client';

import Link from "next/link";
import Image from "next/image";
import type { Car, User } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface GarageCardProps {
  car: Car;
  user: User;
  onEdit?: (car: Car) => void;
  onDelete?: (carId: string) => void;
  variant?: 'default' | 'compact';
}

export function GarageCard({ car, user, onEdit, onDelete, variant = 'default' }: GarageCardProps) {
  const carImage = PlaceHolderImages.find((img) => img.id === car.imageId);

  if (variant === 'compact') {
    return (
        <div className="flex items-center p-3 rounded-md transition-all hover:bg-muted/50">
            {carImage && (
                 <Link href={`/car/${car.id}`}>
                    <Image
                        src={carImage.imageUrl}
                        alt={`${car.brand} ${car.model}`}
                        width={64}
                        height={40}
                        className="rounded-md object-cover w-16 h-10"
                        data-ai-hint={carImage.imageHint}
                    />
                 </Link>
            )}
            <div className="flex-grow ml-4">
                <Link href={`/car/${car.id}`} className="font-semibold hover:underline leading-tight">
                    {car.brand} {car.model}
                </Link>
                <p className="text-sm text-muted-foreground">{car.year}</p>
            </div>
            {onEdit && onDelete && (
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                       <Button size="icon" variant="ghost" className="h-8 w-8 flex-shrink-0">
                         <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                     <Button size="icon" variant="ghost" className="h-8 w-8 flex-shrink-0" onClick={() => onEdit(car)}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Это действие необратимо. Автомобиль будет удален из вашего гаража.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(car.id)}>Удалить</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
    )
  }

  return (
     <div className="rounded-lg border bg-card text-card-foreground shadow-sm flex flex-col overflow-hidden transition-all hover:shadow-lg group relative">
       {onEdit && onDelete && (
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <AlertDialog>
                <Button size="icon" variant="secondary" className="h-8 w-8 mr-1" onClick={() => onEdit(car)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialogTrigger asChild>
                   <Button size="icon" variant="destructive" className="h-8 w-8">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Это действие необратимо. Автомобиль будет удален из вашего гаража.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(car.id)}>Удалить</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
      <div className="p-0">
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
      </div>
      <div className="flex flex-col flex-1 p-4">
        <div className="text-xl font-semibold">
            <Link href={`/car/${car.id}`} className="hover:text-primary transition-colors">
                {car.brand} {car.model}
            </Link>
        </div>
        <p className="text-sm text-muted-foreground">{car.year} год</p>
        <div className="flex-1" />
      </div>
       <div className="flex items-center p-4 pt-0">
          <Button asChild variant="outline" className="w-full">
            <Link href={`/car/${car.id}`}>Просмотреть</Link>
          </Button>
        </div>
    </div>
  );
}
