'use client';

import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function CreateCommunityPostPage({ params }: { params: { id: string } }) {
    return <PlaceholderPage title={`Новый пост в сообществе #${params.id}`} />
}
