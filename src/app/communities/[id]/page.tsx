
'use client';

import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function CommunityDetailPage({ params }: { params: { id: string } }) {
    return <PlaceholderPage title={`Сообщество #${params.id}`} />
}
