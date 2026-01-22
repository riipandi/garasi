import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import { fetcher } from '~/app/fetcher'
import type { ClusterHealthResponse, ClusterStatusResponse } from './-partials/types'

export const Route = createFileRoute('/(app)/cluster/')({
  component: RouteComponent,
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(clusterHealthQuery)
    context.queryClient.ensureQueryData(clusterStatusQuery)
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

function RouteComponent() {
  const { data: healthData } = useSuspenseQuery(clusterHealthQuery)
  const { data: statusData } = useSuspenseQuery(clusterStatusQuery)

  const health = healthData?.data
  const status = statusData?.data

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-600',
          icon: 'text-green-600'
        }
      case 'degraded':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-600',
          icon: 'text-yellow-600'
        }
      case 'unavailable':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-600',
          icon: 'text-red-600'
        }
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-600',
          icon: 'text-gray-600'
        }
    }
  }

  const statusColor = getStatusColor(health?.status || 'unknown')

  const formatTimeAgo = (seconds: number | null): string => {
    if (seconds === null) return 'Never'
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <div className='space-y-6'>
      {/* Summary Cards */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {/* Overall Status */}
        <div className={`rounded-lg border ${statusColor.border} ${statusColor.bg} p-4`}>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-500'>Overall Status</p>
              <p className={`mt-1 text-lg font-semibold ${statusColor.text}`}>
                {health?.status || 'Unknown'}
              </p>
            </div>
            {health?.status === 'healthy' && (
              <Lucide.CheckCircle2 className={`size-6 ${statusColor.icon}`} />
            )}
            {health?.status === 'degraded' && (
              <Lucide.AlertTriangle className={`size-6 ${statusColor.icon}`} />
            )}
            {health?.status === 'unavailable' && (
              <Lucide.XCircle className={`size-6 ${statusColor.icon}`} />
            )}
            {!health?.status && <Lucide.HelpCircle className={`size-6 ${statusColor.icon}`} />}
          </div>
        </div>

        {/* Known Nodes */}
        <div className='rounded-lg border border-gray-200 bg-white p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-500'>Known Nodes</p>
              <p className='mt-1 text-lg font-semibold text-gray-900'>{health?.knownNodes || 0}</p>
            </div>
            <Lucide.Server className='size-6 text-gray-400' />
          </div>
        </div>

        {/* Connected Nodes */}
        <div className='rounded-lg border border-gray-200 bg-white p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-500'>Connected Nodes</p>
              <p className='mt-1 text-lg font-semibold text-gray-900'>
                {health?.connectedNodes || 0}
              </p>
            </div>
            <Lucide.Wifi className='size-6 text-gray-400' />
          </div>
        </div>

        {/* Storage Nodes */}
        <div className='rounded-lg border border-gray-200 bg-white p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-500'>Storage Nodes</p>
              <p className='mt-1 text-lg font-semibold text-gray-900'>
                {health?.storageNodes || 0}
              </p>
            </div>
            <Lucide.HardDrive className='size-6 text-gray-400' />
          </div>
        </div>
      </div>

      {/* Partition Status */}
      <div className='rounded-lg border border-gray-200 bg-white p-6'>
        <h3 className='text-lg font-semibold text-gray-900'>Partition Status</h3>
        <div className='mt-4 grid grid-cols-3 gap-4'>
          <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
            <p className='text-sm font-medium text-gray-500'>Total Partitions</p>
            <p className='mt-2 text-2xl font-semibold text-gray-900'>{health?.partitions || 0}</p>
          </div>
          <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
            <p className='text-sm font-medium text-gray-500'>Quorum Required</p>
            <p className='mt-2 text-2xl font-semibold text-gray-900'>
              {health?.partitionsQuorum || 0}
            </p>
          </div>
          <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
            <p className='text-sm font-medium text-gray-500'>All OK</p>
            <p className='mt-2 text-2xl font-semibold text-gray-900'>
              {health?.partitionsAllOk || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Node Status */}
      <div className='rounded-lg border border-gray-200 bg-white p-0'>
        <div className='flex items-center justify-between px-6 py-4'>
          <div>
            <h3 className='text-lg font-semibold text-gray-900'>Node Status</h3>
            <p className='text-sm text-gray-500'>Layout Version: {status?.layoutVersion || 0}</p>
          </div>
          <Link
            to='/cluster/nodes'
            className='flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700'
          >
            View All
            <Lucide.ArrowRight className='size-4' />
          </Link>
        </div>

        {status?.nodes && status.nodes.length > 0 ? (
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200 border-t border-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                    Node
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                    Address
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                    Status
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                    Last Seen
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {status.nodes.slice(0, 5).map((node) => (
                  <tr
                    key={node.id}
                    className='cursor-pointer transition-colors hover:bg-gray-50'
                    onClick={() => (window.location.href = `/cluster/nodes/${node.id}`)}
                  >
                    <td className='px-4 py-3'>
                      <div className='flex items-center gap-2'>
                        <Link
                          to='/cluster/nodes/$id'
                          params={{ id: node.id }}
                          className='font-medium text-gray-900 hover:text-blue-600'
                        >
                          {node.hostname || node.id}
                        </Link>
                        {node.draining && (
                          <span className='rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800'>
                            Draining
                          </span>
                        )}
                      </div>
                    </td>
                    <td className='px-4 py-3 text-sm text-gray-500'>{node.addr || 'N/A'}</td>
                    <td className='px-4 py-3'>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                          node.isUp ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {node.isUp ? (
                          <Lucide.CheckCircle2 className='h-3 w-3' />
                        ) : (
                          <Lucide.XCircle className='h-3 w-3' />
                        )}
                        {node.isUp ? 'Online' : 'Offline'}
                      </span>
                    </td>
                    <td className='px-4 py-3 text-sm text-gray-500'>
                      {formatTimeAgo(node.lastSeenSecsAgo)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className='rounded border border-gray-200 bg-gray-50 px-3 py-8 text-center text-sm text-gray-700'>
            <Lucide.Server className='mx-auto mb-2 size-8 text-gray-400' />
            <p>No nodes found in cluster</p>
          </div>
        )}
      </div>
    </div>
  )
}
