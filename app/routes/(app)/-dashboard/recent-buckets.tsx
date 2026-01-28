import { Link } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import { Badge } from '~/app/components/badge'
import { Button } from '~/app/components/button'
import { Card, CardBody, CardHeader, CardTitle } from '~/app/components/card'
import { IconBox } from '~/app/components/icon-box'
import { Stack } from '~/app/components/stack'
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
        <CardTitle>Recent Buckets</CardTitle>
        <Link
          to='/buckets'
          className='text-primary hover:text-primary/80 inline-flex items-center gap-1 text-sm font-medium'
        >
          View All
          <Lucide.ArrowRight className='size-4' />
        </Link>
      </CardHeader>
      <CardBody>
        <Stack spacing='sm'>
          {buckets.length > 0 ? (
            buckets.slice(0, 5).map((bucket) => (
              <Link
                key={bucket.id}
                to='/buckets'
                className='border-border bg-accent hover:bg-accent/80 flex items-center justify-between rounded-lg border p-3 transition-colors'
              >
                <div className='min-w-0 flex-1'>
                  <div className='flex items-center gap-3'>
                    <IconBox variant='secondary-subtle' size='md' circle>
                      <Lucide.Database className='size-4' />
                    </IconBox>
                    <div className='min-w-0 flex-1'>
                      <p className='truncate font-medium'>
                        {bucket.globalAliases &&
                        bucket.globalAliases.length > 0 &&
                        bucket.globalAliases[0]
                          ? bucket.globalAliases[0]
                          : bucket.id}
                      </p>
                      <div className='mt-1 flex items-center gap-2'>
                        <Text className='text-dimmed font-mono text-xs'>{bucket.id}</Text>
                        {bucket.created && (
                          <>
                            <span className='text-border'>•</span>
                            <Text className='text-dimmed text-xs'>
                              {formatDate(bucket.created)}
                            </Text>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className='ml-4 flex items-center gap-2'>
                  {bucket.globalAliases.length > 0 && (
                    <Badge variant='success' pill size='sm'>
                      {bucket.globalAliases.length} alias
                      {bucket.globalAliases.length > 1 ? 'es' : ''}
                    </Badge>
                  )}
                  <Lucide.ChevronRight className='text-dimmed size-4' />
                </div>
              </Link>
            ))
          ) : (
            <div className='border-border bg-accent flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center'>
              <IconBox variant='secondary-subtle' size='lg' circle className='mb-2'>
                <Lucide.Database className='size-5.5' />
              </IconBox>
              <p className='font-medium'>No buckets found</p>
              <Text className='text-dimmed text-sm'>Create your first bucket to get started</Text>
              <Link to='/buckets'>
                <Button variant='primary' size='sm' className='mt-3'>
                  <Lucide.Plus className='size-3.5' />
                  Create Bucket
                </Button>
              </Link>
            </div>
          )}
        </Stack>
        {buckets.length > 5 && (
          <div className='bg-accent mt-4 flex items-center justify-between rounded-lg px-3 py-2'>
            <Text className='text-dimmed text-xs'>
              Showing 5 of {buckets.length} bucket{buckets.length > 1 ? 's' : ''}
            </Text>
          </div>
        )}
      </CardBody>
    </Card>
  )
}
