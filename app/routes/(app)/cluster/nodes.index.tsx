import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { createColumnHelper } from '@tanstack/react-table'
import { flexRender } from '@tanstack/react-table'
import { getCoreRowModel } from '@tanstack/react-table'
import { useReactTable } from '@tanstack/react-table'
import { getPaginationRowModel } from '@tanstack/react-table'
import { getSortedRowModel } from '@tanstack/react-table'
import { getFilteredRowModel } from '@tanstack/react-table'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import { Badge } from '~/app/components/badge'
import { Button } from '~/app/components/button'
import { Card, CardBody } from '~/app/components/card'
import { Input } from '~/app/components/input'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '~/app/components/table'
import { Text } from '~/app/components/text'
import { getClusterStatus } from '~/app/services/cluster.service'
import { getNodeInfo } from '~/app/services/node.service'
import type { NodeResp } from '~/shared/schemas/cluster.schema'
import { ConnectNodesDialog } from './-partials/connect-nodes-dialog'

export const Route = createFileRoute('/(app)/cluster/nodes/')({
  component: RouteComponent,
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(clusterStatusQuery)
    context.queryClient.ensureQueryData(nodeInfoQuery)
  }
})

const clusterStatusQuery = queryOptions({
  queryKey: ['cluster', 'status'],
  queryFn: () => getClusterStatus()
})

const nodeInfoQuery = queryOptions({
  queryKey: ['cluster', 'node', 'info'],
  queryFn: () => getNodeInfo({ node: '*' })
})

const columnHelper = createColumnHelper<NodeResp>()

function RouteComponent() {
  const { queryClient } = Route.useRouteContext()
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
  const nodeInfo = nodeInfoData?.data
  const nodes = status?.nodes || []

  const columns = [
    columnHelper.accessor('id', {
      header: 'Node ID',
      cell: (info) => (
        <div className='flex items-center gap-2'>
          <Text className='font-mono text-sm'>{info.getValue()}</Text>
          <Button
            variant='plain'
            size='sm-icon'
            onClick={(e) => {
              e.stopPropagation()
              navigator.clipboard.writeText(info.getValue())
            }}
            title='Copy Node ID'
          >
            <Lucide.Copy className='size-3.5' />
          </Button>
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
          <Badge variant={node.isUp ? 'success' : 'danger'} pill>
            {node.isUp ? (
              <Lucide.CheckCircle2 className='size-3' />
            ) : (
              <Lucide.XCircle className='size-3' />
            )}
            {node.isUp ? 'Online' : 'Offline'}
          </Badge>
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

  return (
    <div className='space-y-4'>
      <div className='space-y-4'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='relative flex-1'>
            <Input
              value={filtering}
              onChange={(e) => setFiltering(e.target.value)}
              placeholder='Search nodes by ID or hostname...'
              disabled={isLoading}
            />
            {filtering && !isLoading && (
              <Button
                variant='plain'
                size='sm-icon'
                onClick={() => setFiltering('')}
                className='absolute top-1.5 right-2'
                title='Clear search'
              >
                <Lucide.X className='size-4' />
              </Button>
            )}
          </div>

          <Button variant='primary' onClick={() => setIsConnectDialogOpen(true)}>
            <Lucide.Plus className='size-4' />
            Connect Nodes
          </Button>
        </div>

        {isLoading ? (
          <Card>
            <CardBody>
              <div className='flex items-center justify-center py-8'>
                <Lucide.Loader2 className='text-muted size-6 animate-spin' />
              </div>
            </CardBody>
          </Card>
        ) : table.getRowModel().rows.length === 0 && nodes.length > 0 ? (
          <Card>
            <CardBody>
              <div className='flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 py-16 text-center'>
                <Lucide.Search className='text-muted mb-4 size-16' />
                <Text className='font-medium'>No nodes found</Text>
                <Text className='text-muted mt-2 text-sm'>
                  Try adjusting your search or filters.
                </Text>
              </div>
            </CardBody>
          </Card>
        ) : nodes.length === 0 ? (
          <Card>
            <CardBody>
              <div className='flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 py-16 text-center'>
                <Lucide.Server className='text-muted mb-4 size-16' />
                <Text className='font-medium'>No nodes found</Text>
                <Text className='text-muted mt-2 text-sm'>
                  Connect nodes to your cluster to get started.
                </Text>
              </div>
            </CardBody>
          </Card>
        ) : (
          <Card>
            <CardBody>
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableCaption>
                    {nodes.length} {nodes.length === 1 ? 'node' : 'nodes'} in cluster
                  </TableCaption>
                </Table>
              </div>
            </CardBody>
          </Card>
        )}
      </div>

      <ConnectNodesDialog
        queryClient={queryClient}
        isOpen={isConnectDialogOpen}
        onClose={() => setIsConnectDialogOpen(false)}
      />
    </div>
  )
}
