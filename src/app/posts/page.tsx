// src/app/posts/page.tsx - СПИСОК ПОСТОВ
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, MessageCircle, Heart } from 'lucide-react'

export default async function PostsPage() {
  // Mock посты пока БД не готова
  const posts = [
    {
      id: '1',
      title: 'BMW M3 G80 - полный обзор',
      author: 'Вася Петров',
      category: 'BMW',
      excerpt: 'Распаковка, динамика, расход...',
      likes: 247,
      comments: 32,
      date: '2 часа назад'
    },
    {
      id: '2', 
      title: 'Топ-5 модификаций Audi RS6',
      author: 'Катя Сидорова',
      category: 'Audi',
      excerpt: 'Чип-тюнинг, выхлоп, подвеска...',
      likes: 189,
      comments: 21,
      date: '1 день назад'
    }
  ]

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-5xl font-bold">Посты</h1>
          <Link href="/posts/create" className="bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-all">
            Новый пост
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map(post => (
            <Link key={post.id} href={`/posts/${post.id}`}>
              <Card className="h-full hover:shadow-xl transition-all border-0 group cursor-pointer">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary">{post.category}</Badge>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground ml-auto">
                      <Heart className="h-4 w-4 group-hover:fill-red-500" />
                      <span>{post.likes}</span>
                      <MessageCircle className="h-4 w-4" />
                      <span>{post.comments}</span>
                    </div>
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors line-clamp-2 h-12">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-3 h-16 mb-4">{post.excerpt}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{post.author}</span>
                    <span>•</span>
                    <span>{post.date}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
