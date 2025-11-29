
import { Skeleton } from "@/components/ui/skeleton"

export function ProfilePageSkeleton() {
    return (
      <div className="min-h-screen -m-8">
        <Skeleton className="h-[500px] w-full" />
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8">
                 <div className="hidden lg:block space-y-6">
                    <Skeleton className="h-40 w-full rounded-2xl" />
                    <Skeleton className="h-32 w-full rounded-2xl" />
                 </div>
                 <div>
                    <Skeleton className="h-12 w-full rounded-lg" />
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Skeleton className="h-48 w-full rounded-2xl" />
                        <Skeleton className="h-48 w-full rounded-2xl" />
                    </div>
                 </div>
            </div>
        </div>
      </div>
    )
}
