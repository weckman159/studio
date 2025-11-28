
import Link from 'next/link'
import { Separator } from '@/components/ui/separator'

export function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* О проекте */}
          <div>
            <h3 className="font-bold text-lg mb-4">AutoSphere</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Социальная сеть для автолюбителей. Делитесь опытом, находите единомышленников, 
              ведите бортжурнал своего автомобиля.
            </p>
          </div>
          
          {/* Платформа */}
          <div>
            <h4 className="font-semibold mb-4">Платформа</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">О проекте</Link></li>
              <li><Link href="/feedback" className="text-muted-foreground hover:text-foreground transition-colors">Обратная связь</Link></li>
              <li><Link href="/news" className="text-muted-foreground hover:text-foreground transition-colors">Новости</Link></li>
              
            </ul>
          </div>
          
          {/* Сообщество */}
          <div>
            <h4 className="font-semibold mb-4">Сообщество</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/communities" className="text-muted-foreground hover:text-foreground transition-colors">Сообщества</Link></li>
              <li><Link href="/workshops" className="text-muted-foreground hover:text-foreground transition-colors">Мастерские</Link></li>
              <li><Link href="/events" className="text-muted-foreground hover:text-foreground transition-colors">События</Link></li>
              <li><Link href="/marketplace" className="text-muted-foreground hover:text-foreground transition-colors">Маркетплейс</Link></li>
            </ul>
          </div>
          
          {/* Юридическая информация */}
          <div>
            <h4 className="font-semibold mb-4">Юридическая информация</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/impressum" className="text-muted-foreground hover:text-foreground transition-colors">Impressum (Выходные данные)</Link></li>
              <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Datenschutz (Конфиденциальность)</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">AGB (Условия использования)</Link></li>
              <li><Link href="/cookies" className="text-muted-foreground hover:text-foreground transition-colors">Cookie-Richtlinie</Link></li>
              <li><Link href="/widerrufsrecht" className="text-muted-foreground hover:text-foreground transition-colors">Widerrufsrecht (Право на отказ)</Link></li>
            </ul>
          </div>
        </div>
        
        <Separator className="my-6" />
        
        {/* Нижняя строка */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {currentYear} AutoSphere. Alle Rechte vorbehalten.</p>
          <div className="flex items-center gap-4">
             <Link href="/feedback" className="hover:text-foreground transition-colors">Kontakt</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
