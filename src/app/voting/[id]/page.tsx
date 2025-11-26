'use client';

import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function VotingDetailsPage({ params }: { params: { id: string } }) {
    return <PlaceholderPage title={`Опрос #${params.id}`} />
}

    