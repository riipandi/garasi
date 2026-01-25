import { Link } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import type { ClusterStatistics } from './types'

interface StorageNodesProps {
  statistics: ClusterStatistics | undefined
}

export function StorageNodes({ statistics }: StorageNodesProps) {
  const nodes = statistics?.nodes || []

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className='rounded-lg border border-gray-200 bg-white p-6'>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-lg font-semibold text-gray-900'>Storage Nodes</h2>
        <Link
          to='/cluster'
          className='flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700'
        >
          View All
          <Lucide.ArrowRight className='size-4' />
        </Link>
      </div>

      <div className='space-y-3'>
        {nodes.length > 0 ? (
          nodes.map((node) => (
            <div key={node.id} className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
              <div className='mb-3 flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Lucide.Server className='size-4 text-gray-400' />
                  <span className='font-medium text-gray-900'>{node.hostname}</span>
                </div>
                <span className='rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800'>
                  {node.zone}
                </span>
              </div>

              {/* Data Storage */}
              <div className='mb-3'>
                <div className='mb-1.5 flex items-center justify-between'>
                  <span className='text-sm font-medium text-gray-700'>Data Storage</span>
                  <span className='text-sm font-medium text-gray-900'>
                    {node.dataAvailable.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className='h-2 w-full overflow-hidden rounded-full bg-gray-200'>
                  <div
                    className={`h-full rounded-full ${getProgressColor(node.dataAvailable.percentage)} transition-all duration-500`}
                    style={{ width: `${node.dataAvailable.percentage}%` }}
                  />
                </div>
                <p className='mt-1 text-xs text-gray-500'>
                  {node.dataAvailable.used} of {node.dataAvailable.total}
                </p>
              </div>

              {/* Metadata Storage */}
              <div className='mb-3'>
                <div className='mb-1.5 flex items-center justify-between'>
                  <span className='text-sm font-medium text-gray-700'>Metadata Storage</span>
                  <span className='text-sm font-medium text-gray-900'>
                    {node.metaAvailable.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className='h-2 w-full overflow-hidden rounded-full bg-gray-200'>
                  <div
                    className={`h-full rounded-full ${getProgressColor(node.metaAvailable.percentage)} transition-all duration-500`}
                    style={{ width: `${node.metaAvailable.percentage}%` }}
                  />
                </div>
                <p className='mt-1 text-xs text-gray-500'>
                  {node.metaAvailable.used} of {node.metaAvailable.total}
                </p>
              </div>

              {/* Additional Info */}
              <div className='grid grid-cols-2 gap-2 rounded-lg bg-white p-2 text-xs'>
                <div className='flex items-center gap-1.5'>
                  <Lucide.Layers className='size-3.5 text-gray-400' />
                  <span className='text-gray-500'>Partitions:</span>
                  <span className='font-medium text-gray-900'>{node.partitions}</span>
                </div>
                <div className='flex items-center gap-1.5'>
                  <Lucide.Database className='size-3.5 text-gray-400' />
                  <span className='text-gray-500'>Capacity:</span>
                  <span className='font-medium text-gray-900'>{node.capacity}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className='flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center'>
            <Lucide.HardDrive className='mb-2 size-8 text-gray-400' />
            <p className='text-sm font-medium text-gray-700'>No storage nodes available</p>
          </div>
        )}
      </div>
    </div>
  )
}
