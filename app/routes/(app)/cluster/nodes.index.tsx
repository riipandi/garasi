import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel
} from '@tanstack/react-table'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import { fetcher } from '~/app/fetcher'
import { ConnectNodesDialog } from './-partials/connect-nodes-dialog'
import type { NodeResp, ClusterStatusResponse, NodeInfoResponse } from './-partials/types'

export const Route = createFileRoute('/(app)/cluster/nodes/')({
  component: RouteComponent,
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(clusterStatusQuery)
    context.queryClient.ensureQueryData(nodeInfoQuery)
  }
})

// Query options
const clusterStatusQuery = queryOptions({
  queryKey: ['cluster', 'status'],
  queryFn: () => fetcher<{ success: boolean; data: ClusterStatusResponse }>('/cluster/status')
})

const nodeInfoQuery = queryOptions({
  queryKey: ['cluster', 'node', 'info'],
  queryFn: () => fetcher<NodeInfoResponse>('/node/info', { params: { node: '*' } })
})

const columnHelper = createColumnHelper<NodeResp>()

function RouteComponent() {
  const { data: statusData, isLoading: isLoadingStatusQuery } = useSuspenseQuery(clusterStatusQuery)
  const { data: nodeInfoData, isLoading: isLoadingNodeInfo } = useSuspenseQuery(nodeInfoQuery)
  const [isConnectDialogOpen, setIsConnectDialogOpen] = React.useState(false)
  const [filtering, setFiltering] = React.useState('')

  const isLoading = isLoadingStatusQuery || isLoadingNodeInfo

  const formatTimeAgo = (seconds: number | null): string => {
    if (seconds === null) return 'Never'
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  const status = statusData?.data
  const nodeInfo = nodeInfoData
  const nodes = status?.nodes || []

  const columns = [
    columnHelper.accessor('id', {
      header: 'Node ID',
      cell: (info) => (
        <div className='flex items-center gap-2'>
          <code className='font-mono text-sm'>{info.getValue()}</code>
          <button
            type='button'
            onClick={(e) => {
              e.stopPropagation()
              navigator.clipboard.writeText(info.getValue())
            }}
            className='text-gray-400 transition-colors hover:text-gray-600'
            title='Copy Node ID'
          >
            <Lucide.Copy className='h-3.5 w-3.5' />
          </button>
        </div>
      ),
      filterFn: (row, value) => {
        return (
          row.original.id.toLowerCase().includes(value.toLowerCase()) ||
          (row.original.hostname?.toLowerCase() || '').includes(value.toLowerCase())
        )
      }
    }),
    columnHelper.accessor('hostname', {
      header: 'Hostname',
      cell: (info) => info.getValue() || 'N/A'
    }),
    columnHelper.accessor('addr', {
      header: 'Address',
      cell: (info) => info.getValue() || 'N/A'
    }),
    columnHelper.display({
      id: 'status',
      header: 'Status',
      cell: (info) => {
        const node = info.row.original
        return (
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
        )
      }
    }),
    columnHelper.display({
      id: 'lastSeen',
      header: 'Last Seen',
      cell: (info) => formatTimeAgo(info.row.original.lastSeenSecsAgo)
    }),
    columnHelper.display({
      id: 'version',
      header: 'Version',
      cell: (info) => {
        const node = info.row.original
        const infoData = nodeInfo?.success?.[node.id]
        return infoData?.garageVersion || 'N/A'
      }
    })
  ]

  const table = useReactTable({
    data: nodes,
    columns,
    state: {
      globalFilter: filtering
    },
    onGlobalFilterChange: setFiltering,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  })

  // Skeleton loader for table rows
  const TableSkeleton = () => (
    <div className='overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm'>
      <table className='min-w-full divide-y divide-gray-200'>
        <thead className='bg-gray-50'>
          <tr>
            <th className='px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
              Node ID
            </th>
            <th className='px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
              Hostname
            </th>
            <th className='px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
              Address
            </th>
            <th className='px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
              Status
            </th>
            <th className='px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
              Last Seen
            </th>
            <th className='px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
              Version
            </th>
          </tr>
        </thead>
        <tbody className='divide-y divide-gray-200'>
          {Array.from({ length: 5 }).map((_, index) => (
            <tr key={index} className='animate-pulse'>
              <td className='px-4 py-3'>
                <div className='h-4 w-40 rounded bg-gray-200' />
              </td>
              <td className='px-4 py-3'>
                <div className='h-4 w-32 rounded bg-gray-200' />
              </td>
              <td className='px-4 py-3'>
                <div className='h-4 w-48 rounded bg-gray-200' />
              </td>
              <td className='px-4 py-3'>
                <div className='h-6 w-20 rounded-full bg-gray-200' />
              </td>
              <td className='px-4 py-3'>
                <div className='h-4 w-24 rounded bg-gray-200' />
              </td>
              <td className='px-4 py-3'>
                <div className='h-4 w-32 rounded bg-gray-200' />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className='space-y-4'>
      {/* Node Table */}
      <div className='space-y-4'>
        {/* Connect Nodes Button - Aligned with Search Filter */}
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          {/* Search/Filter Input */}
          <div className='relative flex-1'>
            <div className='pointer-events-none absolute left-3 flex h-full items-center'>
              <Lucide.Search className='size-4 text-gray-400' />
            </div>
            <input
              type='text'
              value={filtering}
              onChange={(e) => setFiltering(e.target.value)}
              placeholder='Search nodes by ID or hostname...'
              disabled={isLoading}
              className='w-full rounded-md border border-gray-300 bg-white py-2 pr-4 pl-10 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
            />
            {filtering && !isLoading && (
              <button
                type='button'
                onClick={() => setFiltering('')}
                className='absolute top-1.5 right-2 rounded p-1 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                title='Clear search'
              >
                <Lucide.X className='size-4' />
              </button>
            )}
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

        {/* Table */}
        {isLoading ? (
          <TableSkeleton />
        ) : table.getRowModel().rows.length === 0 && nodes.length > 0 ? (
          <div className='flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 py-16 text-center'>
            <Lucide.Search className='mb-4 h-16 w-16 text-gray-400' />
            <h3 className='text-lg font-medium text-gray-900'>No nodes found</h3>
            <p className='text-normal mt-2 text-gray-500'>Try adjusting your search or filters.</p>
          </div>
        ) : nodes.length === 0 ? (
          <div className='flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 py-16 text-center'>
            <Lucide.Server className='mb-4 h-16 w-16 text-gray-400' />
            <h3 className='text-lg font-medium text-gray-900'>No nodes found</h3>
            <p className='text-normal mt-2 text-gray-500'>
              Connect nodes to your cluster to get started.
            </p>
          </div>
        ) : (
          <div className='overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className='px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className='cursor-pointer transition-colors hover:bg-gray-50'
                    onClick={() => {
                      const nodeId = row.original.id
                      window.location.href = `/cluster/nodes/${nodeId}`
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className='px-4 py-3 text-sm whitespace-nowrap text-gray-900'
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
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
