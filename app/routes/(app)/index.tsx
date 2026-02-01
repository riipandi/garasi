import { queryOptions, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import { Text } from '~/app/components/typography'
import { Heading } from '~/app/components/typography'
import { fetcher } from '~/app/fetcher'
import { ClusterInfo } from './-dashboard/cluster-info'
import { DashboardError } from './-dashboard/error-boundary'
import { DashboardSkeleton } from './-dashboard/loading-skeleton'
import { StatCard } from './-dashboard/stat-card'
import { StorageNodes } from './-dashboard/storage-nodes'
import type { BucketResponse, KeyResponse, WhoamiResponse } from './-dashboard/types'
import type { ClusterHealthResponse, ClusterStatistics } from './-dashboard/types'

export const Route = createFileRoute('/(app)/')({
  component: RouteComponent,
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(whoamiQuery)
    context.queryClient.ensureQueryData(clusterHealthQuery)
    context.queryClient.ensureQueryData(clusterStatisticsQuery)
    context.queryClient.ensureQueryData(bucketsQuery)
    context.queryClient.ensureQueryData(keysQuery)
  },
  errorComponent: ({ error }) => <DashboardError error={error} />
})

const whoamiQuery = queryOptions({
  queryKey: ['whoami'],
  queryFn: () => fetcher<WhoamiResponse>('/auth/whoami')
})

const clusterHealthQuery = queryOptions({
  queryKey: ['cluster', 'health'],
  queryFn: () => fetcher<{ success: boolean; data: ClusterHealthResponse }>('/cluster/health')
})

const clusterStatisticsQuery = queryOptions({
  queryKey: ['cluster', 'statistics'],
  queryFn: () => fetcher<{ success: boolean; data: ClusterStatistics }>('/cluster/statistics')
})

const bucketsQuery = queryOptions({
  queryKey: ['buckets'],
  queryFn: () => fetcher<{ success: boolean; data: BucketResponse[] }>('/bucket')
})

const keysQuery = queryOptions({
  queryKey: ['keys'],
  queryFn: () => fetcher<{ success: boolean; data: KeyResponse[] }>('/keys')
})

function RouteComponent() {
  const { data: whoamiData, isLoading: isLoadingWhoami } = useQuery(whoamiQuery)
  const { data: healthData, isLoading: isLoadingHealth } = useQuery(clusterHealthQuery)
  const { data: statisticsData, isLoading: isLoadingStatistics } = useQuery(clusterStatisticsQuery)
  const { data: bucketsData, isLoading: isLoadingBuckets } = useQuery(bucketsQuery)
  const { data: keysData, isLoading: isLoadingKeys } = useQuery(keysQuery)

  const isLoading =
    isLoadingWhoami || isLoadingHealth || isLoadingStatistics || isLoadingBuckets || isLoadingKeys

  if (isLoading) {
    return <DashboardSkeleton />
  }

  const health = healthData?.data
  const statistics = statisticsData?.data
  const buckets = bucketsData?.data || []
  const keys = keysData?.data || []

  const totalDataStorage =
    statistics?.nodes.reduce((acc: number, node) => {
      const match = node.dataAvailable.total.match(/([\d.]+)/)
      const value = match && match[1] ? parseFloat(match[1]) : 0
      return acc + value
    }, 0) || 0

  const usedDataStorage =
    statistics?.nodes.reduce((acc: number, node) => {
      const match = node.dataAvailable.used.match(/([\d.]+)/)
      const value = match && match[1] ? parseFloat(match[1]) : 0
      return acc + value
    }, 0) || 0

  const storagePercentage = totalDataStorage > 0 ? (usedDataStorage / totalDataStorage) * 100 : 0

  return (
    <div className='mx-auto max-w-7xl space-y-8'>
      <div className='min-w-0 flex-1 space-y-1.5'>
        <Heading level={1} size='lg'>
          Dashboard
        </Heading>
        <Text className='text-muted'>
          Welcome back, {whoamiData?.data?.name || 'User'}! Here's an overview of your S3 storage
          cluster.
        </Text>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <ClusterInfo health={health} statistics={statistics} />
        <div className='flex flex-col gap-4'>
          <StatCard
            title='Cluster Status'
            value={health?.status || 'Unknown'}
            icon={Lucide.Activity}
            color={
              health?.status === 'healthy'
                ? 'green'
                : health?.status === 'degraded'
                  ? 'yellow'
                  : 'red'
            }
            subtitle={`${health?.connectedNodes || 0}/${health?.knownNodes || 0} nodes connected`}
          />

          <StatCard
            title='Storage Used'
            value={`${storagePercentage.toFixed(1)}%`}
            icon={Lucide.HardDrive}
            color={storagePercentage > 80 ? 'red' : storagePercentage > 60 ? 'yellow' : 'blue'}
            subtitle={`${usedDataStorage.toFixed(1)} GB of ${totalDataStorage.toFixed(1)} GB`}
          />

          <StatCard
            title='Resources'
            value={`${buckets.length} Buckets`}
            icon={Lucide.Database}
            color='purple'
            subtitle={`${keys.filter((k) => !k.deleted).length} active keys`}
          />
        </div>
      </div>

      <StorageNodes statistics={statistics} />
    </div>
  )
}
