// src/app/marketplace/[id]/page.tsx
import { getAdminDb } from '@/lib/firebase-admin';
import { notFound } from 'next/navigation';
import type { MarketplaceItem } from '@/lib/types';
import MarketplaceItemClient from './_components/MarketplaceItemClient';

export const dynamic = 'force-dynamic';

async function getItemData(itemId: string): Promise<MarketplaceItem | null> {
    try {
        const adminDb = getAdminDb();
        if (!adminDb) {
            console.error("Firebase Admin not initialized");
            return null;
        }
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

export default async function MarketplaceItemPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const item = await getItemData(id);

    if (!item) {
        notFound();
    }
    
    return <MarketplaceItemClient item={item} />
}
