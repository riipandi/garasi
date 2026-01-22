import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import { fetcher } from '~/app/fetcher'
import type { Bucket } from './-partials/types'

// Code split browse tab component using React.lazy
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
    queryFn: () => fetcher<{ success: boolean; data: Bucket }>(`/bucket/${bucketId}`)
  })
}

// Helper function to format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

// Helper function to get bucket display name
function getBucketDisplayName(bucket: Bucket): string {
  // Prefer global alias, then local alias, then bucket ID
  if (bucket.globalAliases && bucket.globalAliases.length > 0) {
    return bucket.globalAliases[0]!
  }
  if (bucket.localAliases && bucket.localAliases.length > 0) {
    return bucket.localAliases[0]!.alias
  }
  return bucket.id
}

function RouteComponent() {
  const { queryClient } = Route.useRouteContext()
  const { id } = Route.useParams()
  const search = Route.useSearch()
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  // Fetch bucket info
  const { data: bucketData, refetch } = useSuspenseQuery(bucketQuery(id))
  const bucket = bucketData?.data

  if (!bucket) {
    return (
      <div className='mx-auto max-w-screen-2xl space-y-6'>
        <div className='rounded-lg border border-red-200 bg-white px-8 py-6 text-center shadow-md'>
          <h2 className='mb-2 text-xl font-semibold text-red-600'>Bucket not found</h2>
          <p className='mb-4 text-sm text-gray-500'>The bucket you're looking for doesn't exist.</p>
          <Link to='/buckets' className='text-blue-600 hover:text-blue-800'>
            Back to Buckets
          </Link>
        </div>
      </div>
    )
  }

  const displayName = getBucketDisplayName(bucket)

  // Handle refresh button click
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refetch()
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className='mx-auto w-full max-w-screen-2xl space-y-6'>
      {/* Breadcrumb Navigation */}
      <nav className='flex items-center gap-2 text-sm'>
        <Link
          to='/buckets'
          className='flex items-center gap-1 text-gray-500 transition-colors hover:text-gray-700'
        >
          <Lucide.Home className='size-4' />
          <span>Buckets</span>
        </Link>
        <Lucide.ChevronRight className='size-4 text-gray-400' />
        <span className='truncate font-medium text-gray-900'>{displayName}</span>
      </nav>

      {/* Page Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='space-y-1'>
          <h1 className='text-2xl font-bold text-gray-900 sm:text-3xl'>{displayName}</h1>
          {displayName !== bucket.id && (
            <p className='text-sm text-gray-500'>
              ID:{' '}
              <code className='rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-600'>
                {bucket.id}
              </code>
            </p>
          )}
        </div>
        <div className='flex gap-2'>
          <button
            type='button'
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
              isRefreshing ? 'animate-pulse' : ''
            }`}
            title='Refresh'
          >
            {isRefreshing ? (
              <svg className='size-4 animate-spin' fill='none' viewBox='0 0 24 24'>
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                />
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                />
              </svg>
            ) : (
              <Lucide.RefreshCw className='size-4' />
            )}
          </button>
          <Link
            to='/buckets/$id/settings'
            params={{ id }}
            className='inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
          >
            <Lucide.Settings2 className='size-4' />
            Settings
          </Link>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className='grid grid-cols-2 gap-4 rounded-xl border border-gray-200 bg-white p-4 sm:grid-cols-4'>
        <div className='flex items-center gap-3'>
          <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50'>
            <Lucide.FileText className='size-5 text-blue-600' />
          </div>
          <div className='min-w-0'>
            <p className='text-xs font-medium text-gray-500'>Objects</p>
            <p className='text-sm font-semibold text-gray-900'>{bucket.objects}</p>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-purple-50'>
            <Lucide.HardDrive className='size-5 text-purple-600' />
          </div>
          <div className='min-w-0'>
            <p className='text-xs font-medium text-gray-500'>Size</p>
            <p className='text-sm font-semibold text-gray-900'>{formatBytes(bucket.bytes)}</p>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-green-50'>
            <Lucide.Calendar className='size-5 text-green-600' />
          </div>
          <div className='min-w-0'>
            <p className='text-xs font-medium text-gray-500'>Created</p>
            <p className='text-sm font-semibold text-gray-900'>
              {new Date(bucket.created).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <div
            className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
              bucket.websiteAccess ? 'bg-emerald-50' : 'bg-gray-100'
            }`}
          >
            <Lucide.Globe
              className={`size-5 ${bucket.websiteAccess ? 'text-emerald-600' : 'text-gray-400'}`}
            />
          </div>
          <div className='min-w-0'>
            <p className='text-xs font-medium text-gray-500'>Website</p>
            <p
              className={`text-sm font-semibold ${
                bucket.websiteAccess ? 'text-emerald-600' : 'text-gray-500'
              }`}
            >
              {bucket.websiteAccess ? 'Enabled' : 'Disabled'}
            </p>
          </div>
        </div>
      </div>

      {/* Object Browser */}
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

// Loading fallback component for Suspense
function ObjectBrowserFallback() {
  return (
    <div className='animate-in fade-in flex items-center justify-center py-12 duration-300'>
      <div className='flex flex-col items-center gap-4'>
        <svg className='size-8 animate-spin text-blue-600' fill='none' viewBox='0 0 24 24'>
          <circle
            className='opacity-25'
            cx='12'
            cy='12'
            r='10'
            stroke='currentColor'
            strokeWidth='4'
          />
          <path
            className='opacity-75'
            fill='currentColor'
            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
          />
        </svg>
        <p className='text-sm text-gray-500'>Loading bucket content...</p>
      </div>
    </div>
  )
}
