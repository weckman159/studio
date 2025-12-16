
'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import type { Car } from '@/lib/types';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';

interface GarageCardProps {
  car: Car;
  onEdit: (car: Car) => void;
  onDelete: (car: Car) => void;
}

export function GarageCard({ car, onEdit, onDelete }: GarageCardProps) {
  const carImage = car.photoUrl;

  return (
    <Card className="overflow-hidden">
      <Link href={`/car/${car.id}`}>
        <div className="relative aspect-video bg-muted">
          {carImage ? (
            <Image
              src={carImage}
              alt={`${car.brand} ${car.model}`}
              fill
              className="object-cover"
            />
          ) : null}
        </div>
      </Link>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>
              <Link href={`/car/${car.id}`}>{car.brand} {car.model}</Link>
            </CardTitle>
            <CardDescription>{car.year}</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(car)}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Редактировать</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(car)} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Удалить</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {car.description || 'Нет описания.'}
        </p>
      </CardContent>
      <CardFooter>
        <Badge variant="outline">{car.engine}</Badge>
      </CardFooter>
    </Card>
  );
}
