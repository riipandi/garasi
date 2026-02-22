import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import { Card, CardBody } from '~/app/components/card'
import { Progress } from '~/app/components/progress'
import { Text } from '~/app/components/typography'
import { Heading } from '~/app/components/typography'
import clusterService from '~/app/services/cluster.service'
import { clx } from '~/app/utils'
import { LayoutManagement } from './-partials/layout-management'

interface ClusterStatisticsResponse {
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

export const Route = createFileRoute('/(app)/cluster/layout')({
  component: RouteComponent,
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(clusterStatusQuery)
    context.queryClient.ensureQueryData(clusterStatisticsQuery)
  }
})

const clusterStatusQuery = queryOptions({
  queryKey: ['cluster', 'status'],
  queryFn: () => clusterService.getClusterStatus()
})

const clusterStatisticsQuery = queryOptions({
  queryKey: ['cluster', 'statistics'],
  queryFn: () => clusterService.getClusterStatistics()
})

function RouteComponent() {
  const { queryClient } = Route.useRouteContext()
  const { data: statusData } = useSuspenseQuery(clusterStatusQuery)
  const { data: statisticsData } = useSuspenseQuery(clusterStatisticsQuery)

  const status = statusData?.data
  let statistics: ClusterStatisticsResponse | null = null
  if (statisticsData?.data?.freeform) {
    try {
      statistics = JSON.parse(statisticsData.data.freeform)
    } catch {
      console.error('Failed to parse statistics freeform data')
    }
  }

  const nodes = statistics?.nodes || []
  const clusterWide = statistics?.clusterWide

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
    if (percentage >= 90) return 'bg-danger'
    if (percentage >= 70) return 'bg-warning'
    return 'bg-primary'
  }

  const getStorageStatus = (percentage: number) => {
    if (percentage >= 90) return 'Critical'
    if (percentage >= 70) return 'Warning'
    return 'Healthy'
  }

  const getStorageStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'text-danger'
    if (percentage >= 70) return 'text-warning'
    return 'text-success'
  }

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardBody>
            <div className='flex items-center justify-between'>
              <div>
                <Text className='text-muted'>Layout Version</Text>
                <Text className='mt-1 text-lg font-semibold'>{status?.layoutVersion || 0}</Text>
              </div>
              <Lucide.LayoutGrid className='text-muted size-6' />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className='flex items-center justify-between'>
              <div>
                <Text className='text-muted'>Total Nodes</Text>
                <Text className='mt-1 text-lg font-semibold'>{nodes.length}</Text>
              </div>
              <Lucide.Server className='text-muted size-6' />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className='flex items-center justify-between'>
              <div>
                <Text className='text-muted'>Data Storage</Text>
                <Text
                  className={clx(
                    'mt-1 text-lg font-semibold',
                    getStorageStatusColor(dataPercentage)
                  )}
                >
                  {dataPercentage.toFixed(1)}%
                </Text>
              </div>
              <Lucide.Database className='text-muted size-6' />
            </div>
            <Progress value={dataPercentage} className='h-1.5 w-full'>
              <div
                className={clx('transition-all duration-500', getStorageColor(dataPercentage))}
              />
            </Progress>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className='flex items-center justify-between'>
              <div>
                <Text className='text-muted'>Metadata Storage</Text>
                <Text
                  className={clx(
                    'mt-1 text-lg font-semibold',
                    getStorageStatusColor(metaPercentage)
                  )}
                >
                  {metaPercentage.toFixed(1)}%
                </Text>
              </div>
              <Lucide.FileText className='text-muted size-6' />
            </div>
            <Progress value={metaPercentage} className='h-1.5 w-full'>
              <div
                className={clx(
                  'h-full transition-all duration-500',
                  getStorageColor(metaPercentage)
                )}
              />
            </Progress>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody>
          <LayoutManagement queryClient={queryClient} layoutVersion={status?.layoutVersion} />
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <Heading size='md'>Cluster-Wide Storage</Heading>
          <div className='mt-4 space-y-4'>
            <div>
              <div className='mb-2 flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Lucide.Database className='text-muted size-4' />
                  <Text className='text-sm font-medium'>Data Storage</Text>
                </div>
                <div className='text-right'>
                  <Text
                    className={clx('text-sm font-medium', getStorageStatusColor(dataPercentage))}
                  >
                    {getStorageStatus(dataPercentage)}
                  </Text>
                  <Text className='text-muted ml-2 text-sm'>
                    {usedDataStorage.toFixed(1)} GB / {totalDataStorage.toFixed(1)} GB
                  </Text>
                </div>
              </div>
              <Progress value={dataPercentage} className='h-2.5 w-full'>
                <div
                  className={clx(
                    'h-full transition-all duration-500',
                    getStorageColor(dataPercentage)
                  )}
                />
              </Progress>
              <Text className='text-muted mt-1 text-xs'>
                {dataPercentage.toFixed(1)}% used ({clusterWide?.data || 'N/A'})
              </Text>
            </div>

            <div>
              <div className='mb-2 flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Lucide.FileText className='text-muted size-4' />
                  <Text className='text-sm font-medium'>Metadata Storage</Text>
                </div>
                <div className='text-right'>
                  <Text
                    className={clx('text-sm font-medium', getStorageStatusColor(metaPercentage))}
                  >
                    {getStorageStatus(metaPercentage)}
                  </Text>
                  <Text className='text-muted ml-2 text-sm'>
                    {usedMetaStorage.toFixed(1)} GB / {totalMetaStorage.toFixed(1)} GB
                  </Text>
                </div>
              </div>
              <Progress value={metaPercentage} className='h-2.5 w-full'>
                <div
                  className={clx(
                    'h-full transition-all duration-500',
                    getStorageColor(metaPercentage)
                  )}
                />
              </Progress>
              <Text className='text-muted mt-1 text-xs'>
                {metaPercentage.toFixed(1)}% used ({clusterWide?.metadata || 'N/A'})
              </Text>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <Heading size='md'>Node Storage Statistics</Heading>
          <div className='mt-4 space-y-3'>
            {nodes.length > 0 ? (
              nodes.map((node) => (
                <div key={node.id} className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
                  <div className='mb-3 flex items-start justify-between'>
                    <div>
                      <Text className='font-medium'>{node.hostname}</Text>
                      <div className='text-muted flex items-center gap-2 text-xs'>
                        <span>{node.id}</span>
                        <span>•</span>
                        <span className='bg-primary/15 text-primary rounded-full px-2 py-0.5'>
                          {node.zone}
                        </span>
                        <span>•</span>
                        <span>{node.partitions} partitions</span>
                      </div>
                    </div>
                    <div className='text-right'>
                      <Text className='text-muted text-xs'>Capacity</Text>
                      <Text className='text-sm font-medium'>{node.capacity}</Text>
                    </div>
                  </div>

                  <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                    <div>
                      <div className='mb-1 flex items-center justify-between text-xs'>
                        <div className='flex items-center gap-1'>
                          <Lucide.Database className='text-muted size-3' />
                          <Text className='text-muted'>Data</Text>
                        </div>
                        <Text
                          className={clx(
                            'font-medium',
                            getStorageStatusColor(node.dataAvailable.percentage)
                          )}
                        >
                          {node.dataAvailable.percentage.toFixed(1)}%
                        </Text>
                      </div>
                      <div className='h-2 w-full overflow-hidden rounded-full bg-gray-200'>
                        <div
                          className={clx(
                            'h-full transition-all duration-500',
                            getStorageColor(node.dataAvailable.percentage)
                          )}
                          style={{ width: `${Math.min(node.dataAvailable.percentage, 100)}%` }}
                        />
                      </div>
                      <Text className='text-muted mt-0.5 text-xs'>
                        {node.dataAvailable.used} / {node.dataAvailable.total}
                      </Text>
                    </div>

                    <div>
                      <div className='mb-1 flex items-center justify-between text-xs'>
                        <div className='flex items-center gap-1'>
                          <Lucide.FileText className='text-muted size-3' />
                          <Text className='text-muted'>Metadata</Text>
                        </div>
                        <Text
                          className={clx(
                            'font-medium',
                            getStorageStatusColor(node.metaAvailable.percentage)
                          )}
                        >
                          {node.metaAvailable.percentage.toFixed(1)}%
                        </Text>
                      </div>
                      <div className='h-2 w-full overflow-hidden rounded-full bg-gray-200'>
                        <div
                          className={clx(
                            'h-full transition-all duration-500',
                            getStorageColor(node.metaAvailable.percentage)
                          )}
                          style={{ width: `${Math.min(node.metaAvailable.percentage, 100)}%` }}
                        />
                      </div>
                      <Text className='text-muted mt-0.5 text-xs'>
                        {node.metaAvailable.used} / {node.metaAvailable.total}
                      </Text>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className='flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 py-16 text-center'>
                <Lucide.Server className='text-muted mb-4 size-16' />
                <Text className='font-medium'>No storage nodes available</Text>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
