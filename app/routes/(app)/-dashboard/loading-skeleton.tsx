/**
 * Loading Skeleton Components for Dashboard
 *
 * These components provide visual feedback during data loading,
 * improving perceived performance and user experience.
 */

export function DashboardSkeleton() {
  return (
    <div className='space-y-6'>
      {/* Header Skeleton */}
      <div className='space-y-2'>
        <div className='h-8 w-64 animate-pulse rounded-lg bg-gray-200' />
        <div className='h-4 w-96 animate-pulse rounded bg-gray-200' />
      </div>

      {/* Stats Grid Skeleton */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {[...Array(4)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Main Content Grid Skeleton */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <QuickLinksSkeleton />
        <ClusterInfoSkeleton />
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <StorageNodesSkeleton />
        <RecentBucketsSkeleton />
      </div>
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className='rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6'>
      <div className='flex items-start justify-between'>
        <div className='flex-1'>
          <div className='mb-2 h-3 w-24 animate-pulse rounded bg-gray-200' />
          <div className='mb-1 h-8 w-32 animate-pulse rounded bg-gray-300' />
          <div className='h-3 w-40 animate-pulse rounded bg-gray-200' />
        </div>
        <div className='h-12 w-12 animate-pulse rounded-xl bg-gray-200' />
      </div>
    </div>
  )
}

export function QuickLinksSkeleton() {
  return (
    <div className='rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6'>
      <div className='mb-4 flex items-center justify-between'>
        <div className='space-y-1'>
          <div className='h-5 w-28 animate-pulse rounded bg-gray-200' />
          <div className='h-3 w-40 animate-pulse rounded bg-gray-200' />
        </div>
        <div className='h-10 w-10 animate-pulse rounded-xl bg-gray-200' />
      </div>
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
        {[...Array(4)].map((_, i) => (
          <div key={i} className='flex items-start gap-3 rounded-lg border border-gray-200 p-4'>
            <div className='h-10 w-10 animate-pulse rounded-lg bg-gray-200' />
            <div className='flex-1 space-y-2'>
              <div className='h-4 w-24 animate-pulse rounded bg-gray-200' />
              <div className='h-3 w-32 animate-pulse rounded bg-gray-200' />
            </div>
            <div className='h-5 w-5 animate-pulse rounded bg-gray-200' />
          </div>
        ))}
      </div>
    </div>
  )
}

export function ClusterInfoSkeleton() {
  return (
    <div className='rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6'>
      <div className='mb-4 flex items-center justify-between'>
        <div className='space-y-1'>
          <div className='h-5 w-36 animate-pulse rounded bg-gray-200' />
          <div className='h-3 w-48 animate-pulse rounded bg-gray-200' />
        </div>
        <div className='h-10 w-10 animate-pulse rounded-xl bg-gray-200' />
      </div>

      {/* Status Badge Skeleton */}
      <div className='mb-4 flex items-center justify-between rounded-lg border border-gray-200 p-3'>
        <div className='flex items-center gap-2'>
          <div className='h-5 w-5 animate-pulse rounded-full bg-gray-200' />
          <div className='h-4 w-24 animate-pulse rounded bg-gray-200' />
        </div>
        <div className='h-6 w-20 animate-pulse rounded-full bg-gray-200' />
      </div>

      {/* Progress Bars Skeleton */}
      <div className='space-y-3'>
        {[...Array(2)].map((_, i) => (
          <div key={i} className='rounded-lg border border-gray-200 p-3'>
            <div className='mb-2 flex items-center justify-between'>
              <div className='h-3 w-28 animate-pulse rounded bg-gray-200' />
              <div className='h-3 w-12 animate-pulse rounded bg-gray-200' />
            </div>
            <div className='h-2 w-full animate-pulse rounded-full bg-gray-200' />
          </div>
        ))}
      </div>

      {/* Info Grid Skeleton */}
      <div className='mt-4 grid grid-cols-2 gap-3'>
        {[...Array(4)].map((_, i) => (
          <div key={i} className='space-y-1'>
            <div className='h-2 w-20 animate-pulse rounded bg-gray-200' />
            <div className='h-4 w-16 animate-pulse rounded bg-gray-300' />
          </div>
        ))}
      </div>
    </div>
  )
}

export function StorageNodesSkeleton() {
  return (
    <div className='rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6'>
      <div className='mb-4 flex items-center justify-between'>
        <div className='space-y-1'>
          <div className='h-5 w-32 animate-pulse rounded bg-gray-200' />
          <div className='h-3 w-40 animate-pulse rounded bg-gray-200' />
        </div>
        <div className='h-10 w-10 animate-pulse rounded-xl bg-gray-200' />
      </div>

      <div className='space-y-3'>
        {[...Array(3)].map((_, i) => (
          <div key={i} className='rounded-lg border border-gray-200 p-4'>
            <div className='mb-3 flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <div className='h-8 w-8 animate-pulse rounded-lg bg-gray-200' />
                <div className='h-4 w-32 animate-pulse rounded bg-gray-200' />
              </div>
              <div className='h-5 w-16 animate-pulse rounded-full bg-gray-200' />
            </div>

            <div className='space-y-3'>
              {[...Array(2)].map((_, j) => (
                <div key={j}>
                  <div className='mb-1.5 flex items-center justify-between'>
                    <div className='h-2.5 w-24 animate-pulse rounded bg-gray-200' />
                    <div className='h-2.5 w-10 animate-pulse rounded bg-gray-200' />
                  </div>
                  <div className='h-2 w-full animate-pulse rounded-full bg-gray-200' />
                  <div className='mt-1 h-2 w-28 animate-pulse rounded bg-gray-200' />
                </div>
              ))}
            </div>

            <div className='mt-3 grid grid-cols-2 gap-2 rounded-lg bg-gray-50 p-2'>
              {[...Array(2)].map((_, j) => (
                <div key={j} className='flex items-center gap-1.5'>
                  <div className='h-3.5 w-3.5 animate-pulse rounded bg-gray-200' />
                  <div className='h-2 w-16 animate-pulse rounded bg-gray-200' />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function RecentBucketsSkeleton() {
  return (
    <div className='rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6'>
      <div className='mb-4 flex items-center justify-between'>
        <div className='space-y-1'>
          <div className='h-5 w-32 animate-pulse rounded bg-gray-200' />
          <div className='h-3 w-36 animate-pulse rounded bg-gray-200' />
        </div>
        <div className='h-10 w-10 animate-pulse rounded-xl bg-gray-200' />
      </div>

      <div className='space-y-3'>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className='flex items-start justify-between rounded-lg border border-gray-200 p-4'
          >
            <div className='min-w-0 flex-1'>
              <div className='flex items-center gap-2'>
                <div className='h-8 w-8 animate-pulse rounded-lg bg-gray-200' />
                <div className='flex-1 space-y-1'>
                  <div className='h-4 w-40 animate-pulse rounded bg-gray-200' />
                  <div className='flex items-center gap-2'>
                    <div className='h-2.5 w-32 animate-pulse rounded bg-gray-200' />
                    <div className='h-2 w-0.5 animate-pulse rounded bg-gray-200' />
                    <div className='h-2.5 w-16 animate-pulse rounded bg-gray-200' />
                  </div>
                </div>
              </div>
            </div>
            <div className='ml-4 flex flex-col items-end gap-2'>
              <div className='h-5 w-16 animate-pulse rounded-full bg-gray-200' />
              <div className='h-4 w-4 animate-pulse rounded bg-gray-200' />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
