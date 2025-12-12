
'use client';
import { useUser } from '@/firebase';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const { profile, isLoading: isProfileLoading } = useUserProfile(user?.uid);
  const router = useRouter();

  const isLoading = isUserLoading || isProfileLoading;

  useEffect(() => {
    if (!isLoading) {
      if (!user || profile?.role !== 'admin') {
        // Если не админ - перенаправляем на главную
        router.replace('/');
      }
    }
  }, [isLoading, user, profile, router]);

  // Пока идет проверка, показываем загрузчик. 
  // Если проверка не пройдена, пользователь будет перенаправлен.
  if (isLoading || !profile || profile?.role !== 'admin') {
    return (
      <div className="flex h-[calc(100vh-200px)] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Проверка доступа...</p>
        </div>
      </div>
    );
  }

  // Если пользователь админ, рендерим содержимое админки
  return <>{children}</>;
}
