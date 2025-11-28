
// src/app/profile/[id]/page.tsx
import { ProfileClientPage } from '@/components/profile/ProfileClientPage';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// This page is now a simple wrapper that renders the client component.
// All data fetching is handled on the client side.
export default function ProfilePage({ params }: { params: { id: string } }) {
    const { id } = params;

    // The Suspense boundary can be used if you have components that use useSWR or React.lazy
    // For now, we'll just show a basic loading state inside the client component.
    return (
        <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
            <ProfileClientPage profileId={id} />
        </Suspense>
    );
}
