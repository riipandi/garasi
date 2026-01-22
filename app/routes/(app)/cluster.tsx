import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import { fetcher } from '~/app/fetcher'
import { ClusterHealth } from './-cluster/cluster-health'
import { ClusterStatistics } from './-cluster/cluster-statistics'
import { ClusterStatus } from './-cluster/cluster-status'
import { ConnectNodesDialog } from './-cluster/connect-nodes-dialog'
import { LayoutManagement } from './-cluster/layout-management'
import { NodeManagement } from './-cluster/node-management'
import type {
  ClusterHealthResponse,
  ClusterStatusResponse,
  ClusterStatisticsResponse
} from './-cluster/types'

type TabType = 'overview' | 'layout' | 'nodes'

export const Route = createFileRoute('/(app)/cluster')({
  component: RouteComponent,
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(clusterHealthQuery)
    context.queryClient.ensureQueryData(clusterStatusQuery)
    context.queryClient.ensureQueryData(clusterStatisticsQuery)
  }
})

// Query options
const clusterHealthQuery = queryOptions({
  queryKey: ['cluster', 'health'],
  queryFn: () => fetcher<{ success: boolean; data: ClusterHealthResponse }>('/cluster/health')
})

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
  const { data: healthData } = useSuspenseQuery(clusterHealthQuery)
  const { data: statusData } = useSuspenseQuery(clusterStatusQuery)
  const { data: statisticsData } = useSuspenseQuery(clusterStatisticsQuery)

  const health = healthData?.data
  const status = statusData?.data
  const statistics = statisticsData?.data

  const [activeTab, setActiveTab] = React.useState<TabType>('overview')
  const [isConnectDialogOpen, setIsConnectDialogOpen] = React.useState(false)

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: Lucide.LayoutDashboard },
    { id: 'layout', label: 'Layout', icon: Lucide.LayoutGrid },
    { id: 'nodes', label: 'Nodes', icon: Lucide.Server }
  ]

  return (
    <div className='mx-auto max-w-screen-2xl space-y-6'>
      {/* Page Header */}
      <div className='min-w-0 flex-1'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900 sm:text-3xl'>Cluster</h1>
            <p className='text-normal mt-2 text-gray-500'>Manage and monitor your Garage cluster</p>
          </div>
          <button
            type='button'
            onClick={() => setIsConnectDialogOpen(true)}
            className='flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
          >
            <Lucide.Plus className='size-4' />
            <span>Connect Nodes</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
        <StatCard
          label='Cluster Status'
          value={health?.status || 'Unknown'}
          icon={
            health?.status === 'healthy'
              ? Lucide.CheckCircle2
              : health?.status === 'degraded'
                ? Lucide.AlertTriangle
                : Lucide.XCircle
          }
          color={
            health?.status === 'healthy'
              ? 'green'
              : health?.status === 'degraded'
                ? 'yellow'
                : 'red'
          }
          subtitle={`${health?.connectedNodes || 0}/${health?.knownNodes || 0} nodes`}
        />
        <StatCard
          label='Connected'
          value={`${health?.connectedNodes || 0}`}
          icon={Lucide.Wifi}
          color='blue'
          subtitle={`of ${health?.knownNodes || 0} known`}
        />
        <StatCard
          label='Storage Nodes'
          value={`${health?.storageNodesUp || 0}`}
          icon={Lucide.HardDrive}
          color='purple'
          subtitle={`of ${health?.storageNodes || 0} total`}
        />
        <StatCard
          label='Partitions'
          value={`${health?.partitionsAllOk || 0}`}
          icon={Lucide.Grid3x3}
          color='indigo'
          subtitle={`of ${health?.partitions || 0} OK`}
        />
      </div>

      {/* Tabs */}
      <div className='border-b border-gray-200'>
        <nav className='-mb-px flex space-x-8' aria-label='Tabs'>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type='button'
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 border-b-2 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              <tab.icon className='size-4' />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className='min-h-100'>
        {activeTab === 'overview' && (
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            <ClusterHealth health={health} />
            <ClusterStatus status={status} />
          </div>
        )}
        {activeTab === 'layout' && (
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            <LayoutManagement layoutVersion={status?.layoutVersion} />
            <ClusterStatistics statistics={statistics} />
          </div>
        )}
        {activeTab === 'nodes' && (
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            <NodeManagement nodeId={status?.nodes[0]?.id} nodes={status?.nodes.map((n) => n.id)} />
            <ClusterStatistics statistics={statistics} />
          </div>
        )}
      </div>

      {/* Connect Nodes Dialog */}
      <ConnectNodesDialog
        isOpen={isConnectDialogOpen}
        onClose={() => setIsConnectDialogOpen(false)}
      />
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string
  icon: any
  color: 'green' | 'yellow' | 'red' | 'blue' | 'purple' | 'indigo'
  subtitle: string
}

function StatCard({ label, value, icon: Icon, color, subtitle }: StatCardProps) {
  const colorClasses = {
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    indigo: 'bg-indigo-100 text-indigo-600'
  }

  return (
    <div className='rounded-lg border border-gray-200 bg-white p-3 shadow-sm sm:p-4'>
      <div className='flex items-center justify-between'>
        <div className='flex-1'>
          <p className='text-xs font-medium text-gray-500 sm:text-sm'>{label}</p>
          <p
            className={`mt-1 text-lg font-semibold sm:text-xl ${
              color === 'green'
                ? 'text-green-600'
                : color === 'yellow'
                  ? 'text-yellow-600'
                  : color === 'red'
                    ? 'text-red-600'
                    : color === 'blue'
                      ? 'text-blue-600'
                      : color === 'purple'
                        ? 'text-purple-600'
                        : 'text-indigo-600'
            }`}
          >
            {value}
          </p>
          <p className='mt-1 text-xs text-gray-500'>{subtitle}</p>
        </div>
        <div className={`rounded-full p-2 ${colorClasses[color]}`}>
          <Icon className='size-4 sm:size-5' />
        </div>
      </div>
    </div>
  )
}
