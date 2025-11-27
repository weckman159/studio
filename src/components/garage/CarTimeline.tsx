'use client'

import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import Image from 'next/image'
import type { TimelineEntry } from '@/lib/types/car'
import { Badge } from '@/components/ui/badge'

export function CarTimeline({ entries }: { entries: TimelineEntry[] }) {
  const getIcon = (type: TimelineEntry['type']) => {
    switch(type) {
      case 'purchase': return '🎉'
      case 'maintenance': return '🔧'
      case 'tuning': return '⚡'
      case 'accident': return '⚠️'
      case 'sale': return '💰'
      default: return '📝'
    }
  }
  
  if (!entries || entries.length === 0) {
      return (
          <div className="text-center py-12 text-muted-foreground">
              В бортжурнале этого автомобиля пока нет записей.
          </div>
      )
  }

  return (
    <div className="relative">
      {/* Вертикальная линия */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500" />
      
      <div className="space-y-8">
        {entries.map((entry) => (
          <div key={entry.id} className="relative pl-20">
            {/* Точка на timeline */}
            <div className="absolute left-4 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-lg shadow-lg">
              {getIcon(entry.type)}
            </div>
            
            {/* Карточка события */}
            <div className="bg-card border rounded-2xl p-6 hover:shadow-xl transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-bold text-xl">{entry.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {entry.date ? format(entry.date.toDate(), 'dd MMMM yyyy', { locale: ru }) : ''} • {entry.mileage?.toLocaleString() || '?'} км
                  </p>
                </div>
                {entry.cost && (
                  <Badge variant="outline" className="text-lg">
                    {entry.cost.toLocaleString()} ₽
                  </Badge>
                )}
              </div>
              <p className="text-sm leading-relaxed mb-4">{entry.description}</p>
              {entry.photos && entry.photos.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {entry.photos.map((photo, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                      <Image src={photo} alt={`Фото к записи ${entry.title}`} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
