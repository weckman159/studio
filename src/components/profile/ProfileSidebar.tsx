
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Instagram, Youtube, Send } from 'lucide-react'
import type { User } from '@/lib/types'

export function ProfileSidebar({ profile }: { profile: User }) {
  const achievements = profile.achievements || [];
  const skills = profile.skills || [];

  return (
    <div className="sticky top-24 space-y-6">
      {/* Био */}
      {profile.bio && (
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-3">О себе</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {profile.bio}
          </p>
        </Card>
      )}

      {/* Соцсети */}
      {profile.socials && Object.values(profile.socials).some(Boolean) && (
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Соцсети</h3>
          <div className="flex flex-col gap-2">
            {profile.socials.instagram && (
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href={profile.socials.instagram} target="_blank" rel="noopener noreferrer">
                  <Instagram className="mr-2 h-5 w-5 text-pink-500" />
                  Instagram
                </a>
              </Button>
            )}
            {profile.socials.youtube && (
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href={profile.socials.youtube} target="_blank" rel="noopener noreferrer">
                  <Youtube className="mr-2 h-5 w-5 text-red-500" />
                  YouTube
                </a>
              </Button>
            )}
            {profile.socials.telegram && (
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href={profile.socials.telegram} target="_blank" rel="noopener noreferrer">
                  <Send className="mr-2 h-5 w-5 text-blue-500" />
                  Telegram
                </a>
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Ачивки */}
      {achievements.length > 0 && (
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Достижения</h3>
            <div className="grid grid-cols-4 gap-3">
              {achievements.map(achievement => (
                <div
                  key={achievement.id}
                  className={`relative group cursor-pointer ${achievement.unlocked ? '' : 'opacity-30'}`}
                  title={achievement.title}
                >
                  <div className="aspect-square bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl flex items-center justify-center text-3xl hover:scale-110 transition-transform">
                    {achievement.icon}
                  </div>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                    <div className="bg-black text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
                      {achievement.title}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
      )}

      {/* Скиллы */}
      {skills.length > 0 && (
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Навыки</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map(skill => (
                <Badge key={skill} variant="secondary" className="text-sm">
                  #{skill}
                </Badge>
              ))}
            </div>
          </Card>
      )}
      
      {/* Активность (тепловая карта) - заглушка */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Активность</h3>
        <div className="space-y-2">
          <div className="flex gap-1 flex-wrap">
            {Array.from({ length: 52 * 7 / 2 }).map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-sm bg-green-500/20 hover:bg-green-500/50 transition-colors"
                style={{
                  opacity: Math.random() > 0.5 ? 1 : 0.2,
                }}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{profile.stats?.postsCount || 0} постов за год</p>
        </div>
      </Card>
    </div>
  )
}
