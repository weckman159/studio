import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CarFront, Map, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6">
      <div className="relative mb-8">
        <CarFront className="w-24 h-24 text-primary/30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl font-black text-foreground/80">404</div>
      </div>
      <h1 className="text-3xl font-bold mb-3">Страница не найдена</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        Кажется, вы свернули не туда. Дорога, которую вы ищете, не существует или была перемещена.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Button asChild size="lg">
          <Link href="/">
            Вернуться на главную
          </Link>
        </Button>
        <Button variant="outline" asChild size="lg">
          <Link href="/search">
            <Search className="w-4 h-4 mr-2" />
            Искать
          </Link>
        </Button>
         <Button variant="outline" asChild size="lg">
          <Link href="/communities">
             <Map className="w-4 h-4 mr-2" />
            Карта сайта
          </Link>
        </Button>
      </div>
    </div>
  )
}
