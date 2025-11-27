'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Play, Eye, Heart, MessageCircle, Share2 } from 'lucide-react'
import type { Car } from '@/lib/types/car'

export function CarHero({ car }: { car: Car }) {
  const [liked, setLiked] = useState(false)
  
  const badgeConfig: Record<string, { icon: string, label: string, gradient: string }> = {
    'car-of-the-day': { icon: '🏆', label: 'Машина дня', gradient: 'from-yellow-500 to-orange-500' },
    'top-10-region': { icon: '🔥', label: 'Топ-10 по региону', gradient: 'from-blue-500 to-purple-500' },
    'stage-2': { icon: '⚡', label: 'Stage 2', gradient: 'from-green-500 to-emerald-500' },
    'legendary': { icon: '👑', label: 'Легенда', gradient: 'from-purple-500 to-pink-500' },
  }
  
  return (
    <div className="relative h-[500px] md:h-[600px] rounded-3xl overflow-hidden shadow-2xl group">
      {/* Фон */}
      {car.coverVideo ? (
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={car.coverVideo} type="video/mp4" />
        </video>
      ) : (
        <Image 
          src={car.coverImage || car.photoUrl || car.photos?.[0] || 'https://placehold.co/1200x600'}
          alt={`${car.brand} ${car.model}`}
          fill
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      )}
      
      {/* Градиент */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      
      {/* Бейджи достижений */}
      <div className="absolute top-6 right-6 flex flex-wrap gap-2 justify-end max-w-md">
        {car.badges?.map(badge => {
          const config = badgeConfig[badge as keyof typeof badgeConfig]
          if (!config) return null
          return (
            <Badge 
              key={badge}
              className={`bg-gradient-to-r ${config.gradient} text-white border-0 shadow-lg backdrop-blur-sm`}
            >
              {config.icon} {config.label}
            </Badge>
          )
        })}
      </div>
      
      {/* Информация */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div className="flex-1">
            {/* Марка и модель */}
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <div className="bg-white/10 backdrop-blur-md px-4 md:px-6 py-2 md:py-3 rounded-2xl border border-white/20">
                <span className="font-bold text-2xl md:text-3xl text-white">{car.brand}</span>
                <span className="ml-2 md:ml-3 text-xl md:text-2xl text-white/90">{car.model}</span>
              </div>
              {car.generation && (
                <Badge variant="secondary" className="text-base md:text-lg px-3 md:px-4 py-1 md:py-2">
                  {car.generation} • {car.year}
                </Badge>
              )}
              {car.nickname && (
                <Badge className="text-base md:text-lg px-3 md:px-4 py-1 md:py-2 bg-purple-500/80 hover:bg-purple-500">
                  "{car.nickname}"
                </Badge>
              )}
            </div>
            
            {/* Статистика */}
            <div className="flex flex-wrap gap-4 md:gap-6 text-white/90 text-sm mb-4">
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" /> {car.views?.toLocaleString() || 0}
              </span>
              <span className="flex items-center gap-1">
                <Heart className={`h-4 w-4 ${liked ? 'fill-red-500 text-red-500' : ''}`} /> 
                {car.likes || 0}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" /> {car.comments || 0}
              </span>
            </div>
            
            {/* Кнопки действий */}
            <div className="flex flex-wrap gap-3">
              <Button 
                size="lg" 
                className="bg-white text-black hover:bg-white/90 shadow-xl font-semibold"
                onClick={() => setLiked(!liked)}
              >
                <Heart className={`mr-2 h-5 w-5 ${liked ? 'fill-current' : ''}`} />
                {liked ? 'В гараже' : 'Добавить в гараж'}
              </Button>
              <Button 
                size="lg"
                variant="outline" 
                className="border-white/50 text-white hover:bg-white/20 backdrop-blur-sm"
              >
                <Play className="mr-2 h-5 w-5" />
                360°
              </Button>
              <Button 
                size="lg"
                variant="outline" 
                className="border-white/50 text-white hover:bg-white/20 backdrop-blur-sm"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
