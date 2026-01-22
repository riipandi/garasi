import * as Lucide from 'lucide-react'
import type { ClusterHealthResponse } from './types'

interface ClusterHealthProps {
  health: ClusterHealthResponse | undefined
}

export function ClusterHealth({ health }: ClusterHealthProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'degraded':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'unavailable':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return Lucide.CheckCircle2
      case 'degraded':
        return Lucide.AlertTriangle
      case 'unavailable':
        return Lucide.XCircle
      default:
        return Lucide.HelpCircle
    }
  }

  const StatusIcon = health ? getStatusIcon(health.status) : Lucide.HelpCircle

  return (
    <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6'>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-lg font-semibold sm:text-xl'>Cluster Health</h2>
        <Lucide.Activity className='size-5 text-gray-400' />
      </div>

      <div className='space-y-4'>
        {/* Status Badge */}
        <div className='flex items-center justify-between rounded-lg border p-4'>
          <div className='flex items-center gap-3'>
            <StatusIcon className='size-6' />
            <div>
              <p className='text-sm font-medium text-gray-500'>Overall Status</p>
              <p className='text-xl font-semibold text-gray-900'>{health?.status || 'Unknown'}</p>
            </div>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(health?.status || 'unknown')}`}
          >
            {health?.status === 'healthy' && 'All Systems Operational'}
            {health?.status === 'degraded' && 'Some Issues Detected'}
            {health?.status === 'unavailable' && 'Cluster Unavailable'}
            {!health?.status && 'Status Unknown'}
          </span>
        </div>

        {/* Health Metrics */}
        <div className='grid grid-cols-2 gap-4'>
          <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
            <div className='flex items-center gap-2'>
              <Lucide.Server className='size-4 text-gray-400' />
              <p className='text-sm font-medium text-gray-500'>Known Nodes</p>
            </div>
            <p className='mt-2 text-2xl font-semibold text-gray-900'>{health?.knownNodes || 0}</p>
          </div>

          <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
            <div className='flex items-center gap-2'>
              <Lucide.Wifi className='size-4 text-gray-400' />
              <p className='text-sm font-medium text-gray-500'>Connected Nodes</p>
            </div>
            <p className='mt-2 text-2xl font-semibold text-gray-900'>
              {health?.connectedNodes || 0}
            </p>
          </div>

          <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
            <div className='flex items-center gap-2'>
              <Lucide.HardDrive className='size-4 text-gray-400' />
              <p className='text-sm font-medium text-gray-500'>Storage Nodes</p>
            </div>
            <p className='mt-2 text-2xl font-semibold text-gray-900'>{health?.storageNodes || 0}</p>
          </div>

          <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
            <div className='flex items-center gap-2'>
              <Lucide.Power className='size-4 text-gray-400' />
              <p className='text-sm font-medium text-gray-500'>Storage Nodes Up</p>
            </div>
            <p className='mt-2 text-2xl font-semibold text-gray-900'>
              {health?.storageNodesUp || 0}
            </p>
          </div>
        </div>

        {/* Partition Information */}
        <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
          <h3 className='mb-3 text-sm font-medium text-gray-900'>Partition Status</h3>
          <div className='grid grid-cols-3 gap-4'>
            <div>
              <p className='text-xs text-gray-500'>Total Partitions</p>
              <p className='text-lg font-semibold text-gray-900'>{health?.partitions || 0}</p>
            </div>
            <div>
              <p className='text-xs text-gray-500'>Quorum Required</p>
              <p className='text-lg font-semibold text-gray-900'>{health?.partitionsQuorum || 0}</p>
            </div>
            <div>
              <p className='text-xs text-gray-500'>All OK</p>
              <p className='text-lg font-semibold text-gray-900'>{health?.partitionsAllOk || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
