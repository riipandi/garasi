import { Link } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import type { BucketResponse } from './types'

interface RecentBucketsProps {
  buckets: BucketResponse[]
}

export function RecentBuckets({ buckets }: RecentBucketsProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className='rounded-lg border border-gray-200 bg-white p-6'>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-lg font-semibold text-gray-900'>Recent Buckets</h2>
        <Link
          to='/buckets'
          className='flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700'
        >
          View All
          <Lucide.ArrowRight className='size-4' />
        </Link>
      </div>

      <div className='space-y-2'>
        {buckets.length > 0 ? (
          buckets.slice(0, 5).map((bucket) => (
            <Link
              key={bucket.id}
              to='/buckets'
              className='flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 transition-colors hover:bg-gray-100'
            >
              <div className='min-w-0 flex-1'>
                <div className='flex items-center gap-2'>
                  <Lucide.Database className='size-4 text-gray-400' />
                  <div className='min-w-0 flex-1'>
                    <p className='truncate font-medium text-gray-900'>
                      {bucket.globalAliases &&
                      bucket.globalAliases.length > 0 &&
                      bucket.globalAliases[0]
                        ? bucket.globalAliases[0]
                        : bucket.id}
                    </p>
                    <div className='mt-1 flex items-center gap-2'>
                      <p className='truncate font-mono text-xs text-gray-500'>{bucket.id}</p>
                      {bucket.created && (
                        <>
                          <span className='text-gray-300'>•</span>
                          <p className='text-xs text-gray-500'>{formatDate(bucket.created)}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className='ml-4 flex items-center gap-2'>
                {bucket.globalAliases.length > 0 && (
                  <span className='rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800'>
                    {bucket.globalAliases.length} alias{bucket.globalAliases.length > 1 ? 'es' : ''}
                  </span>
                )}
                <Lucide.ChevronRight className='size-4 text-gray-400' />
              </div>
            </Link>
          ))
        ) : (
          <div className='flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center'>
            <Lucide.Database className='mb-2 size-8 text-gray-400' />
            <p className='text-sm font-medium text-gray-700'>No buckets found</p>
            <p className='mt-1 text-xs text-gray-500'>Create your first bucket to get started</p>
            <Link
              to='/buckets'
              className='mt-3 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700'
            >
              <Lucide.Plus className='size-3.5' />
              Create Bucket
            </Link>
          </div>
        )}
      </div>

      {buckets.length > 5 && (
        <div className='mt-4 flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2'>
          <span className='text-xs text-gray-500'>
            Showing 5 of {buckets.length} bucket{buckets.length > 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  )
}
