import { Link } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import { Badge } from '~/app/components/badge'
import { Card, CardBody, CardHeader, CardTitle } from '~/app/components/card'
import { IconBox } from '~/app/components/icon-box'
import { Progress, ProgressLabel, ProgressValue } from '~/app/components/progress'
import { Stack } from '~/app/components/stack'
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
        <Link
          to='/cluster'
          className='text-primary hover:text-primary/80 inline-flex items-center gap-1 text-sm font-medium'
        >
          View All
          <Lucide.ArrowRight className='size-4' />
        </Link>
      </CardHeader>
      <CardBody>
        <Stack spacing='sm'>
          {nodes.length > 0 ? (
            nodes.map((node) => (
              <div key={node.id} className='border-border bg-accent rounded-lg border p-4'>
                <div className='mb-3 flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <IconBox variant='primary-subtle' size='sm' circle>
                      <Lucide.Server className='size-4' />
                    </IconBox>
                    <p className='font-medium'>{node.hostname}</p>
                  </div>
                  <Badge variant='primary' pill size='sm'>
                    {node.zone}
                  </Badge>
                </div>

                <Stack spacing='md'>
                  <div>
                    <Progress value={node.dataAvailable.percentage} className='mb-1.5'>
                      <ProgressLabel>Data Storage</ProgressLabel>
                      <ProgressValue />
                    </Progress>
                    <Text className='text-dimmed text-xs'>
                      {node.dataAvailable.used} of {node.dataAvailable.total}
                    </Text>
                  </div>

                  <div>
                    <Progress value={node.metaAvailable.percentage} className='mb-1.5'>
                      <ProgressLabel>Metadata Storage</ProgressLabel>
                      <ProgressValue />
                    </Progress>
                    <Text className='text-dimmed text-xs'>
                      {node.metaAvailable.used} of {node.metaAvailable.total}
                    </Text>
                  </div>
                </Stack>

                <div className='bg-card mt-3 grid grid-cols-2 gap-2 rounded-lg p-2'>
                  <div className='flex items-center gap-1.5'>
                    <Lucide.Layers className='text-dimmed size-3.5' />
                    <Text className='text-dimmed text-xs'>Partitions:</Text>
                    <Text className='text-xs'>{node.partitions}</Text>
                  </div>
                  <div className='flex items-center gap-1.5'>
                    <Lucide.Database className='text-dimmed size-3.5' />
                    <Text className='text-dimmed text-xs'>Capacity:</Text>
                    <Text className='text-xs'>{node.capacity}</Text>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className='border-border bg-accent flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center'>
              <IconBox variant='secondary-subtle' size='lg' circle className='mb-2'>
                <Lucide.HardDrive className='size-5.5' />
              </IconBox>
              <p className='font-medium'>No storage nodes available</p>
            </div>
          )}
        </Stack>
      </CardBody>
    </Card>
  )
}
