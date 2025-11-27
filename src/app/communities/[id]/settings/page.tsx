'use client';

import { PlaceholderPage } from "@/components/PlaceholderPage";

function CommunitySettingsClient({ communityId }: { communityId: string }) {
    return <PlaceholderPage title={`Настройки сообщества #${communityId}`} />
}

export default async function CommunitySettingsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <CommunitySettingsClient communityId={id} />
}
