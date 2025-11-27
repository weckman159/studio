
'use client'
import { useState } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  MessageCircle, 
  UserPlus, 
  Share2, 
  MoreHorizontal,
  Instagram,
  Youtube,
  Send,
  Edit
} from 'lucide-react'

interface UserProfile {
  id: string
  displayName: string
  username: string
  avatar: string
  coverImage?: string
  coverVideo?: string
  bio: string
  status: string
  badges: string[]
  stats: {
    followers: number
    reputation: number
    cars: number
  }
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  socials: {
    instagram?: string
    youtube?: string
    telegram?: string
  }
}

export function ProfileHero({ profile, isOwner = false, onEditClick }: { profile: UserProfile, isOwner?: boolean, onEditClick: () => void }) {
  const [isFollowing, setIsFollowing] = useState(false)
  
  const tierColors = {
    bronze: 'from-orange-600 to-orange-400',
    silver: 'from-gray-400 to-gray-200',
    gold: 'from-yellow-500 to-yellow-300',
    platinum: 'from-purple-500 to-pink-400',
  }

  return (
    <div className="relative h-[400px] md:h-[500px] overflow-hidden">
      {/* Фон: видео или фото */}
      {profile.coverVideo ? (
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={profile.coverVideo} type="video/mp4" />
        </video>
      ) : (
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${profile.coverImage || '/default-cover.jpg'})` }}
        />
      )}
      
      {/* Градиент затемнения */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
      
      {/* Кнопки управления (правый верхний угол) */}
      <div className="absolute top-6 right-6 flex gap-2">
        <Button variant="ghost" size="icon" className="bg-black/50 backdrop-blur-md text-white hover:bg-black/70">
          <Share2 className="h-5 w-5" />
        </Button>
        {!isOwner && (
          <Button variant="ghost" size="icon" className="bg-black/50 backdrop-blur-md text-white hover:bg-black/70">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        )}
      </div>
      
      {/* Инфо-блок (Glassmorphism) */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
        <div className="container mx-auto px-4">
          <div className="profile-card-glass p-6 md:p-8 rounded-3xl">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Аватар */}
              <Avatar className={`h-28 w-28 md:h-32 md:w-32 rounded-3xl ring-4 ring-offset-4 ring-offset-background bg-gradient-to-br ${tierColors[profile.tier]} p-1 shadow-2xl`}>
                <AvatarImage src={profile.avatar} className="rounded-3xl" />
                <AvatarFallback className="rounded-3xl text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                  {profile.displayName[0]}
                </AvatarFallback>
              </Avatar>
              
              {/* Информация */}
              <div className="flex-1">
                <div className="mb-3">
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
                    {profile.displayName}
                  </h1>
                  <p className="text-white/70 text-lg">@{profile.username}</p>
                </div>
                
                {/* Бейджи статуса */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 text-sm px-3 py-1">
                    {profile.status}
                  </Badge>
                  {profile.badges.map(badge => (
                    <Badge key={badge} variant="secondary" className="text-sm px-3 py-1">
                      {badge}
                    </Badge>
                  ))}
                </div>
                
                {/* Статистика */}
                <div className="flex flex-wrap gap-6 text-white mb-4">
                  <div>
                    <span className="font-bold text-xl">{(profile.stats.followers / 1000).toFixed(1)}k</span>
                    <span className="text-white/70 text-sm ml-2">Подписчиков</span>
                  </div>
                  <div>
                    <span className="font-bold text-xl">{(profile.stats.reputation / 1000).toFixed(0)}k</span>
                    <span className="text-white/70 text-sm ml-2">Репутации</span>
                  </div>
                  <div>
                    <span className="font-bold text-xl">{profile.stats.cars}</span>
                    <span className="text-white/70 text-sm ml-2">Машин</span>
                  </div>
                </div>
                
                {/* Кнопки действий */}
                <div className="flex flex-wrap gap-3">
                  {isOwner ? (
                    <Button size="lg" className="bg-white text-black hover:bg-white/90 font-semibold" onClick={onEditClick}>
                      <Edit className="mr-2 h-5 w-5" />
                      Редактировать
                    </Button>
                  ) : (
                    <>
                      <Button 
                        size="lg" 
                        className={`font-semibold ${isFollowing ? 'bg-white/20 text-white' : 'bg-white text-black hover:bg-white/90'}`}
                        onClick={() => setIsFollowing(!isFollowing)}
                      >
                        <UserPlus className="mr-2 h-5 w-5" />
                        {isFollowing ? 'Отписаться' : 'Подписаться'}
                      </Button>
                      <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/20 backdrop-blur-sm">
                        <MessageCircle className="mr-2 h-5 w-5" />
                        Написать
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

    