

'use client';

import Link from "next/link";
import Image from "next/image";
import type { Car, User } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2, Car as CarIcon } from "lucide-react";
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
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "./ui/badge";

interface GarageCardProps {
  car: Car;
  user: User;
  onEdit?: (car: Car) => void;
  onDelete?: (carId: string) => void;
  variant?: 'default' | 'compact';
}

export function GarageCard({ car, user, onEdit, onDelete, variant = 'default' }: GarageCardProps) {
  const carImage = car.photoUrl || car.photos?.[0];

  if (variant === 'compact') {
    return (
        <div className="relative group flex items-center p-4 rounded-lg transition-all bg-card border hover:shadow-md">
            <div className="relative w-32 h-20 flex-shrink-0">
                 {carImage ? (
                    <Image
                        src={carImage}
                        alt={`${car.brand} ${car.model}`}
                        fill
                        className="rounded-md object-cover"
                    />
                 ) : (
                  <div className="flex items-center justify-center w-full h-full bg-muted rounded-md">
                      <CarIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
            </div>

            <div className="flex-grow ml-4">
                <Badge variant="secondary" className="mb-1">{car.year}</Badge>
                <Link href={`/car/${car.id}`} className="block font-semibold hover:underline leading-tight text-lg">
                    {car.brand} {car.model}
                </Link>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span>{car.engine}</span>
                    <span>•</span>
                    <span>{car.specs?.currentHP || 'N/A'} л.с.</span>
                </div>
            </div>

            {onEdit && onDelete && (
                 <div className="absolute top-2 right-2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="h-8 w-8 flex-shrink-0" onClick={() => onEdit(car)}>
                        <Edit className="h-4 w-4" />
                    </Button>
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button size="icon" variant="ghost" className="h-8 w-8 flex-shrink-0">
                             <Trash2 className="h-4 w-4 text-destructive" />
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
        </div>
    )
  }

  return (
     <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg group relative">
       {onEdit && onDelete && (
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
          <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => onEdit(car)}>
            <Edit className="h-4 w-4" />
          </Button>
          <AlertDialog>
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
      <CardHeader className="p-0">
        <Link href={`/car/${car.id}`} className="block aspect-video relative bg-muted">
          {carImage ? (
            <Image
              src={carImage}
              alt={`${car.brand} ${car.model}`}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <CarIcon className="w-12 h-12 text-muted-foreground"/>
            </div>
          )}
        </Link>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 p-4">
        <CardTitle className="text-xl">
            <Link href={`/car/${car.id}`} className="hover:text-primary transition-colors">
                {car.brand} {car.model}
            </Link>
        </CardTitle>
        <p className="text-sm text-muted-foreground">{car.year} год</p>
        <div className="flex-1" />
      </CardContent>
       <CardFooter className="p-4 pt-0">
          <Button asChild variant="outline" className="w-full">
            <Link href={`/car/${car.id}`}>Просмотреть</Link>
          </Button>
        </CardFooter>
    </Card>
  );
}
