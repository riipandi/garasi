import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import { fetcher } from '~/app/fetcher'
import { ClusterInfo } from './-dashboard/cluster-info'
import { QuickLinks } from './-dashboard/quick-links'
import { RecentBuckets } from './-dashboard/recent-buckets'
import { StatCard } from './-dashboard/stat-card'
import { StorageNodes } from './-dashboard/storage-nodes'

export const Route = createFileRoute('/(app)/')({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(whoamiQuery)
    context.queryClient.ensureQueryData(clusterHealthQuery)
    context.queryClient.ensureQueryData(clusterStatisticsQuery)
    context.queryClient.ensureQueryData(bucketsQuery)
    context.queryClient.ensureQueryData(keysQuery)
  },
  component: RouteComponent
})

// Types
interface WhoamiResponse {
  success: boolean
  message: string | null
  data: {
    user_id: string
    email: string
    name: string
  } | null
}

interface ClusterHealthResponse {
  status: string
  knownNodes: number
  connectedNodes: number
  storageNodes: number
  storageNodesUp: number
  partitions: number
  partitionsQuorum: number
  partitionsAllOk: number
}

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

interface BucketResponse {
  id: string
  created: string
  globalAliases: string[]
  localAliases: Array<{
    accessKeyId: string
    alias: string
  }>
}

interface KeyResponse {
  id: string
  name: string
  created: string | null
  deleted: boolean
}

// Query options
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
  queryFn: () =>
    fetcher<{ success: boolean; data: ClusterStatisticsResponse }>('/cluster/statistics')
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
  const { data: whoamiData } = useSuspenseQuery(whoamiQuery)
  const { data: healthData } = useSuspenseQuery(clusterHealthQuery)
  const { data: statisticsData } = useSuspenseQuery(clusterStatisticsQuery)
  const { data: bucketsData } = useSuspenseQuery(bucketsQuery)
  const { data: keysData } = useSuspenseQuery(keysQuery)

  const health = healthData?.data
  const statistics = statisticsData?.data
  const buckets = bucketsData?.data || []
  const keys = keysData?.data || []

  // Calculate cluster-wide storage
  const totalDataStorage =
    statistics?.nodes.reduce((acc, node) => {
      const match = node.dataAvailable.total.match(/([\d.]+)/)
      const value = match && match[1] ? parseFloat(match[1]) : 0
      return acc + value
    }, 0) || 0

  const usedDataStorage =
    statistics?.nodes.reduce((acc, node) => {
      const match = node.dataAvailable.used.match(/([\d.]+)/)
      const value = match && match[1] ? parseFloat(match[1]) : 0
      return acc + value
    }, 0) || 0

  const storagePercentage = totalDataStorage > 0 ? (usedDataStorage / totalDataStorage) * 100 : 0

  return (
    <div className='space-y-6'>
      {/* Page Header */}
      <div className='min-w-0 flex-1'>
        <h1 className='text-2xl font-bold text-gray-900 sm:text-3xl'>Dashboard</h1>
        <p className='mt-2 text-sm text-gray-500'>
          Welcome back, {whoamiData?.data?.name || 'User'}! Here's an overview of your S3 storage.
        </p>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
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
          title='Buckets'
          value={buckets.length.toString()}
          icon={Lucide.Database}
          color='purple'
          subtitle={`${buckets.filter((b) => b.globalAliases.length > 0).length} with aliases`}
        />

        <StatCard
          title='Access Keys'
          value={keys.filter((k) => !k.deleted).length.toString()}
          icon={Lucide.KeyRound}
          color='indigo'
          subtitle={`${keys.filter((k) => k.deleted).length} deleted`}
        />
      </div>

      {/* Main Content Grid */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <QuickLinks />
        <ClusterInfo health={health} statistics={statistics} />
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <StorageNodes statistics={statistics} />
        <RecentBuckets buckets={buckets} />
      </div>
    </div>
  )
}
