import * as Lucide from 'lucide-react'

interface Bucket {
  id: string
  created: string
  globalAliases: string[]
  localAliases: Array<{
    accessKeyId: string
    alias: string
  }>
}

interface RecentBucketsProps {
  buckets: Bucket[]
}

export function RecentBuckets({ buckets }: RecentBucketsProps) {
  return (
    <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6'>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-lg font-semibold sm:text-xl'>Recent Buckets</h2>
        <Lucide.Database className='size-5 text-gray-400' />
      </div>

      <div className='space-y-3'>
        {buckets.length > 0 ? (
          buckets.slice(0, 5).map((bucket) => (
            <div
              key={bucket.id}
              className='flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3'
            >
              <div className='flex-1'>
                <p className='font-medium text-gray-900'>
                  {bucket.globalAliases &&
                  bucket.globalAliases.length > 0 &&
                  bucket.globalAliases[0]
                    ? bucket.globalAliases[0]
                    : bucket.id}
                </p>
                <p className='text-xs text-gray-500'>{bucket.id}</p>
              </div>
              <div className='flex items-center gap-2'>
                {bucket.globalAliases.length > 0 && (
                  <span className='rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800'>
                    {bucket.globalAliases.length} alias{bucket.globalAliases.length > 1 ? 'es' : ''}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className='rounded border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700'>
            No buckets found
          </div>
        )}
      </div>

      {buckets.length > 5 && (
        <div className='mt-4 text-center'>
          <p className='text-sm text-gray-500'>
            Showing 5 of {buckets.length} buckets.{' '}
            <span className='cursor-pointer font-medium text-blue-600 hover:text-blue-700'>
              View all buckets
            </span>
          </p>
        </div>
      )}
    </div>
  )
}
