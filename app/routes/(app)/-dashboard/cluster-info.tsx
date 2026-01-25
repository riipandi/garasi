import { Link } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import { InfoItem } from './info-items'
import type { ClusterHealthResponse, ClusterStatistics } from './types'

interface ClusterInfoProps {
  health: ClusterHealthResponse | undefined
  statistics: ClusterStatistics | undefined
}

export function ClusterInfo({ health, statistics }: ClusterInfoProps) {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'degraded':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default:
        return 'text-red-600 bg-red-50 border-red-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
        return Lucide.CheckCircle
      case 'degraded':
        return Lucide.AlertTriangle
      default:
        return Lucide.XCircle
    }
  }

  const StatusIcon = getStatusIcon(health?.status || '')

  return (
    <div className='flex h-full flex-col rounded-lg border border-gray-200 bg-white p-6'>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-lg font-semibold text-gray-900'>Cluster Information</h2>
        <Link
          to='/cluster'
          className='flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700'
        >
          View Details
          <Lucide.ArrowRight className='size-4' />
        </Link>
      </div>

      {/* Cluster Status */}
      <div className='mb-4 flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3'>
        <div className='flex items-center gap-2'>
          <StatusIcon
            className={`size-5 ${health?.status === 'healthy' ? 'text-green-600' : health?.status === 'degraded' ? 'text-yellow-600' : 'text-red-600'}`}
          />
          <span className='text-sm font-medium text-gray-900'>Cluster Status</span>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(health?.status || '')}`}
        >
          {health?.status || 'Unknown'}
        </span>
      </div>

      {/* Node Information */}
      <div className='mb-4'>
        <h3 className='mb-3 text-sm font-medium text-gray-900'>Nodes</h3>
        <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
          <InfoItem label='Known' value={health?.knownNodes?.toString() || '0'} />
          <InfoItem label='Connected' value={health?.connectedNodes?.toString() || '0'} />
          <InfoItem label='Storage' value={health?.storageNodes?.toString() || '0'} />
          <InfoItem label='Storage Up' value={health?.storageNodesUp?.toString() || '0'} />
        </div>
      </div>

      {/* Partition Information */}
      <div className='mb-4'>
        <h3 className='mb-3 text-sm font-medium text-gray-900'>Partitions</h3>
        <div className='grid grid-cols-3 gap-3'>
          <InfoItem label='Total' value={health?.partitions?.toString() || '0'} />
          <InfoItem label='Quorum' value={health?.partitionsQuorum?.toString() || '0'} />
          <InfoItem label='All OK' value={health?.partitionsAllOk?.toString() || '0'} />
        </div>
      </div>

      {/* Cluster-Wide Storage */}
      <div className='mt-auto border-t border-gray-200 pt-4'>
        <h3 className='mb-3 text-sm font-medium text-gray-900'>Cluster-Wide Storage</h3>
        <div className='grid grid-cols-2 gap-3'>
          <InfoItem label='Data' value={statistics?.clusterWide.data || 'N/A'} />
          <InfoItem label='Metadata' value={statistics?.clusterWide.metadata || 'N/A'} />
        </div>
      </div>
    </div>
  )
}
