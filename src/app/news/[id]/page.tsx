'use client';

import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function NewsArticlePage({ params }: { params: { id: string } }) {
    return <PlaceholderPage title={`Новость #${params.id}`} />
}
