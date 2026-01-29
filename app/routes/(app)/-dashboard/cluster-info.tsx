import { Card, CardBody, CardHeader, CardTitle } from '~/app/components/card'
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
      <CardBody>
        <dl className='divide-border divide-y'>
          <div className='px-4 py-2.5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0'>
            <dt className='text-foreground text-base font-medium'>Known Nodes</dt>
            <dd className='text-muted mt-1 text-base sm:col-span-2 sm:mt-0'>
              {health?.knownNodes || 0}
            </dd>
          </div>
          <div className='px-4 py-2.5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0'>
            <dt className='text-foreground text-base font-medium'>Connected Nodes</dt>
            <dd className='text-muted mt-1 text-base sm:col-span-2 sm:mt-0'>
              {health?.connectedNodes || 0}
            </dd>
          </div>
          <div className='px-4 py-2.5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0'>
            <dt className='text-foreground text-base font-medium'>Total Partitions</dt>
            <dd className='text-muted mt-1 text-base sm:col-span-2 sm:mt-0'>
              {health?.partitions || 0}
            </dd>
          </div>
          <div className='px-4 py-2.5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0'>
            <dt className='text-foreground text-base font-medium'>Healthy Partitions</dt>
            <dd className='text-muted mt-1 text-base sm:col-span-2 sm:mt-0'>
              {health?.partitionsAllOk || 0}
            </dd>
          </div>
          <div className='px-4 py-2.5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0'>
            <dt className='text-foreground text-base font-medium'>Storage Data</dt>
            <dd className='text-muted mt-1 text-base sm:col-span-2 sm:mt-0'>
              {statistics?.clusterWide.data || 'N/A'}
            </dd>
          </div>
          <div className='px-4 py-2.5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0'>
            <dt className='text-foreground text-base font-medium'>Storage Metadata</dt>
            <dd className='text-muted mt-1 text-base sm:col-span-2 sm:mt-0'>
              {statistics?.clusterWide.metadata || 'N/A'}
            </dd>
          </div>
        </dl>
      </CardBody>
    </Card>
  )
}
