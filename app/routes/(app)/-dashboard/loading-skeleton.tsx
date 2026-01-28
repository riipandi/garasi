import { Card, CardBody } from '~/app/components/card'

export function DashboardSkeleton() {
  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <div className='bg-card-separator h-8 w-64 animate-pulse rounded-lg' />
        <div className='bg-card-separator h-4 w-96 animate-pulse rounded' />
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {[...Array(4)].map((_, i) => (
          <StatCardSkeleton key={`stat-${i}`} />
        ))}
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        <div className='lg:col-span-2'>
          <ClusterInfoSkeleton />
        </div>
        <QuickLinksSkeleton />
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
    <Card>
      <CardBody>
        <div className='flex items-start justify-between gap-4'>
          <div className='flex-1 space-y-1'>
            <div className='bg-card-separator h-3 w-24 animate-pulse rounded' />
            <div className='bg-card-separator h-8 w-32 animate-pulse rounded' />
            <div className='bg-card-separator h-3 w-40 animate-pulse rounded' />
          </div>
          <div className='bg-card-separator h-12 w-12 animate-pulse rounded-xl' />
        </div>
      </CardBody>
    </Card>
  )
}

export function QuickLinksSkeleton() {
  return (
    <Card>
      <CardBody>
        <div className='mb-4 flex items-center justify-between'>
          <div className='space-y-1'>
            <div className='bg-card-separator h-5 w-28 animate-pulse rounded' />
            <div className='bg-card-separator h-3 w-40 animate-pulse rounded' />
          </div>
          <div className='bg-card-separator h-10 w-10 animate-pulse rounded-xl' />
        </div>
        <div className='space-y-3'>
          {[...Array(4)].map((_, i) => (
            <div
              key={`quick-${i}`}
              className='border-border bg-accent flex items-center gap-3 rounded-lg border p-3'
            >
              <div className='bg-card-separator h-10 w-10 animate-pulse rounded-lg' />
              <div className='flex-1 space-y-2'>
                <div className='bg-card-separator h-4 w-24 animate-pulse rounded' />
                <div className='bg-card-separator h-3 w-32 animate-pulse rounded' />
              </div>
              <div className='bg-card-separator h-5 w-5 animate-pulse rounded' />
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  )
}

export function ClusterInfoSkeleton() {
  return (
    <Card>
      <CardBody>
        <div className='mb-4 flex items-center justify-between'>
          <div className='space-y-1'>
            <div className='bg-card-separator h-5 w-36 animate-pulse rounded' />
            <div className='bg-card-separator h-3 w-48 animate-pulse rounded' />
          </div>
          <div className='bg-card-separator h-10 w-10 animate-pulse rounded-xl' />
        </div>

        <div className='border-border bg-accent mb-4 flex items-center justify-between rounded-lg border p-3'>
          <div className='flex items-center gap-2'>
            <div className='bg-card-separator h-5 w-5 animate-pulse rounded-full' />
            <div className='bg-card-separator h-4 w-24 animate-pulse rounded' />
          </div>
          <div className='bg-card-separator h-6 w-20 animate-pulse rounded-full' />
        </div>

        <div className='space-y-3'>
          {[...Array(2)].map((_, i) => (
            <div key={`section-${i}`} className='border-border rounded-lg border p-3'>
              <div className='mb-2 flex items-center justify-between'>
                <div className='bg-card-separator h-3 w-28 animate-pulse rounded' />
                <div className='bg-card-separator h-3 w-12 animate-pulse rounded' />
              </div>
              <div className='bg-card-separator h-2 w-full animate-pulse rounded-full' />
            </div>
          ))}
        </div>

        <div className='mt-4 grid grid-cols-2 gap-3'>
          {[...Array(4)].map((_, i) => (
            <div key={`info-${i}`} className='space-y-1'>
              <div className='bg-card-separator h-2 w-20 animate-pulse rounded' />
              <div className='bg-card-separator h-4 w-16 animate-pulse rounded' />
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  )
}

export function StorageNodesSkeleton() {
  return (
    <Card>
      <CardBody>
        <div className='mb-4 flex items-center justify-between'>
          <div className='space-y-1'>
            <div className='bg-card-separator h-5 w-32 animate-pulse rounded' />
            <div className='bg-card-separator h-3 w-40 animate-pulse rounded' />
          </div>
          <div className='bg-card-separator h-10 w-10 animate-pulse rounded-xl' />
        </div>

        <div className='space-y-3'>
          {[...Array(3)].map((_, i) => (
            <div key={`node-${i}`} className='border-border bg-accent rounded-lg border p-4'>
              <div className='mb-3 flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='bg-card-separator h-8 w-8 animate-pulse rounded-lg' />
                  <div className='bg-card-separator h-4 w-32 animate-pulse rounded' />
                </div>
                <div className='bg-card-separator h-5 w-16 animate-pulse rounded-full' />
              </div>

              <div className='space-y-3'>
                {[...Array(2)].map((_, j) => (
                  <div key={`progress-${i}-${j}`}>
                    <div className='mb-1.5 flex items-center justify-between'>
                      <div className='bg-card-separator h-2.5 w-24 animate-pulse rounded' />
                      <div className='bg-card-separator h-2.5 w-10 animate-pulse rounded' />
                    </div>
                    <div className='bg-card-separator h-2 w-full animate-pulse rounded-full' />
                    <div className='bg-card-separator mt-1 h-2 w-28 animate-pulse rounded' />
                  </div>
                ))}
              </div>

              <div className='bg-card mt-3 grid grid-cols-2 gap-2 rounded-lg p-2'>
                {[...Array(2)].map((_, j) => (
                  <div key={`meta-${i}-${j}`} className='flex items-center gap-1.5'>
                    <div className='bg-card-separator h-3.5 w-3.5 animate-pulse rounded' />
                    <div className='bg-card-separator h-2 w-16 animate-pulse rounded' />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  )
}

export function RecentBucketsSkeleton() {
  return (
    <Card>
      <CardBody>
        <div className='mb-4 flex items-center justify-between'>
          <div className='space-y-1'>
            <div className='bg-card-separator h-5 w-32 animate-pulse rounded' />
            <div className='bg-card-separator h-3 w-36 animate-pulse rounded' />
          </div>
          <div className='bg-card-separator h-10 w-10 animate-pulse rounded-xl' />
        </div>

        <div className='space-y-3'>
          {[...Array(5)].map((_, i) => (
            <div
              key={`bucket-${i}`}
              className='border-border bg-accent flex items-start justify-between rounded-lg border p-3'
            >
              <div className='min-w-0 flex-1'>
                <div className='flex items-center gap-3'>
                  <div className='bg-card-separator h-8 w-8 animate-pulse rounded-lg' />
                  <div className='flex-1 space-y-1'>
                    <div className='bg-card-separator h-4 w-40 animate-pulse rounded' />
                    <div className='flex items-center gap-2'>
                      <div className='bg-card-separator h-2.5 w-32 animate-pulse rounded' />
                      <div className='bg-card-separator h-2 w-0.5 animate-pulse rounded' />
                      <div className='bg-card-separator h-2.5 w-16 animate-pulse rounded' />
                    </div>
                  </div>
                </div>
              </div>
              <div className='ml-4 flex flex-col items-end gap-2'>
                <div className='bg-card-separator h-5 w-16 animate-pulse rounded-full' />
                <div className='bg-card-separator h-4 w-4 animate-pulse rounded' />
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  )
}
