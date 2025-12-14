
// src/app/marketplace/edit/[id]/page.tsx
'use client';

import { MarketplaceItemForm } from '@/components/MarketplaceItemForm';
import { useUser, useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { doc, DocumentReference } from 'firebase/firestore';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import type { MarketplaceItem } from '@/lib/types';
import { useEffect, useState } from 'react';


function EditMarketplaceItemClient({ itemId }: { itemId: string }) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const itemQuery = useMemoFirebase(
    () => (firestore && itemId ? doc(firestore, 'marketplace', itemId) : null),
    [firestore, itemId]
  ) as DocumentReference<MarketplaceItem> | null;

  const { data: item, isLoading: isItemLoading } = useDoc<MarketplaceItem>(itemQuery);
  
  const loading = isUserLoading || isItemLoading;

  if (loading) {
    return <div className="text-center p-8">Загрузка объявления...</div>;
  }
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Для редактирования необходимо войти в систему.
            <Link href="/auth" className="ml-2 underline">
              Войти
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!item) {
     return <div className="text-center p-8">Объявление не найдено.</div>;
  }

  if (item.sellerId !== user.uid) {
    return <div className="text-center p-8 text-destructive">У вас нет прав для редактирования этого объявления.</div>;
  }
  
  return <MarketplaceItemForm itemToEdit={item} />;
}

export default async function EditMarketplaceItemPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <EditMarketplaceItemClient itemId={id} />
}
