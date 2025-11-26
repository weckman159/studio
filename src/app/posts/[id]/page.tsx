// src/app/posts/[id]/page.tsx
'use client';

import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function PostDetailPage({ params }: { params: { id: string } }) {
    return <PlaceholderPage title={`Просмотр поста #${params.id}`} />
}
