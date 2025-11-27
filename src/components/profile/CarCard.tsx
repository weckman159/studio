

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Zap, Gauge, Wrench } from 'lucide-react'
import type { Car } from '@/lib/data';
import Image from 'next/image';


interface CarCardProps {
  car: Car;
}


export function CarCard({ car }: CarCardProps) {
  const statusConfig: Record<string, { label: string, color: string }> = {
    daily: { label: 'Дейли', color: 'bg-green-500' },
    project: { label: 'В постройке', color: 'bg-yellow-500' },
    weekend: { label: 'Проект выходного дня', color: 'bg-purple-500' },
  }

  return (
    <Link href={`/car/${car.id}`}>
      <div className="group relative h-48 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300">
        {/* Фон */}
        {car.photoUrl ? (
          <Image 
            src={car.photoUrl}
            alt={`${car.brand} ${car.model}`}
            fill
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
           <div className="absolute inset-0 w-full h-full bg-muted" />
        )}
        
        {/* Градиент */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        
        {/* Контент */}
        <div className="absolute inset-0 p-6 flex flex-col justify-between">
          {/* Статус */}
          <div>
            {/* <Badge className={`${statusConfig[car.status].color} border-0 text-white`}>
              {statusConfig[car.status].label}
            </Badge> */}
          </div>
          
          {/* Название и спеки */}
          <div>
            <h3 className="text-white font-bold text-2xl mb-3">
              {car.brand} {car.model}
            </h3>
            <div className="flex items-center gap-4 text-white/90 text-sm">
              <div className="flex items-center gap-1">
                <Zap className="h-4 w-4" />
                <span>{car.engine || '?'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Wrench className="h-4 w-4" />
                <span>{car.year}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Кнопка при hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black px-6 py-3 rounded-full font-semibold">
            Посмотреть спек-лист →
          </div>
        </div>
      </div>
    </Link>
  )
}
    