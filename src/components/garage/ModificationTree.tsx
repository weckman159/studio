'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ExternalLink, Heart } from 'lucide-react'
import type { Car } from '@/lib/types'

export function ModificationTree({ mods }: { mods: Car['modifications'] }) {
  if (!mods) {
      return (
          <div className="text-center py-12 text-muted-foreground">
              Список модификаций пока не заполнен.
          </div>
      )
  }

  const modCategories = Object.keys(mods) as (keyof Car['modifications'])[];

  return (
    <Tabs defaultValue="engine" className="w-full">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
        <TabsTrigger value="engine">🔧 Двигатель</TabsTrigger>
        <TabsTrigger value="suspension">🏎️ Подвеска</TabsTrigger>
        <TabsTrigger value="exterior">✨ Экстерьер</TabsTrigger>
        <TabsTrigger value="interior">🪑 Интерьер</TabsTrigger>
        <TabsTrigger value="audio">🔊 Аудио</TabsTrigger>
      </TabsList>
      
      {modCategories.map((category) => (
        <TabsContent key={category} value={category}>
          <div className="space-y-4 mt-4">
            {(mods[category] && mods[category].length > 0) ? mods[category].map(mod => (
              <div key={mod.id} className="flex items-center justify-between p-4 bg-card border rounded-xl hover:shadow-lg transition-all">
                <div className="flex-1">
                  <div className="font-semibold">{mod.part}</div>
                  <div className="text-sm text-muted-foreground">
                    {mod.brand} {mod.model}
                  </div>
                  {mod.price && (
                    <div className="text-sm font-bold mt-1">{mod.price.toLocaleString()} ₽</div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Heart className="h-4 w-4 mr-1" />
                    Хочу так же
                  </Button>
                  {mod.affiliateLink && (
                    <Button size="sm" variant="default" asChild>
                      <a href={mod.affiliateLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Купить
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-muted-foreground">
                В этой категории пока нет модификаций.
              </div>
            )}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  )
}
