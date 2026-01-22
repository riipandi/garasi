import * as Lucide from 'lucide-react'
import { InfoItem } from './info-items'

interface ClusterHealth {
  status: string
  knownNodes: number
  connectedNodes: number
  storageNodes: number
  storageNodesUp: number
  partitions: number
  partitionsQuorum: number
  partitionsAllOk: number
}

interface ClusterStatistics {
  nodes: Array<{
    id: string
    hostname: string
    zone: string
    capacity: string
    partitions: number
    dataAvailable: {
      used: string
      total: string
      percentage: number
    }
    metaAvailable: {
      used: string
      total: string
      percentage: number
    }
  }>
  clusterWide: {
    data: string
    metadata: string
  }
}

interface ClusterInfoProps {
  health: ClusterHealth | undefined
  statistics: ClusterStatistics | undefined
}

export function ClusterInfo({ health, statistics }: ClusterInfoProps) {
  return (
    <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6'>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-lg font-semibold sm:text-xl'>Cluster Information</h2>
        <Lucide.Server className='size-5 text-gray-400' />
      </div>

      <div className='space-y-4'>
        <div className='grid grid-cols-2 gap-4'>
          <InfoItem label='Known Nodes' value={health?.knownNodes?.toString() || '0'} />
          <InfoItem label='Connected Nodes' value={health?.connectedNodes?.toString() || '0'} />
          <InfoItem label='Storage Nodes' value={health?.storageNodes?.toString() || '0'} />
          <InfoItem label='Storage Nodes Up' value={health?.storageNodesUp?.toString() || '0'} />
          <InfoItem label='Partitions' value={health?.partitions?.toString() || '0'} />
          <InfoItem label='Partitions OK' value={health?.partitionsAllOk?.toString() || '0'} />
        </div>

        <div className='border-t border-gray-200 pt-4'>
          <h3 className='mb-3 text-sm font-medium text-gray-900'>Cluster-Wide Storage</h3>
          <div className='grid grid-cols-2 gap-4'>
            <InfoItem label='Data Available' value={statistics?.clusterWide.data || 'N/A'} />
            <InfoItem
              label='Metadata Available'
              value={statistics?.clusterWide.metadata || 'N/A'}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
