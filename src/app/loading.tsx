
// src/app/loading.tsx
import { Skeleton } from '@/components/ui/skeleton';
import { TopUsersWidget } from '@/components/TopUsersWidget';
import { AutoNewsWidget } from '@/components/AutoNewsWidget';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-12 w-full" />
            {[...Array(2)].map((_, i) => (
                <div key={i} className="border rounded-xl p-4 space-y-4 holographic-panel">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1">
                            <Skeleton className="h-4 w-32 mb-2" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    </div>
                    <Skeleton className="aspect-video w-full rounded-lg" />
                </div>
            ))}
        </div>
        <aside className="hidden lg:col-span-1 space-y-6 lg:block">
            <TopUsersWidget topAuthors={[]} loading={true} />
            <AutoNewsWidget news={[]} loading={true} />
        </aside>
      </div>
    </div>
  )
}
