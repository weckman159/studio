
// src/app/marketplace/[id]/page.tsx
import { getAdminDb } from '@/lib/firebase-admin';
import { notFound } from 'next/navigation';
import type { MarketplaceItem } from '@/lib/types';
import MarketplaceItemClient from './_components/MarketplaceItemClient';
import { marketplaceItemConverter } from '@/lib/firestore-converters';

export const dynamic = 'force-dynamic';

async function getItemData(itemId: string): Promise<MarketplaceItem | null> {
    try {
        const adminDb = getAdminDb();
        if (!adminDb) {
            console.error("Firebase Admin not initialized");
            notFound();
        }
        
        const itemRef = adminDb.collection('marketplace').withConverter(marketplaceItemConverter).doc(itemId);
        
        const itemSnap = await itemRef.get();
        if (!itemSnap.exists) {
            notFound();
        }
        return itemSnap.data() ?? null;
    } catch (error) {
        console.error("Error fetching marketplace item:", error);
        notFound();
    }
}

export default async function MarketplaceItemPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const item = await getItemData(id);
    
    return <MarketplaceItemClient item={item!} />
}
