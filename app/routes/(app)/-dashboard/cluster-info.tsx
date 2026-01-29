import { Card, CardBody, CardHeader, CardTitle } from '~/app/components/card'
import { Text } from '~/app/components/text'
import type { ClusterHealthResponse, ClusterStatistics } from './types'

interface ClusterInfoProps {
  health: ClusterHealthResponse | undefined
  statistics: ClusterStatistics | undefined
}

export function ClusterInfo({ health, statistics }: ClusterInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cluster Overview</CardTitle>
      </CardHeader>
      <CardBody className='grid grid-cols-2 gap-x-4 gap-y-5'>
        <div>
          <Text className='text-dimmed mb-1 text-xs tracking-wide uppercase'>Nodes</Text>
          <Text className='text-xl font-semibold'>
            {health?.connectedNodes || 0}/{health?.knownNodes || 0}
          </Text>
          <Text className='text-dimmed text-xs'>connected/known</Text>
        </div>
        <div>
          <Text className='text-dimmed mb-1 text-xs tracking-wide uppercase'>Partitions</Text>
          <Text className='text-xl font-semibold'>
            {health?.partitionsAllOk || 0} / {health?.partitions || 0}
          </Text>
          <Text className='text-dimmed text-xs'>healthy / total</Text>
        </div>
        <div>
          <Text className='text-dimmed mb-1 text-xs tracking-wide uppercase'>Data Storage</Text>
          <Text className='text-base font-medium'>{statistics?.clusterWide.data || 'N/A'}</Text>
        </div>
        <div>
          <Text className='text-dimmed mb-1 text-xs tracking-wide uppercase'>Metadata</Text>
          <Text className='text-base font-medium'>{statistics?.clusterWide.metadata || 'N/A'}</Text>
        </div>
      </CardBody>
    </Card>
  )
}
