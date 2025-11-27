'use client'

import { useCar } from '@/hooks/useCar'
import { CarHero } from '@/components/garage/CarHero'
import { SpecBar } from '@/components/garage/SpecBar'
import { ModificationTree } from '@/components/garage/ModificationTree'
import { CarTimeline } from '@/components/garage/CarTimeline'
import { Wrench, Calendar, Package, FileText, DollarSign } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'

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

function GarageClient({ carId }: { carId: string }) {
  const { car, timeline, inventory, loading } = useCar(carId)
  
  if (loading) {
    return <GaragePageSkeleton />
  }
  
  if (!car) {
    return <div className="container mx-auto py-8">Автомобиль не найден</div>
  }
  
  return (
    <div className="min-h-screen pb-12">
      {/* Hero */}
      <div className="container mx-auto px-4 pt-8">
        <CarHero car={car} />
      </div>
      
      {/* Спек-бар */}
      <div className="container mx-auto px-4">
        <SpecBar specs={car.specs} />
      </div>
      
      {/* Табы */}
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

export default function CarPage({ params }: { params: { id: string } }) {
  return (
    <GarageClient carId={params.id} />
  )
}
