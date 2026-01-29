import * as Lucide from 'lucide-react'
import { Badge } from '~/app/components/badge'
import { Card, CardBody, CardHeader, CardTitle } from '~/app/components/card'
import { Progress } from '~/app/components/progress'
import { Text } from '~/app/components/text'
import type { ClusterStatistics } from './types'

interface StorageNodesProps {
  statistics: ClusterStatistics | undefined
}

export function StorageNodes({ statistics }: StorageNodesProps) {
  const nodes = statistics?.nodes || []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Storage Nodes</CardTitle>
      </CardHeader>
      <CardBody>
        {nodes.length > 0 ? (
          nodes.map((node) => (
            <div
              key={node.id}
              className='border-border bg-accent/60 rounded-lg border p-4 transition-colors'
            >
              <div className='mb-3 flex items-start justify-between gap-3'>
                <div className='flex min-w-0 flex-1 items-start gap-3'>
                  <div className='bg-primary/10 mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg'>
                    <Lucide.Server className='text-primary size-4' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <Text className='mb-1 font-medium'>{node.hostname}</Text>
                    <div className='flex items-center gap-4 text-xs'>
                      <span className='text-dimmed'>{node.id}</span>
                      <span className='text-border'>•</span>
                      <span className='text-dimmed'>
                        {node.partitions} partition{node.partitions !== 1 ? 's' : ''}
                      </span>
                      <span className='text-border'>•</span>
                      <span className='text-dimmed'>
                        {node.capacity} / {node.dataAvailable.percentage}% used
                      </span>
                    </div>
                  </div>
                </div>
                <Badge variant='primary' pill size='sm'>
                  {node.zone}
                </Badge>
              </div>
              <Progress value={node.dataAvailable.percentage} className='mb-1.5' />
            </div>
          ))
        ) : (
          <div className='border-border bg-accent flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center'>
            <div className='bg-primary/10 mb-3 flex size-12 items-center justify-center rounded-full'>
              <Lucide.HardDrive className='text-primary size-6' />
            </div>
            <Text className='mb-1 text-sm font-medium'>No storage nodes available</Text>
            <Text className='text-dimmed text-xs'>
              Add storage nodes to your cluster to get started
            </Text>
          </div>
        )}
      </CardBody>
    </Card>
  )
}
