'use client';

import { PlaceholderPage } from "@/components/PlaceholderPage";

function EventSettingsClient({ eventId }: { eventId: string }) {
    return <PlaceholderPage title={`Настройки события #${eventId}`} />
}

export default async function EventSettingsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <EventSettingsClient eventId={id} />
}
