'use client';

import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function CommunitySettingsPage({ params }: { params: { id: string } }) {
    return <PlaceholderPage title={`Настройки сообщества #${params.id}`} />
}
