'use client';

import { useState, useEffect } from 'react';
import { CarHero } from '@/components/garage/CarHero';
import { SpecBar } from '@/components/garage/SpecBar';
import { ModificationTree } from '@/components/garage/ModificationTree';
import { CarTimeline } from '@/components/garage/CarTimeline';
import { CarExpenses } from './CarExpenses'; // <--- Импорт
import { Wrench, Calendar, Package, FileText, DollarSign } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFirestore, useUser } from '@/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';
import type { Car, TimelineEntry } from '@/lib/types';

interface CarDetailClientProps {
    initialCar: Car;
    initialTimeline: TimelineEntry[];
}

export default function CarDetailClient({ initialCar, initialTimeline }: CarDetailClientProps) {
    const firestore = useFirestore();
    const { user } = useUser();
    const [car] = useState<Car>(initialCar);
    const [timeline] = useState<TimelineEntry[]>(initialTimeline);
    
    useEffect(() => {
        if (firestore && car.id) {
            const clientCarRef = doc(firestore, 'cars', car.id);
            updateDoc(clientCarRef, { views: increment(1) }).catch(console.error);
        }
    }, [firestore, car.id]);

    const isOwner = user?.uid === car.userId;

    return (
        <div className="min-h-screen pb-24"> {/* pb-24 для мобильной навигации */}
            <div className="container mx-auto px-4 pt-8">
                <CarHero car={car} />
            </div>
            
            <div className="container mx-auto px-4">
                <SpecBar specs={car.specs} />
            </div>
            
            <div className="container mx-auto px-4 mt-8">
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-8 h-auto">
                        <TabsTrigger value="overview" className="py-3">Обзор</TabsTrigger>
                        <TabsTrigger value="specs" className="py-3">Спеки</TabsTrigger>
                        <TabsTrigger value="timeline" className="py-3">Бортжурнал</TabsTrigger>
                        <TabsTrigger value="expenses" className="py-3">Расходы</TabsTrigger>
                        <TabsTrigger value="inventory" className="py-3">Инвентарь</TabsTrigger>
                        <TabsTrigger value="files" className="py-3">Файлы</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview">
                        <ModificationTree mods={car.modifications} />
                    </TabsContent>
                    
                    <TabsContent value="specs">
                         <ModificationTree mods={car.modifications} />
                    </TabsContent>
                    
                    <TabsContent value="timeline">
                        <CarTimeline entries={timeline} />
                    </TabsContent>
                    
                    <TabsContent value="expenses">
                        <CarExpenses carId={car.id} isOwner={isOwner} />
                    </TabsContent>
                    
                    <TabsContent value="inventory">
                        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                            Инвентарь пуст
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="files">
                        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                            Файлов нет
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}