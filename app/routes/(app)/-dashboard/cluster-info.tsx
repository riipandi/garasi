import { Link } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import { Badge } from '~/app/components/badge'
import { Card, CardBody, CardHeader, CardTitle } from '~/app/components/card'
import { Stack } from '~/app/components/stack'
import { Text, Strong } from '~/app/components/text'
import { InfoItem } from './info-items'
import type { ClusterHealthResponse, ClusterStatistics } from './types'

interface ClusterInfoProps {
  health: ClusterHealthResponse | undefined
  statistics: ClusterStatistics | undefined
}

export function ClusterInfo({ health, statistics }: ClusterInfoProps) {
  const getStatusVariant = (status: string): 'success' | 'warning' | 'danger' => {
    switch (status?.toLowerCase()) {
      case 'healthy':
        return 'success'
      case 'degraded':
        return 'warning'
      default:
        return 'danger'
    }
  }

  const StatusIcon =
    health?.status === 'healthy'
      ? Lucide.CheckCircle
      : health?.status === 'degraded'
        ? Lucide.AlertTriangle
        : Lucide.XCircle

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cluster Information</CardTitle>
        <Link
          to='/cluster'
          className='text-primary hover:text-primary/80 inline-flex items-center gap-1 text-sm font-medium'
        >
          View Details
          <Lucide.ArrowRight className='size-4' />
        </Link>
      </CardHeader>
      <CardBody>
        <Stack spacing='lg'>
          <div className='bg-accent flex items-center justify-between rounded-lg p-3'>
            <div className='flex items-center gap-2'>
              <StatusIcon
                className={`size-5 ${health?.status === 'healthy' ? 'text-success' : health?.status === 'degraded' ? 'text-warning' : 'text-danger'}`}
              />
              <Text>
                <Strong>Cluster Status</Strong>
              </Text>
            </div>
            <Badge variant={getStatusVariant(health?.status || '')} pill>
              {health?.status || 'Unknown'}
            </Badge>
          </div>

          <div>
            <p className='mb-3 font-semibold'>Nodes</p>
            <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
              <InfoItem label='Known' value={health?.knownNodes?.toString() || '0'} />
              <InfoItem label='Connected' value={health?.connectedNodes?.toString() || '0'} />
              <InfoItem label='Storage' value={health?.storageNodes?.toString() || '0'} />
              <InfoItem label='Storage Up' value={health?.storageNodesUp?.toString() || '0'} />
            </div>
          </div>

          <div>
            <p className='mb-3 font-semibold'>Partitions</p>
            <div className='grid grid-cols-3 gap-3'>
              <InfoItem label='Total' value={health?.partitions?.toString() || '0'} />
              <InfoItem label='Quorum' value={health?.partitionsQuorum?.toString() || '0'} />
              <InfoItem label='All OK' value={health?.partitionsAllOk?.toString() || '0'} />
            </div>
          </div>

          <div className='border-card-separator border-t pt-4'>
            <p className='mb-3 font-semibold'>Cluster-Wide Storage</p>
            <div className='grid grid-cols-2 gap-3'>
              <InfoItem label='Data' value={statistics?.clusterWide.data || 'N/A'} />
              <InfoItem label='Metadata' value={statistics?.clusterWide.metadata || 'N/A'} />
            </div>
          </div>
        </Stack>
      </CardBody>
    </Card>
  )
}
