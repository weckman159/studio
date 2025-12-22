// src/components/profile/ProfileActions.tsx
'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { followUser, unfollowUser } from '@/app/profile/[id]/actions';
import { Edit, UserPlus, UserCheck, MessageCircle, Loader2 } from 'lucide-react';

/**
 * ПОЧЕМУ ИСПРАВЛЕНО:
 * Создан новый, изолированный клиентский компонент для кнопок действий.
 * 1. ИСПОЛЬЗУЕТ SERVER ACTIONS: Логика вынесена на сервер, компонент только вызывает экшены.
 * 2. ОПТИМИСТИЧНОЕ ОБНОВЛЕНИЕ: Использует useTransition для показа состояния загрузки без блокировки UI.
 * 3. ЧИСТОТА: Отделяет логику действий от логики отображения, что упрощает основной компонент.
 */

interface ProfileActionsProps {
  targetUserId: string;
  isOwner: boolean;
  isFollowing: boolean;
  onEditClick: () => void;
}

export function ProfileActions({ targetUserId, isOwner, isFollowing, onEditClick }: ProfileActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleFollow = () => {
    startTransition(() => {
      followUser(targetUserId);
    });
  };

  const handleUnfollow = () => {
    startTransition(() => {
      unfollowUser(targetUserId);
    });
  };

  if (isOwner) {
    return (
      <Button size="sm" onClick={onEditClick} disabled={isPending}>
        <Edit className="mr-2 h-4 w-4"/>Редактировать
      </Button>
    );
  }

  return (
    <>
      <Button size="sm" onClick={isFollowing ? handleUnfollow : handleFollow} disabled={isPending}>
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
        ) : isFollowing ? (
          <UserCheck className="mr-2 h-4 w-4"/>
        ) : (
          <UserPlus className="mr-2 h-4 w-4"/>
        )}
        {isFollowing ? 'Отписаться' : 'Подписаться'}
      </Button>
      <Button size="sm" variant="outline">
        <MessageCircle className="mr-2 h-4 w-4"/>Написать
      </Button>
    </>
  );
}
