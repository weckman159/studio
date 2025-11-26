'use client';

import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function EventSettingsPage({ params }: { params: { id: string } }) {
    return <PlaceholderPage title={`Настройки события #${params.id}`} />
}
