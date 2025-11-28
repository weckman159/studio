// src/app/marketplace/[id]/page.tsx
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { notFound } from 'next/navigation';
import type { MarketplaceItem } from '@/lib/types';
import MarketplaceItemClient from './_components/MarketplaceItemClient';

export const dynamic = 'force-dynamic';

async function getItemData(itemId: string): Promise<MarketplaceItem | null> {
    try {
        const itemRef = adminDb.collection('marketplace').doc(itemId);
        
        const itemSnap = await itemRef.get();
        if (!itemSnap.exists) {
            return null;
        }
        return { id: itemSnap.id, ...itemSnap.data() } as MarketplaceItem;
    } catch (error) {
        console.error("Error fetching marketplace item:", error);
        return null;
    }
}

export default async function MarketplaceItemPage({ params }: { params: { id: string } }) {
    const item = await getItemData(params.id);

    if (!item) {
        notFound();
    }
    
    return <MarketplaceItemClient item={item} />
}
