
// src/app/profile/[id]/page.tsx
import { ProfileClientPage } from '@/components/profile/ProfileClientPage';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // No caching

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Server-side validation has been removed.
    // The client component will now handle its own loading and not-found states.
    return (
        <div className="p-4 md:p-8">
            <ProfileClientPage profileId={id} />
        </div>
    );
}
