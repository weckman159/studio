'use client';

import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function EditNewsPage({ params }: { params: { id: string } }) {
    return <PlaceholderPage title={`Редактирование новости #${params.id}`} />
}
