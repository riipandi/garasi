import * as Lucide from 'lucide-react'
import { Badge } from '~/app/components/badge'
import { Card, CardBody, CardHeader, CardTitle } from '~/app/components/card'
import { Text } from '~/app/components/text'
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
    <Card>
      <CardHeader>
        <CardTitle>Buckets</CardTitle>
      </CardHeader>
      <CardBody>
        {buckets.length > 0 ? (
          buckets.slice(0, 6).map((bucket) => (
            <div
              key={bucket.id}
              className='border-border bg-accent hover:bg-accent/80 flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors'
            >
              <div className='flex min-w-0 flex-1 items-center gap-3'>
                <div className='bg-secondary/10 flex size-9 shrink-0 items-center justify-center rounded-lg'>
                  <Lucide.Database className='text-secondary size-4' />
                </div>
                <div className='min-w-0 flex-1'>
                  <Text className='mb-0.5 truncate text-sm font-medium'>
                    {bucket.globalAliases?.[0] || bucket.id}
                  </Text>
                  <div className='flex items-center gap-2 text-xs'>
                    <Text className='text-dimmed font-mono text-xs'>
                      {bucket.id.slice(0, 8)}...
                    </Text>
                    <span className='text-border'>•</span>
                    <Text className='text-dimmed'>{formatDate(bucket.created)}</Text>
                  </div>
                </div>
              </div>
              {bucket.globalAliases.length > 0 && (
                <Badge variant='info' pill size='sm'>
                  {bucket.globalAliases.length} alias{bucket.globalAliases.length > 1 ? 'es' : ''}
                </Badge>
              )}
            </div>
          ))
        ) : (
          <div className='border-border bg-accent/60 flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center'>
            <div className='bg-secondary/10 mb-2 flex size-12 items-center justify-center rounded-full'>
              <Lucide.Database className='text-muted size-8' />
            </div>
            <Text className='mb-1 font-medium'>No buckets found</Text>
            <Text className='text-dimmed text-sm'>Create your first bucket to get started</Text>
          </div>
        )}
        {buckets.length > 6 && (
          <div className='bg-accent mt-3 flex items-center justify-center rounded-lg px-3 py-2'>
            <Text className='text-dimmed text-xs'>
              Showing 6 of {buckets.length} bucket{buckets.length > 1 ? 's' : ''}
            </Text>
          </div>
        )}
      </CardBody>
    </Card>
  )
}
