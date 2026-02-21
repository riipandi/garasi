import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbButton,
  BreadcrumbSeparator
} from '~/app/components/breadcrumb'
import { Button } from '~/app/components/button'
import { IconBox } from '~/app/components/icon-box'
import { Spinner } from '~/app/components/spinner'
import { Stack } from '~/app/components/stack'
import { Text } from '~/app/components/typography'
import { Heading } from '~/app/components/typography'
import bucketService from '~/app/services/bucket.service'
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
    <div className='mx-auto w-full max-w-7xl space-y-6'>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbButton render={<Link to='/buckets' />}>
              <Lucide.Home className='size-4' />
              Buckets
            </BreadcrumbButton>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbButton active>{displayName}</BreadcrumbButton>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='space-y-1'>
          <Heading size='lg'>{displayName}</Heading>
          {displayName !== bucket.id && (
            <Text className='text-sm'>
              ID:{' '}
              <Text className='bg-muted rounded px-1.5 py-0.5 font-mono text-xs'>{bucket.id}</Text>
            </Text>
          )}
        </div>
        <div className='flex gap-2'>
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

      <div className='border-border bg-background grid grid-cols-2 gap-4 rounded-xl border p-4 sm:grid-cols-4'>
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
              className={`text-sm font-semibold ${bucket.websiteAccess ? 'text-success' : 'text-muted-foreground'}`}
            >
              {bucket.websiteAccess ? 'Enabled' : 'Disabled'}
            </Text>
          </div>
        </div>
      </div>

      <React.Suspense fallback={<ObjectBrowserFallback />}>
        <ObjectBrowser
          queryClient={queryClient}
          bucket={bucket}
          bucketId={id}
          prefix={search.prefix}
          key={search.key}
        />
      </React.Suspense>
    </div>
  )
}

function ObjectBrowserFallback() {
  return (
    <div className='animate-in fade-in flex items-center justify-center py-12 duration-300'>
      <div className='flex flex-col items-center gap-4'>
        <Spinner className='text-primary size-8' />
        <Text className='text-muted-foreground text-sm'>Loading bucket content...</Text>
      </div>
    </div>
  )
}
