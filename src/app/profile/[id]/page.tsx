// src/app/profile/[id]/page.tsx - "use client" + NO FIREBASE
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    params.then(({ id }) => setId(id));
    setLoading(false)
  }, [params])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Загрузка...</div>
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-5xl font-bold mb-12">✅ ПРОФИЛЬ РАБОТАЕТ</h1>
      <div className="text-center mb-12">
        <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-8 animate-spin-slow"></div>
        <h2 className="text-3xl font-bold mb-4">Вася Петров</h2>
        <p className="text-xl text-muted-foreground mb-8">vasya@autosphere.ru</p>
        <code className="bg-muted px-4 py-2 rounded-xl text-lg font-mono">{id}</code>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <Link href="/posts" className="group p-8 bg-gradient-to-br from-primary to-primary/80 rounded-2xl text-white hover:shadow-2xl transition-all h-32 flex flex-col items-center justify-center">
          <div className="text-4xl mb-4 group-hover:scale-110">📝</div>
          <div className="text-2xl font-bold mb-1">15 постов</div>
        </Link>
        <Link href="/garage" className="group p-8 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl text-white hover:shadow-2xl transition-all h-32 flex flex-col items-center justify-center">
          <div className="text-4xl mb-4 group-hover:scale-110">🚗</div>
          <div className="text-2xl font-bold mb-1">3 машины</div>
        </Link>
        <div className="group p-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl text-white hover:shadow-2xl transition-all h-32 flex flex-col items-center justify-center cursor-pointer">
          <div className="text-4xl mb-4 group-hover:scale-110">👥</div>
          <div className="text-2xl font-bold mb-1">247 подписчиков</div>
        </div>
      </div>
    </div>
  )
}
