// src/app/loading.tsx
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center gap-8">
        <div className="w-full max-w-[640px] space-y-6">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-12 w-full" />
            {[...Array(3)].map((_, i) => (
                <div key={i} className="border rounded-xl p-4 space-y-4">
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
        <div className="hidden xl:block w-[350px] space-y-6">
            <Skeleton className="h-96 w-full" />
        </div>
      </div>
    </div>
  )
}
