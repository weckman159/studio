'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { doc, getDoc, collection, getDocs, limit, query, orderBy } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Car } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import { Plus } from 'lucide-react';

// В этот компонент мы теперь будем загружать "Авто дня" + недавние "Истории" (машины)
export function CarOfTheDay() {
  const [featuredCars, setFeaturedCars] = useState<Car[]>([]);
  const firestore = useFirestore();

  useEffect(() => {
    if (!firestore) return;
    const fetchCars = async () => {
        // Для примера берем просто последние 10 машин как "Stories"
        const q = query(collection(firestore, 'cars'), orderBy('createdAt', 'desc'), limit(10));
        const snap = await getDocs(q);
        setFeaturedCars(snap.docs.map(d => ({id: d.id, ...d.data()} as Car)));
    };
    fetchCars();
  }, [firestore]);

  return (
    <div className="w-full border-b bg-background/50 backdrop-blur-sm mb-4 py-4">
        <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex w-max space-x-4 px-4">
                {/* Кнопка "Добавить" */}
                <Link href="/garage" className="flex flex-col items-center gap-1 cursor-pointer group">
                    <div className="relative w-[68px] h-[68px]">
                         <div className="w-full h-full rounded-full border-2 border-muted border-dashed flex items-center justify-center group-hover:border-primary transition-colors">
                            <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
                         </div>
                    </div>
                    <span className="text-xs text-center">Добавить</span>
                </Link>

                {/* Лента машин как Stories */}
                {featuredCars.map((car, i) => (
                    <Link key={car.id} href={`/car/${car.id}`} className="flex flex-col items-center gap-1 cursor-pointer">
                        {/* Градиентное кольцо - признак "сторис" */}
                        <div className={`rounded-full p-[2px] ${i === 0 ? 'bg-gradient-to-tr from-yellow-400 to-purple-600' : 'bg-muted'}`}> 
                            <div className="p-[2px] bg-background rounded-full">
                                <Avatar className="w-16 h-16">
                                    <AvatarImage src={car.photoUrl || car.photos?.[0]} className="object-cover" />
                                    <AvatarFallback>{car.brand[0]}</AvatarFallback>
                                </Avatar>
                            </div>
                        </div>
                        <span className="text-xs w-16 truncate text-center">
                            {i===0 ? 'Авто дня' : car.brand}
                        </span>
                    </Link>
                ))}
            </div>
            <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
    </div>
  );
}
