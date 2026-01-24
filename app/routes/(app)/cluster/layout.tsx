import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import fetcher from '~/app/fetcher'
import { LayoutManagement } from './-partials/layout-management'
import type { ClusterStatisticsResponse, ClusterStatusResponse } from './-partials/types'

export const Route = createFileRoute('/(app)/cluster/layout')({
  component: RouteComponent,
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(clusterStatusQuery)
    context.queryClient.ensureQueryData(clusterStatisticsQuery)
  }
})

// Query options
const clusterStatusQuery = queryOptions({
  queryKey: ['cluster', 'status'],
  queryFn: () => fetcher<{ success: boolean; data: ClusterStatusResponse }>('/cluster/status')
})

const clusterStatisticsQuery = queryOptions({
  queryKey: ['cluster', 'statistics'],
  queryFn: () =>
    fetcher<{ success: boolean; data: ClusterStatisticsResponse }>('/cluster/statistics')
})

function RouteComponent() {
  const { queryClient } = Route.useRouteContext()
  const { data: statusData } = useSuspenseQuery(clusterStatusQuery)
  const { data: statisticsData } = useSuspenseQuery(clusterStatisticsQuery)

  const status = statusData?.data
  const statistics = statisticsData?.data

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
      {/* Storage Summary Cards */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {/* Layout Version */}
        <div className='rounded-lg border border-gray-200 bg-white p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-500'>Layout Version</p>
              <p className='mt-1 text-lg font-semibold text-gray-900'>
                {status?.layoutVersion || 0}
              </p>
            </div>
            <Lucide.LayoutGrid className='size-6 text-gray-400' />
          </div>
        </div>

        {/* Total Nodes */}
        <div className='rounded-lg border border-gray-200 bg-white p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-500'>Total Nodes</p>
              <p className='mt-1 text-lg font-semibold text-gray-900'>{nodes.length}</p>
            </div>
            <Lucide.Server className='size-6 text-gray-400' />
          </div>
        </div>

        {/* Data Storage Status */}
        <div className='rounded-lg border border-gray-200 bg-white p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-500'>Data Storage</p>
              <p className={`mt-1 text-lg font-semibold ${getStorageStatusColor(dataPercentage)}`}>
                {dataPercentage.toFixed(1)}%
              </p>
            </div>
            <Lucide.Database className='size-6 text-gray-400' />
          </div>
          <div className='mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200'>
            <div
              className={`h-full transition-all duration-500 ${getStorageColor(dataPercentage)}`}
              style={{ width: `${Math.min(dataPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Metadata Storage Status */}
        <div className='rounded-lg border border-gray-200 bg-white p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-500'>Metadata Storage</p>
              <p className={`mt-1 text-lg font-semibold ${getStorageStatusColor(metaPercentage)}`}>
                {metaPercentage.toFixed(1)}%
              </p>
            </div>
            <Lucide.FileText className='size-6 text-gray-400' />
          </div>
          <div className='mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200'>
            <div
              className={`h-full transition-all duration-500 ${getStorageColor(metaPercentage)}`}
              style={{ width: `${Math.min(metaPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Layout Management */}
      <div className='rounded-lg border border-gray-200 bg-white p-6'>
        <LayoutManagement queryClient={queryClient} layoutVersion={status?.layoutVersion} />
      </div>

      {/* Cluster-Wide Storage */}
      <div className='rounded-lg border border-gray-200 bg-white p-6'>
        <h3 className='text-lg font-semibold text-gray-900'>Cluster-Wide Storage</h3>
        <div className='mt-4 space-y-4'>
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

      {/* Node Statistics */}
      <div className='rounded-lg border border-gray-200 bg-white p-6'>
        <h3 className='text-lg font-semibold text-gray-900'>Node Storage Statistics</h3>
        <div className='mt-4 space-y-3'>
          {nodes.length > 0 ? (
            nodes.map((node) => (
              <div key={node.id} className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
                <div className='mb-3 flex items-start justify-between'>
                  <div>
                    <p className='font-medium text-gray-900'>{node.hostname}</p>
                    <div className='flex items-center gap-2 text-xs text-gray-500'>
                      <span>{node.id}</span>
                      <span>•</span>
                      <span className='rounded-full bg-blue-100 px-2 py-0.5 text-blue-800'>
                        {node.zone}
                      </span>
                      <span>•</span>
                      <span>{node.partitions} partitions</span>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='text-xs text-gray-500'>Capacity</p>
                    <p className='text-sm font-medium text-gray-900'>{node.capacity}</p>
                  </div>
                </div>

                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                  {/* Data Storage */}
                  <div>
                    <div className='mb-1 flex items-center justify-between text-xs'>
                      <div className='flex items-center gap-1'>
                        <Lucide.Database className='size-3 text-gray-400' />
                        <span className='text-gray-600'>Data</span>
                      </div>
                      <span
                        className={`font-medium ${getStorageStatusColor(node.dataAvailable.percentage)}`}
                      >
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
                      <span
                        className={`font-medium ${getStorageStatusColor(node.metaAvailable.percentage)}`}
                      >
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
            ))
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
