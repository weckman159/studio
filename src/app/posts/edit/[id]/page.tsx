'use client';

import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function EditPostPage({ params }: { params: { id: string } }) {
    return <PlaceholderPage title={`Редактирование поста #${params.id}`} />
}
