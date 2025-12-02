
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { doc, getDoc, collection, getDocs, limit, query, orderBy, setDoc, serverTimestamp, where } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Car } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import { Plus } from 'lucide-react';

export function CarOfTheDay() {
  const [featuredCars, setFeaturedCars] = useState<any[]>([]);
  const firestore = useFirestore();
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!firestore) return;

    const initCarOfTheDay = async () => {
        // 1. Проверяем, выбрана ли машина на сегодня
        const todayRef = doc(firestore, 'featuredCars', todayStr);
        const todaySnap = await getDoc(todayRef);

        if (todaySnap.exists()) {
            // Уже выбрана, просто показываем
        } else {
            // НЕ ВЫБРАНА. Пытаемся выбрать (Lazy init)
            try {
                // Ищем случайную машину с фото
                const q = query(collection(firestore, 'cars'), where('photoUrl', '!=', ''), limit(20));
                const carsSnap = await getDocs(q);
                
                if (!carsSnap.empty) {
                    const randomCar = carsSnap.docs[Math.floor(Math.random() * carsSnap.size)];
                    const carData = randomCar.data();
                    
                    // Записываем в базу, чтобы другие юзеры видели ту же машину сегодня
                    await setDoc(todayRef, {
                        carId: randomCar.id,
                        brand: carData.brand,
                        photoUrl: carData.photoUrl,
                        selectedAt: serverTimestamp()
                    });
                }
            } catch (e) {
                console.error("Auto-select failed (permissions or empty db)", e);
            }
        }

        // 2. Загружаем список для ленты (Авто дня + просто новые машины)
        let items = [];
        const finalTodaySnap = await getDoc(todayRef);
        if (finalTodaySnap.exists()) {
            items.push({ ...finalTodaySnap.data(), isToday: true, id: finalTodaySnap.data().carId });
        }

        const qRecent = query(collection(firestore, 'cars'), orderBy('createdAt', 'desc'), limit(10));
        const recentSnap = await getDocs(qRecent);
        recentSnap.forEach(d => {
            if (d.id !== finalTodaySnap.data()?.carId) {
                items.push({ id: d.id, ...d.data() });
            }
        });

        setFeaturedCars(items);
    };

    initCarOfTheDay();
  }, [firestore, todayStr]);

  return (
    <div className="w-full border-b bg-background/50 backdrop-blur-sm mb-4 py-4">
        <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex w-max space-x-4 px-4">
                <Link href="/garage" className="flex flex-col items-center gap-1 cursor-pointer group">
                    <div className="relative w-[68px] h-[68px]">
                         <div className="w-full h-full rounded-full border-2 border-muted border-dashed flex items-center justify-center group-hover:border-primary transition-colors">
                            <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
                         </div>
                    </div>
                    <span className="text-xs text-center">Добавить</span>
                </Link>

                {featuredCars.map((car, i) => (
                    <Link key={car.id} href={`/car/${car.id}`} className="flex flex-col items-center gap-1 cursor-pointer">
                        <div className={`rounded-full p-[2px] ${car.isToday ? 'bg-gradient-to-tr from-yellow-400 to-purple-600' : 'bg-muted'}`}> 
                            <div className="p-[2px] bg-background rounded-full">
                                <Avatar className="w-16 h-16">
                                    <AvatarImage src={car.photoUrl || car.photos?.[0]} className="object-cover" />
                                    <AvatarFallback>{car.brand?.[0]}</AvatarFallback>
                                </Avatar>
                            </div>
                        </div>
                        <span className="text-xs w-16 truncate text-center font-medium">
                            {car.isToday ? 'Авто дня' : car.brand}
                        </span>
                    </Link>
                ))}
            </div>
            <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
    </div>
  );
}
