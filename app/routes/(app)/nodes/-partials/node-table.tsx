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
import { Badge } from '~/app/components/badge'
import { Button } from '~/app/components/button'
import { IconBox } from '~/app/components/icon-box'
import { Input } from '~/app/components/input'
import { InputGroup, InputGroupAddon } from '~/app/components/input-group'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow
} from '~/app/components/table'
import { anchoredToast } from '~/app/components/toast'
import { Text } from '~/app/components/typography'
import { clx } from '~/app/utils'
import type { NodeResp } from '~/shared/schemas/cluster.schema'

interface NodeTableProps {
  nodes: NodeResp[]
  onDelete?: (nodeId: string) => void
  isLoading?: boolean
}

const columnHelper = createColumnHelper<NodeResp>()

export function NodeTable({ nodes, onDelete, isLoading = false }: NodeTableProps) {
  const [filtering, setFiltering] = React.useState('')
  const [copiedNodeId, setCopiedNodeId] = React.useState<string | null>(null)
  const buttonRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map())
  const getButtonRef = React.useCallback(
    (nodeId: string) => (el: HTMLButtonElement | null) => {
      if (el) buttonRefs.current.set(nodeId, el)
    },
    []
  )

  const formatTimeAgo = (seconds: number | null): string => {
    if (seconds === null) return 'Never'
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  const columns = [
    columnHelper.accessor('id', {
      header: 'Node ID',
      cell: (info) => {
        const nodeId = info.getValue()
        return (
          <div className='flex items-center gap-2' title={nodeId}>
            <Text className='max-w-36 truncate font-mono text-sm'>{nodeId}</Text>
            <Button
              ref={getButtonRef(nodeId)}
              type='button'
              variant='plain'
              size='xs-icon'
              onClick={(e) => {
                e.stopPropagation()
                navigator.clipboard.writeText(nodeId)
                setCopiedNodeId(nodeId)

                anchoredToast.add({
                  description: 'Copied',
                  positionerProps: {
                    anchor: buttonRefs.current.get(nodeId) || null,
                    sideOffset: 8
                  },
                  data: { size: 'sm' },
                  onClose: () => {
                    setCopiedNodeId(null)
                  },
                  timeout: 1500
                })
              }}
              disabled={copiedNodeId === nodeId}
              title='Copy Node ID'
              className={clx(
                'text-dimmed hover:text-primary transition-colors',
                copiedNodeId === nodeId && 'text-success'
              )}
            >
              {copiedNodeId === nodeId ? (
                <Lucide.Check className='size-3.5' />
              ) : (
                <Lucide.Copy className='size-3.5' />
              )}
            </Button>
          </div>
        )
      },
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
          <Badge variant={node.isUp ? 'success' : 'danger'} pill size='sm'>
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
        return node.garageVersion || 'N/A'
      }
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: (info) => {
        const node = info.row.original
        return (
          <div className='flex justify-end gap-1'>
            <Button
              type='button'
              variant='plain'
              size='sm-icon'
              onClick={(e) => {
                e.stopPropagation()
                if (onDelete) {
                  onDelete(node.id)
                } else {
                  console.log('Delete node:', node.id)
                }
              }}
              title='Delete Node'
              className='text-dimmed hover:text-danger hover:bg-danger/5'
            >
              <Lucide.Trash2 className='size-4' />
            </Button>
          </div>
        )
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

  const TableSkeleton = () => (
    <TableContainer>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Node ID</TableHead>
            <TableHead>Hostname</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Seen</TableHead>
            <TableHead>Version</TableHead>
            <TableHead className='w-20 text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={`node-skeleton-row-${i}`}>
              <TableCell>
                <div className='flex items-center gap-2'>
                  <div className='size-4 animate-pulse rounded bg-gray-100' />
                  <div className='h-4 w-36 animate-pulse rounded bg-gray-100' />
                </div>
              </TableCell>
              <TableCell>
                <div className='h-4 w-24 animate-pulse rounded bg-gray-100' />
              </TableCell>
              <TableCell>
                <div className='h-4 w-36 animate-pulse rounded bg-gray-100' />
              </TableCell>
              <TableCell>
                <div className='h-5.5 w-20 animate-pulse rounded-full bg-gray-100' />
              </TableCell>
              <TableCell>
                <div className='h-4 w-20 animate-pulse rounded bg-gray-100' />
              </TableCell>
              <TableCell>
                <div className='h-4 w-16 animate-pulse rounded bg-gray-100' />
              </TableCell>
              <TableCell className='text-right'>
                <div className='ml-auto h-8 w-8 animate-pulse rounded bg-gray-100' />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )

  return (
    <div className='space-y-4'>
      <InputGroup>
        <InputGroupAddon align='start'>
          <Lucide.Search className='text-dimmed size-4' />
        </InputGroupAddon>
        <Input
          type='text'
          value={filtering}
          onChange={(e) => setFiltering(e.target.value)}
          placeholder='Search nodes by ID or hostname...'
          disabled={isLoading}
        />
        {filtering && !isLoading && (
          <InputGroupAddon align='end'>
            <Button
              type='button'
              variant='plain'
              size='xs-icon'
              onClick={() => setFiltering('')}
              title='Clear search'
            >
              <Lucide.X className='size-4' />
            </Button>
          </InputGroupAddon>
        )}
      </InputGroup>

      {isLoading ? (
        <TableSkeleton />
      ) : table.getRowModel().rows.length === 0 && nodes.length > 0 ? (
        <div className='border-border bg-dimmed/5 flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-16 text-center'>
          <IconBox variant='tertiary-subtle' size='lg' circle className='mb-4'>
            <Lucide.Search className='size-16' />
          </IconBox>
          <div className='space-y-1'>
            <Text className='font-semibold'>No nodes found</Text>
            <Text className='text-muted-foreground text-sm'>
              Try adjusting your search or filters.
            </Text>
          </div>
        </div>
      ) : nodes.length === 0 ? (
        <div className='border-border bg-dimmed/5 flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-16 text-center'>
          <IconBox variant='tertiary-subtle' size='lg' circle className='mb-4'>
            <Lucide.Server className='size-16' />
          </IconBox>
          <div className='space-y-1'>
            <Text className='font-semibold'>No nodes connected</Text>
            <Text className='text-muted-foreground text-sm'>
              Connect nodes to your cluster to get started.
            </Text>
          </div>
        </div>
      ) : (
        <TableContainer className='border-border rounded-lg border border-t-transparent'>
          <Table className='rounded-lg'>
            <TableHeader className='rounded-t'>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className='rounded-t'>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={clx('rounded-t', header.id === 'actions' ? 'w-20 text-right' : '')}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className='cursor-pointer'
                  onClick={() => {
                    const nodeId = row.original.id
                    window.location.href = `/nodes/${nodeId}`
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cell.column.id === 'actions' ? 'text-right' : ''}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  )
}
