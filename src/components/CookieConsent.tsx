'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { X, Settings } from 'lucide-react'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState({
    necessary: true, // всегда включены
    functional: false,
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      setShowBanner(true)
    }
  }, [])

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    }
    localStorage.setItem('cookie-consent', JSON.stringify(allAccepted))
    setShowBanner(false)
    // TODO: Инициализировать аналитику, рекламу и т.д.
  }

  const acceptNecessary = () => {
    const necessary = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    }
    localStorage.setItem('cookie-consent', JSON.stringify(necessary))
    setShowBanner(false)
  }

  const savePreferences = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(preferences))
    setShowBanner(false)
    setShowSettings(false)
    // TODO: Применить настройки
  }

  if (!showBanner) return null

  return (
    <>
      <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 shadow-2xl border-2">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="font-bold text-lg">Cookies и конфиденциальность</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={acceptNecessary}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            Мы используем cookies для улучшения работы сайта и анализа трафика. 
            Некоторые cookies необходимы для функционирования сайта.{' '}
            <Link href="/cookies" className="text-primary hover:underline">
              Подробнее
            </Link>
          </p>
          
          <div className="flex flex-col gap-2">
            <Button onClick={acceptAll} className="w-full">
              Принять все
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={acceptNecessary} className="w-full">
                Только необходимые
              </Button>
              <Button variant="outline" onClick={() => setShowSettings(true)} className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Настроить
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Диалог настроек */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Настройки Cookie</DialogTitle>
            <DialogDescription>
              Управляйте использованием cookies на сайте. Некоторые функции могут быть недоступны при отключении определенных категорий.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Необходимые */}
            <div className="flex items-start justify-between p-4 rounded-lg border bg-muted/50">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Label className="font-semibold">Необходимые cookies</Label>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Всегда активны</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Обеспечивают базовую функциональность сайта (авторизация, безопасность, настройки).
                </p>
              </div>
              <Switch checked disabled />
            </div>

            {/* Функциональные */}
            <div className="flex items-start justify-between p-4 rounded-lg border">
              <div className="flex-1 pr-4">
                <Label className="font-semibold mb-1 block">Функциональные cookies</Label>
                <p className="text-sm text-muted-foreground">
                  Запоминают ваши предпочтения (язык, тема, настройки интерфейса).
                </p>
              </div>
              <Switch 
                checked={preferences.functional}
                onCheckedChange={(checked) => setPreferences(p => ({ ...p, functional: checked }))}
              />
            </div>

            {/* Аналитика */}
            <div className="flex items-start justify-between p-4 rounded-lg border">
              <div className="flex-1 pr-4">
                <Label className="font-semibold mb-1 block">Аналитические cookies</Label>
                <p className="text-sm text-muted-foreground">
                  Помогают понять, как посетители используют сайт (Google Analytics, Hotjar).
                </p>
              </div>
              <Switch 
                checked={preferences.analytics}
                onCheckedChange={(checked) => setPreferences(p => ({ ...p, analytics: checked }))}
              />
            </div>

            {/* Маркетинг */}
            <div className="flex items-start justify-between p-4 rounded-lg border">
              <div className="flex-1 pr-4">
                <Label className="font-semibold mb-1 block">Маркетинговые cookies</Label>
                <p className="text-sm text-muted-foreground">
                  Используются для показа персонализированной рекламы и таргетинга.
                </p>
              </div>
              <Switch 
                checked={preferences.marketing}
                onCheckedChange={(checked) => setPreferences(p => ({ ...p, marketing: checked }))}
              />
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <Button onClick={savePreferences} className="flex-1">
              Сохранить настройки
            </Button>
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Отмена
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
