'use client';

import { PlaceholderPage } from "@/components/PlaceholderPage";

function CreateCommunityPostClient({ communityId }: { communityId: string }) {
    return <PlaceholderPage title={`Новый пост в сообществе #${communityId}`} />
}

export default async function CreateCommunityPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <CreateCommunityPostClient communityId={id} />
}
