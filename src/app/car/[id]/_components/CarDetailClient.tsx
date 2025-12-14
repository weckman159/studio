
'use client';

import { useState, useEffect } from 'react';
import { CarHero } from '@/components/garage/CarHero';
import { SpecBar } from '@/components/garage/SpecBar';
import { ModificationTree } from '@/components/garage/ModificationTree';
import { CarTimeline } from '@/components/garage/CarTimeline';
import { CarExpenses } from './CarExpenses';
import { Wrench, Calendar, Package, FileText, DollarSign } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFirestore, useUser } from '@/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';
import type { Car, TimelineEntry } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Компонент для отображения характеристик
function SpecList({ specs }: { specs: Car['specs'] }) {
    if (!specs) return <div className="text-center py-12 text-muted-foreground">Характеристики не указаны.</div>;
    const specItems = [
        { label: 'Стоковая мощность', value: specs.stockHP, unit: 'л.с.' },
        { label: 'Текущая мощность', value: specs.currentHP, unit: 'л.с.' },
        { label: 'Разгон 0-100 км/ч', value: specs.acceleration, unit: 'с' },
        { label: 'Клиренс', value: specs.clearance, unit: 'см' },
        { label: 'Пробег', value: specs.mileage?.toLocaleString(), unit: 'км' },
    ];
    return (
        <Card>
            <CardHeader><CardTitle>Характеристики</CardTitle></CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {specItems.map(item => (
                        <div key={item.label} className="flex justify-between items-center p-3 border rounded-lg bg-muted/50">
                            <span className="text-muted-foreground">{item.label}</span>
                            <span className="font-bold">{item.value || '?'} {item.unit}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

// Компонент-заглушка для разделов в разработке
function ComingSoonPlaceholder({ title, icon: Icon }: { title: string, icon: React.ElementType }) {
    return (
        <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-xl flex flex-col items-center justify-center h-64">
            <Icon className="h-12 w-12 mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p>Этот раздел находится в разработке.</p>
        </div>
    );
}


export default function CarDetailClient({ initialCar, initialTimeline }: { initialCar: Car, initialTimeline: TimelineEntry[] }) {
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
        <div className="min-h-screen pb-24">
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
                         <SpecList specs={car.specs} />
                    </TabsContent>
                    
                    <TabsContent value="timeline">
                        <CarTimeline entries={timeline} />
                    </TabsContent>
                    
                    <TabsContent value="expenses">
                        <CarExpenses carId={car.id} isOwner={isOwner} />
                    </TabsContent>
                    
                    <TabsContent value="inventory">
                        <ComingSoonPlaceholder title="Инвентарь" icon={Package} />
                    </TabsContent>
                    
                    <TabsContent value="files">
                        <ComingSoonPlaceholder title="Файлы" icon={FileText} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
