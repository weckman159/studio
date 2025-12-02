'use client';

import { useState, useEffect } from 'react';
import { CarHero } from '@/components/garage/CarHero';
import { SpecBar } from '@/components/garage/SpecBar';
import { ModificationTree } from '@/components/garage/ModificationTree';
import { CarTimeline } from '@/components/garage/CarTimeline';
import { Wrench, Calendar, Package, FileText, DollarSign } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFirestore } from '@/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';
import type { Car, TimelineEntry } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CarExpenses } from './CarExpenses';

interface CarDetailClientProps {
    initialCar: Car;
    initialTimeline: TimelineEntry[];
}

export default function CarDetailClient({ initialCar, initialTimeline }: CarDetailClientProps) {
    const firestore = useFirestore();
    const [car, setCar] = useState<Car>(initialCar);
    const [timeline, setTimeline] = useState<TimelineEntry[]>(initialTimeline);
    
    useEffect(() => {
        // Increment views on client side
        if (firestore && car.id) {
            const clientCarRef = doc(firestore, 'cars', car.id);
            updateDoc(clientCarRef, { views: increment(1) }).catch(console.error);
        }
    }, [firestore, car.id]);


    return (
        <div className="min-h-screen pb-12">
            <div className="container mx-auto px-4 pt-8">
                <CarHero car={car} />
            </div>
            
            <div className="container mx-auto px-4">
                <SpecBar specs={car.specs} />
            </div>
            
            <div className="container mx-auto px-4 mt-8">
                <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-8">
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                    <Wrench className="h-4 w-4" />
                    <span className="hidden md:inline">Обзор</span>
                    </TabsTrigger>
                    <TabsTrigger value="specs" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="hidden md:inline">Спек-лист</span>
                    </TabsTrigger>
                    <TabsTrigger value="timeline" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="hidden md:inline">Бортжурнал</span>
                    </TabsTrigger>
                    <TabsTrigger value="expenses" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span className="hidden md:inline">Расходы</span>
                    </TabsTrigger>
                    <TabsTrigger value="inventory" className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    <span className="hidden md:inline">Инвентарь</span>
                    </TabsTrigger>
                    <TabsTrigger value="files" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="hidden md:inline">Файлы</span>
                    </TabsTrigger>
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
                   <CarExpenses carId={car.id} />
                </TabsContent>
                
                <TabsContent value="inventory">
                    <Card>
                        <CardHeader><CardTitle>Инвентарь</CardTitle></CardHeader>
                        <CardContent>
                            {/* Здесь можно добавить логику отображения инвентаря */}
                            <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
                                <Package className="h-10 w-10 mb-2 opacity-50" />
                                <p>Список запчастей и инструментов пуст.</p>
                                <Button variant="outline" className="mt-4">Добавить запись</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="files">
                    <div className="text-center py-12 text-muted-foreground">
                    Файловый менеджер в разработке
                    </div>
                </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
