'use client';

import { PlaceholderPage } from "@/components/PlaceholderPage";

function EditPostClient({ postId }: { postId: string }) {
    return <PlaceholderPage title={`Редактирование поста #${postId}`} />
}

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <EditPostClient postId={id} />
}
