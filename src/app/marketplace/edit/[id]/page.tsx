'use client';

import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function EditMarketplaceItemPage({ params }: { params: { id: string } }) {
    return <PlaceholderPage title={`Редактирование объявления #${params.id}`} />
}
