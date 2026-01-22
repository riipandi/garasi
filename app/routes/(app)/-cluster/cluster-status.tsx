import * as Lucide from 'lucide-react'
import type { ClusterStatusResponse } from './types'

interface ClusterStatusProps {
  status: ClusterStatusResponse | undefined
}

export function ClusterStatus({ status }: ClusterStatusProps) {
  const nodes = status?.nodes || []

  const formatBytes = (bytes: number | null): string => {
    if (bytes === null) return 'N/A'
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let size = bytes
    let unitIndex = 0
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`
  }

  const formatTimeAgo = (seconds: number | null): string => {
    if (seconds === null) return 'Never'
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6'>
      <div className='mb-4 flex items-center justify-between'>
        <div>
          <h2 className='text-lg font-semibold sm:text-xl'>Cluster Status</h2>
          <p className='text-sm text-gray-500'>Layout Version: {status?.layoutVersion || 0}</p>
        </div>
        <Lucide.Network className='size-5 text-gray-400' />
      </div>

      <div className='space-y-3'>
        {nodes.length > 0 ? (
          nodes.map((node) => (
            <div
              key={node.id}
              className={`rounded-lg border p-4 ${
                node.isUp ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'
              }`}
            >
              <div className='mb-3 flex items-start justify-between'>
                <div className='flex items-center gap-2'>
                  {node.isUp ? (
                    <Lucide.CheckCircle2 className='size-5 text-green-600' />
                  ) : (
                    <Lucide.XCircle className='size-5 text-red-600' />
                  )}
                  <div>
                    <p className='font-medium text-gray-900'>{node.hostname || node.id}</p>
                    <p className='text-xs text-gray-500'>{node.id}</p>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  {node.draining && (
                    <span className='rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800'>
                      Draining
                    </span>
                  )}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      node.isUp ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {node.isUp ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4 text-sm'>
                <div>
                  <p className='text-xs text-gray-500'>Address</p>
                  <p className='font-medium text-gray-900'>{node.addr || 'N/A'}</p>
                </div>
                <div>
                  <p className='text-xs text-gray-500'>Last Seen</p>
                  <p className='font-medium text-gray-900'>{formatTimeAgo(node.lastSeenSecsAgo)}</p>
                </div>
                {node.garageVersion && (
                  <div className='col-span-2'>
                    <p className='text-xs text-gray-500'>Garage Version</p>
                    <p className='font-medium text-gray-900'>{node.garageVersion}</p>
                  </div>
                )}
              </div>

              {/* Storage Information */}
              {(node.dataPartition || node.metadataPartition) && (
                <div className='mt-3 grid grid-cols-2 gap-3 rounded-lg bg-white/50 p-3'>
                  {node.dataPartition && (
                    <div>
                      <div className='flex items-center gap-1'>
                        <Lucide.Database className='size-3 text-gray-400' />
                        <p className='text-xs text-gray-500'>Data Partition</p>
                      </div>
                      <p className='text-xs font-medium text-gray-900'>
                        {formatBytes(node.dataPartition.available)} /{' '}
                        {formatBytes(node.dataPartition.total)}
                      </p>
                    </div>
                  )}
                  {node.metadataPartition && (
                    <div>
                      <div className='flex items-center gap-1'>
                        <Lucide.FileText className='size-3 text-gray-400' />
                        <p className='text-xs text-gray-500'>Metadata Partition</p>
                      </div>
                      <p className='text-xs font-medium text-gray-900'>
                        {formatBytes(node.metadataPartition.available)} /{' '}
                        {formatBytes(node.metadataPartition.total)}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className='rounded border border-gray-200 bg-gray-50 px-3 py-8 text-center text-sm text-gray-700'>
            <Lucide.Server className='mx-auto mb-2 size-8 text-gray-400' />
            <p>No nodes found in the cluster</p>
          </div>
        )}
      </div>
    </div>
  )
}
