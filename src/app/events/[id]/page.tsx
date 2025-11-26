'use client';

import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function EventDetailPage({ params }: { params: { id: string } }) {
    return <PlaceholderPage title={`Событие #${params.id}`} />
}
