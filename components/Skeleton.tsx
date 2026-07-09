export default function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
}

export function DashboardSkeleton() {
  return (
    <div>
      <Skeleton className="h-9 w-40 mb-4" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 flex flex-col gap-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <Skeleton className="h-4 w-40 mb-4" />
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <Skeleton className="h-4 w-24 mb-4" />
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        </div>
      </div>
      <Skeleton className="h-4 w-32 mb-2" />
      <Skeleton className="h-24 w-full rounded-lg" />
    </div>
  )
}

export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div>
      <Skeleton className="h-9 w-48 mb-4" />
      <Skeleton className="h-12 w-full mb-4 rounded-xl" />
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <div className="h-10 bg-gray-100" />
        <div className="divide-y divide-gray-100">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
