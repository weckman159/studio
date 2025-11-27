'use client'

import { Badge } from '@/components/ui/badge'
import { TrendingUp, Zap, Gauge, Road } from 'lucide-react'
import type { Car } from '@/lib/types/car'

export function SpecBar({ specs }: { specs: Car['specs'] }) {
  if (!specs) return null;
  const hpIncrease = specs.stockHP > 0 ? ((specs.currentHP - specs.stockHP) / specs.stockHP) * 100 : 0;
  
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-8">
      {/* Мощность */}
      <div className="relative bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-6 hover:shadow-2xl hover:shadow-blue-500/20 transition-all group overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all" />
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="h-8 w-8 text-blue-500" />
            {hpIncrease > 0 && (
              <Badge className="bg-green-500 hover:bg-green-600">
                +{hpIncrease.toFixed(0)}%
              </Badge>
            )}
          </div>
          <div className="text-3xl font-bold mb-1 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            {specs.stockHP || '?'} → {specs.currentHP || '?'}
          </div>
          <div className="text-sm text-muted-foreground">Мощность (л.с.)</div>
          {specs.currentHP && specs.stockHP && (
            <div className="w-full bg-muted/30 rounded-full h-2 mt-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min((specs.currentHP / specs.stockHP) * 100, 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Разгон */}
      <div className="bg-card border rounded-2xl p-6 hover:shadow-xl transition-all group">
        <Zap className="h-8 w-8 text-yellow-500 mb-3 group-hover:text-yellow-400 transition-colors" />
        <div className="text-3xl font-bold mb-1">{specs.acceleration || '?'}<span className="text-lg text-muted-foreground">s</span></div>
        <div className="text-sm text-muted-foreground">0-100 км/ч</div>
      </div>
      
      {/* Клиренс */}
      <div className="bg-card border rounded-2xl p-6 hover:shadow-xl transition-all group">
        <Gauge className="h-8 w-8 text-green-500 mb-3 group-hover:text-green-400 transition-colors" />
        <div className="text-3xl font-bold mb-1">{specs.clearance || '?'}<span className="text-lg text-muted-foreground"> см</span></div>
        <div className="text-sm text-muted-foreground">Клиренс</div>
      </div>
      
      {/* Пробег */}
      <div className="bg-card border rounded-2xl p-6 hover:shadow-xl transition-all group">
        <Road className="h-8 w-8 text-purple-500 mb-3 group-hover:text-purple-400 transition-colors" />
        <div className="text-3xl font-bold mb-1">{(specs.mileage || 0).toLocaleString()}</div>
        <div className="text-sm text-muted-foreground">Пробег (км)</div>
      </div>
    </div>
  )
}
