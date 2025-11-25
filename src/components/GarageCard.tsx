
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
}

export function GarageCard({ car, user, onEdit, onDelete }: GarageCardProps) {
  const carImage = PlaceHolderImages.find((img) => img.id === car.imageId);

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg group">
       {onEdit && onDelete && (
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(car)}>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Редактировать</span>
                </DropdownMenuItem>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Удалить</span>
                  </DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>
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
