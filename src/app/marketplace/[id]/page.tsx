'use client';

import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function MarketplaceItemPage({ params }: { params: { id: string } }) {
    return <PlaceholderPage title={`Объявление #${params.id}`} />
}
