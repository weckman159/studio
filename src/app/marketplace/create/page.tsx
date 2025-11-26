// src/app/marketplace/create/page.tsx
'use client';

import { MarketplaceItemForm } from '@/components/MarketplaceItemForm';
import { useUser } from '@/firebase';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function MarketplaceCreatePage() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return <div className="text-center p-8">Загрузка...</div>;
  }
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Для размещения объявления необходимо войти в систему.
            <Link href="/auth" className="ml-2 underline">
              Войти
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return <MarketplaceItemForm />;
}
