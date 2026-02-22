import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import { Button } from '~/app/components/button'
import { IconBox } from '~/app/components/icon-box'
import { Stack } from '~/app/components/stack'
import { Text } from '~/app/components/typography'
import { Heading } from '~/app/components/typography'
import bucketService from '~/app/services/bucket.service'
import { clx } from '~/app/utils'
import type { GetBucketInfoResponse } from '~/shared/schemas/bucket.schema'

const ObjectBrowser = React.lazy(() =>
  import('./-partials/object-browser').then((m) => ({ default: m.ObjectBrowser }))
)

export const Route = createFileRoute('/(app)/buckets/$id/')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => ({
    prefix: typeof search.prefix === 'string' ? search.prefix : undefined,
    key: typeof search.key === 'string' ? search.key : undefined
  }),
  loader: ({ context, params }) => {
    context.queryClient.ensureQueryData(bucketQuery(params.id))
  }
})

function bucketQuery(bucketId: string) {
  return queryOptions({
    queryKey: ['bucket', bucketId],
    queryFn: () => bucketService.getBucketInfo({ id: bucketId })
  })
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

function getBucketDisplayName(bucket: GetBucketInfoResponse): string {
  if (
    bucket.globalAliases &&
    Array.isArray(bucket.globalAliases) &&
    bucket.globalAliases.length > 0
  ) {
    const alias = bucket.globalAliases[0]
    if (alias) {
      return alias
    }
  }
  return bucket.id
}

function RouteComponent() {
  const { queryClient } = Route.useRouteContext()
  const { id } = Route.useParams()
  const search = Route.useSearch()
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const { data: bucketData, refetch } = useSuspenseQuery(bucketQuery(id))
  const bucket = bucketData?.data

  if (!bucket) {
    return (
      <div className='mx-auto w-full max-w-7xl space-y-6'>
        <div className='border-danger/20 bg-danger/5 flex flex-col items-center gap-4 rounded-lg border px-8 py-6 text-center'>
          <IconBox variant='danger' size='lg' circle>
            <Lucide.AlertTriangle className='size-12' />
          </IconBox>
          <Stack>
            <Heading level={2} className='text-danger'>
              Bucket not found
            </Heading>
            <Text className='text-muted-foreground'>
              The bucket you're looking for doesn't exist.
            </Text>
            <Link to='/buckets' className='text-primary hover:text-primary/80'>
              Back to Buckets
            </Link>
          </Stack>
        </div>
      </div>
    )
  }

  const displayName = getBucketDisplayName(bucket)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refetch()
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <React.Suspense fallback={<PageFallback />}>
      <div className='mx-auto w-full max-w-7xl space-y-6'>
        <div className='flex items-start gap-4'>
          <Link
            to='/buckets'
            className='hover:bg-dimmed/10 rounded-md p-2 text-gray-500 transition-colors hover:text-gray-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
          >
            <Lucide.ArrowLeft className='size-5' />
          </Link>
          <div className='min-w-0 flex-1'>
            <div className='flex items-center justify-between gap-3'>
              <div className='flex items-center gap-3'>
                <Heading level={1} size='lg'>
                  {displayName}
                </Heading>
              </div>
              <div className='flex items-center gap-4'>
                <Button
                  variant='outline'
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  progress={isRefreshing}
                >
                  <Lucide.RefreshCw className='size-4' />
                  Refresh
                </Button>
                <Link to='/buckets/$id/settings' params={{ id }}>
                  <Button variant='outline'>
                    <Lucide.Settings2 className='size-4' />
                    Settings
                  </Button>
                </Link>
              </div>
            </div>
            {displayName !== bucket.id && (
              <Text className='text-normal mt-1 text-sm text-gray-500'>
                ID: <code className='font-mono'>{bucket.id}</code>
              </Text>
            )}
          </div>
        </div>

        <div className='border-border bg-background grid grid-cols-2 gap-4 rounded-xl border p-4 sm:grid-cols-4'>
          {isRefreshing ? (
            <>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={`skeleton-${i}`} className='flex items-center gap-3'>
                  <div className='bg-dimmed/10 size-10 animate-pulse rounded-full' />
                  <div className='min-w-0 flex-1 space-y-2'>
                    <div className='bg-dimmed/10 h-3 w-20 animate-pulse rounded' />
                    <div className='bg-dimmed/10 h-4 w-24 animate-pulse rounded' />
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              <div className='flex items-center gap-3'>
                <IconBox variant='info' size='md'>
                  <Lucide.FileText className='size-5' />
                </IconBox>
                <div className='min-w-0'>
                  <Text className='text-muted-foreground text-xs font-medium'>Objects</Text>
                  <Text className='text-sm font-semibold'>{bucket.objects}</Text>
                </div>
              </div>
              <div className='flex items-center gap-3'>
                <IconBox variant='tertiary' size='md'>
                  <Lucide.HardDrive className='size-5' />
                </IconBox>
                <div className='min-w-0'>
                  <Text className='text-muted-foreground text-xs font-medium'>Size</Text>
                  <Text className='text-sm font-semibold'>{formatBytes(bucket.bytes)}</Text>
                </div>
              </div>
              <div className='flex items-center gap-3'>
                <IconBox variant='success' size='md'>
                  <Lucide.Calendar className='size-5' />
                </IconBox>
                <div className='min-w-0'>
                  <Text className='text-muted-foreground text-xs font-medium'>Created</Text>
                  <Text className='text-sm font-semibold'>
                    {new Date(bucket.created).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </Text>
                </div>
              </div>
              <div className='flex items-center gap-3'>
                <IconBox variant={bucket.websiteAccess ? 'success' : 'secondary-subtle'} size='md'>
                  <Lucide.Globe className='size-5' />
                </IconBox>
                <div className='min-w-0'>
                  <Text className='text-muted-foreground text-xs font-medium'>Website</Text>
                  <Text
                    className={clx(
                      'text-sm font-semibold',
                      bucket.websiteAccess ? 'text-success' : 'text-muted-foreground'
                    )}
                  >
                    {bucket.websiteAccess ? 'Enabled' : 'Disabled'}
                  </Text>
                </div>
              </div>
            </>
          )}
        </div>

        <ObjectBrowser
          queryClient={queryClient}
          bucket={bucket}
          bucketId={id}
          prefix={search.prefix}
          key={search.key}
          isRefreshing={isRefreshing}
        />
      </div>
    </React.Suspense>
  )
}

function PageFallback() {
  return (
    <div className='mx-auto w-full max-w-7xl space-y-6'>
      <div className='flex items-start gap-4'>
        <div className='size-9'></div>
        <div className='min-w-0 flex-1 space-y-4'>
          <div className='bg-dimmed/10 flex h-8 w-64 animate-pulse rounded' />
          <div className='bg-dimmed/10 flex h-4 w-48 animate-pulse rounded' />
        </div>
      </div>

      <div className='border-border bg-background grid grid-cols-2 gap-4 rounded-xl border p-4 sm:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={`page-skeleton-${i}`} className='flex items-center gap-3'>
            <div className='bg-dimmed/10 size-10 animate-pulse rounded-full' />
            <div className='min-w-0 flex-1 space-y-2'>
              <div className='bg-dimmed/10 h-3 w-20 animate-pulse rounded' />
              <div className='bg-dimmed/10 h-4 w-24 animate-pulse rounded' />
            </div>
          </div>
        ))}
      </div>

      <div className='border-border bg-muted/5 rounded-lg border-2 border-dashed px-6 py-12 text-center'>
        <div className='flex flex-col items-center gap-4'>
          <div className='bg-dimmed/10 size-12 animate-pulse rounded-full' />
          <div className='bg-dimmed/10 h-4 w-32 animate-pulse rounded' />
        </div>
      </div>
    </div>
  )
}
