import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileQuestion, Rss } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
      <div className="relative mb-8">
        <FileQuestion className="w-24 h-24 text-primary/30" />
      </div>
      <h1 className="text-3xl font-bold mb-3">Пост не найден</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        К сожалению, мы не смогли найти публикацию, которую вы ищете. Возможно, она была удалена или ссылка неверна.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/posts">
            <Rss className="w-4 h-4 mr-2" />
            Ко всем публикациям
          </Link>
        </Button>
      </div>
    </div>
  )
}
