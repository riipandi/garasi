import * as Lucide from 'lucide-react'
import type { ClusterStatisticsResponse, StorageNode } from './types'

interface ClusterStatisticsProps {
  statistics: ClusterStatisticsResponse | undefined
}

export function ClusterStatistics({ statistics }: ClusterStatisticsProps) {
  const nodes = statistics?.nodes || []
  const clusterWide = statistics?.clusterWide

  // Calculate aggregate statistics
  const totalDataStorage = nodes.reduce((acc, node) => {
    const match = node.dataAvailable.total.match(/([\d.]+)/)
    const value = match && match[1] ? parseFloat(match[1]) : 0
    return acc + value
  }, 0)

  const usedDataStorage = nodes.reduce((acc, node) => {
    const match = node.dataAvailable.used.match(/([\d.]+)/)
    const value = match && match[1] ? parseFloat(match[1]) : 0
    return acc + value
  }, 0)

  const totalMetaStorage = nodes.reduce((acc, node) => {
    const match = node.metaAvailable.total.match(/([\d.]+)/)
    const value = match && match[1] ? parseFloat(match[1]) : 0
    return acc + value
  }, 0)

  const usedMetaStorage = nodes.reduce((acc, node) => {
    const match = node.metaAvailable.used.match(/([\d.]+)/)
    const value = match && match[1] ? parseFloat(match[1]) : 0
    return acc + value
  }, 0)

  const dataPercentage = totalDataStorage > 0 ? (usedDataStorage / totalDataStorage) * 100 : 0
  const metaPercentage = totalMetaStorage > 0 ? (usedMetaStorage / totalMetaStorage) * 100 : 0

  const getStorageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 70) return 'bg-yellow-500'
    return 'bg-blue-500'
  }

  const getStorageStatus = (percentage: number) => {
    if (percentage >= 90) return 'Critical'
    if (percentage >= 70) return 'Warning'
    return 'Healthy'
  }

  const getStorageStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600'
    if (percentage >= 70) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className='space-y-6'>
      {/* Cluster-Wide Statistics */}
      <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-lg font-semibold sm:text-xl'>Cluster-Wide Storage</h2>
          <Lucide.PieChart className='size-5 text-gray-400' />
        </div>

        <div className='space-y-4'>
          {/* Data Storage */}
          <div>
            <div className='mb-2 flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Lucide.Database className='size-4 text-gray-400' />
                <span className='text-sm font-medium text-gray-900'>Data Storage</span>
              </div>
              <div className='text-right'>
                <span className={`text-sm font-medium ${getStorageStatusColor(dataPercentage)}`}>
                  {getStorageStatus(dataPercentage)}
                </span>
                <span className='ml-2 text-sm text-gray-500'>
                  {usedDataStorage.toFixed(1)} GB / {totalDataStorage.toFixed(1)} GB
                </span>
              </div>
            </div>
            <div className='h-2.5 w-full overflow-hidden rounded-full bg-gray-200'>
              <div
                className={`h-full transition-all duration-500 ${getStorageColor(dataPercentage)}`}
                style={{ width: `${Math.min(dataPercentage, 100)}%` }}
              />
            </div>
            <p className='mt-1 text-xs text-gray-500'>
              {dataPercentage.toFixed(1)}% used ({clusterWide?.data || 'N/A'})
            </p>
          </div>

          {/* Metadata Storage */}
          <div>
            <div className='mb-2 flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Lucide.FileText className='size-4 text-gray-400' />
                <span className='text-sm font-medium text-gray-900'>Metadata Storage</span>
              </div>
              <div className='text-right'>
                <span className={`text-sm font-medium ${getStorageStatusColor(metaPercentage)}`}>
                  {getStorageStatus(metaPercentage)}
                </span>
                <span className='ml-2 text-sm text-gray-500'>
                  {usedMetaStorage.toFixed(1)} GB / {totalMetaStorage.toFixed(1)} GB
                </span>
              </div>
            </div>
            <div className='h-2.5 w-full overflow-hidden rounded-full bg-gray-200'>
              <div
                className={`h-full transition-all duration-500 ${getStorageColor(metaPercentage)}`}
                style={{ width: `${Math.min(metaPercentage, 100)}%` }}
              />
            </div>
            <p className='mt-1 text-xs text-gray-500'>
              {metaPercentage.toFixed(1)}% used ({clusterWide?.metadata || 'N/A'})
            </p>
          </div>
        </div>
      </div>

      {/* Per-Node Statistics */}
      <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-lg font-semibold sm:text-xl'>Node Statistics</h2>
          <Lucide.HardDrive className='size-5 text-gray-400' />
        </div>

        <div className='space-y-3'>
          {nodes.length > 0 ? (
            nodes.map((node) => <NodeStatisticsCard key={node.id} node={node} />)
          ) : (
            <div className='rounded border border-gray-200 bg-gray-50 px-3 py-8 text-center text-sm text-gray-700'>
              <Lucide.Server className='mx-auto mb-2 size-8 text-gray-400' />
              <p>No storage nodes available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface NodeStatisticsCardProps {
  node: StorageNode
}

function NodeStatisticsCard({ node }: NodeStatisticsCardProps) {
  const getStorageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 70) return 'bg-yellow-500'
    return 'bg-blue-500'
  }

  const getStorageStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600'
    if (percentage >= 70) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
      <div className='mb-3 flex items-start justify-between'>
        <div>
          <p className='font-medium text-gray-900'>{node.hostname}</p>
          <div className='flex items-center gap-2 text-xs text-gray-500'>
            <span>{node.id}</span>
            <span>•</span>
            <span className='rounded-full bg-blue-100 px-2 py-0.5 text-blue-800'>{node.zone}</span>
            <span>•</span>
            <span>{node.partitions} partitions</span>
          </div>
        </div>
        <div className='text-right'>
          <p className='text-xs text-gray-500'>Capacity</p>
          <p className='text-sm font-medium text-gray-900'>{node.capacity}</p>
        </div>
      </div>

      <div className='space-y-3'>
        {/* Data Storage */}
        <div>
          <div className='mb-1 flex items-center justify-between text-xs'>
            <div className='flex items-center gap-1'>
              <Lucide.Database className='size-3 text-gray-400' />
              <span className='text-gray-600'>Data</span>
            </div>
            <span className={`font-medium ${getStorageStatusColor(node.dataAvailable.percentage)}`}>
              {node.dataAvailable.percentage.toFixed(1)}%
            </span>
          </div>
          <div className='h-2 w-full overflow-hidden rounded-full bg-gray-200'>
            <div
              className={`h-full transition-all duration-500 ${getStorageColor(node.dataAvailable.percentage)}`}
              style={{ width: `${Math.min(node.dataAvailable.percentage, 100)}%` }}
            />
          </div>
          <p className='mt-0.5 text-xs text-gray-500'>
            {node.dataAvailable.used} / {node.dataAvailable.total}
          </p>
        </div>

        {/* Metadata Storage */}
        <div>
          <div className='mb-1 flex items-center justify-between text-xs'>
            <div className='flex items-center gap-1'>
              <Lucide.FileText className='size-3 text-gray-400' />
              <span className='text-gray-600'>Metadata</span>
            </div>
            <span className={`font-medium ${getStorageStatusColor(node.metaAvailable.percentage)}`}>
              {node.metaAvailable.percentage.toFixed(1)}%
            </span>
          </div>
          <div className='h-2 w-full overflow-hidden rounded-full bg-gray-200'>
            <div
              className={`h-full transition-all duration-500 ${getStorageColor(node.metaAvailable.percentage)}`}
              style={{ width: `${Math.min(node.metaAvailable.percentage, 100)}%` }}
            />
          </div>
          <p className='mt-0.5 text-xs text-gray-500'>
            {node.metaAvailable.used} / {node.metaAvailable.total}
          </p>
        </div>
      </div>
    </div>
  )
}
