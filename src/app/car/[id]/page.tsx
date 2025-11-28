'use server';

import { CarHero } from '@/components/garage/CarHero';
import { SpecBar } from '@/components/garage/SpecBar';
import { ModificationTree } from '@/components/garage/ModificationTree';
import { CarTimeline } from '@/components/garage/CarTimeline';
import { Wrench, Calendar, Package, FileText, DollarSign } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { adminDb } from '@/lib/firebase-admin';
import type { Car, TimelineEntry } from '@/lib/types';
import { getDocs, collection, query, orderBy, updateDoc, increment } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { doc } from 'firebase/firestore';


async function getCarData(carId: string): Promise<{ car: Car | null, timeline: TimelineEntry[] }> {
    try {
        const carRef = adminDb.collection('cars').doc(carId);

        // Increment views in a non-blocking way on the client's firestore instance
        if(firestore) {
            const clientCarRef = doc(firestore, 'cars', carId);
            updateDoc(clientCarRef, { views: increment(1) }).catch(console.error);
        }

        const carSnap = await carRef.get();
        if (!carSnap.exists) {
            return { car: null, timeline: [] };
        }
        const car = { id: carSnap.id, ...carSnap.data() } as Car;

        const timelineRef = carRef.collection('timeline');
        const timelineQuery = timelineRef.orderBy('date', 'desc');
        const timelineSnap = await timelineQuery.get();
        const timeline = timelineSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as TimelineEntry));

        return { car, timeline };

    } catch (error) {
        console.error("Error fetching car data on server:", error);
        return { car: null, timeline: [] };
    }
}


function GaragePageSkeleton() {
  return (
    <div className="container mx-auto py-8">
      <Skeleton className="h-[500px] w-full rounded-3xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-8">
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
       <Skeleton className="h-10 w-full rounded-md" />
    </div>
  )
}

export default async function CarPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { car, timeline } = await getCarData(id);

  if (!car) {
    return <div className="container mx-auto py-8">Автомобиль не найден</div>
  }
  
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
            <div className="text-center py-12 text-muted-foreground">
              Финансовая аналитика в разработке
            </div>
          </TabsContent>
          
          <TabsContent value="inventory">
            <div className="text-center py-12 text-muted-foreground">
              Управление инвентарём в разработке
            </div>
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
