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
import type { ListAccessKeysResponse } from '~/shared/schemas/keys.schema'

// Extend to add deleted property for UI
interface AccessKeyListItem extends ListAccessKeysResponse {
  deleted?: boolean
}

interface KeyTableProps {
  keys: AccessKeyListItem[]
  onDelete: (keyId: string) => void
  isLoading?: boolean
}

const columnHelper = createColumnHelper<AccessKeyListItem>()

export function KeyTable({ keys, onDelete, isLoading = false }: KeyTableProps) {
  const [filtering, setFiltering] = React.useState('')
  const [copiedKeyId, setCopiedKeyId] = React.useState<string | null>(null)
  const buttonRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map())
  const getButtonRef = React.useCallback(
    (keyId: string) => (el: HTMLButtonElement | null) => {
      if (el) buttonRefs.current.set(keyId, el)
    },
    []
  )
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const columns = [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: (info) => info.getValue(),
      filterFn: (row, value) => {
        return row.original.name.toLowerCase().includes(value.toLowerCase())
      }
    }),
    columnHelper.accessor('id', {
      header: 'Access Key ID',
      cell: (info) => {
        const keyId = info.getValue()
        return (
          <div className='flex items-center gap-2'>
            <Text className='text-muted-foreground font-mono text-sm'>{keyId}</Text>
            <Button
              ref={getButtonRef(keyId)}
              type='button'
              variant='plain'
              size='xs-icon'
              onClick={(e) => {
                e.stopPropagation()
                navigator.clipboard.writeText(keyId)
                setCopiedKeyId(keyId)

                anchoredToast.add({
                  description: 'Copied',
                  positionerProps: {
                    anchor: buttonRefs.current.get(keyId) || null,
                    sideOffset: 8
                  },
                  data: { size: 'sm' },
                  onClose: () => {
                    setCopiedKeyId(null)
                  },
                  timeout: 1500
                })
              }}
              disabled={copiedKeyId === keyId}
              title='Copy Access Key ID'
              className={clx(
                'text-dimmed hover:text-primary transition-colors',
                copiedKeyId === keyId && 'text-success'
              )}
            >
              {copiedKeyId === keyId ? (
                <Lucide.Check className='size-3.5' />
              ) : (
                <Lucide.Copy className='size-3.5' />
              )}
            </Button>
          </div>
        )
      }
    }),
    columnHelper.accessor('created', {
      header: 'Created',
      cell: (info) => {
        const date = info.getValue()
        return (
          <div className='flex items-center gap-1.5'>
            <Lucide.Calendar className='text-dimmed size-3.5' />
            <Text className='text-muted-foreground text-sm'>{formatDate(date || null)}</Text>
          </div>
        )
      }
    }),
    columnHelper.accessor('expiration', {
      header: 'Expiration',
      cell: (info) => {
        const expiration = info.getValue()
        const expired = info.row.original.expired

        if (!expiration) {
          return (
            <div className='flex items-center gap-1.5'>
              <Lucide.Infinity className='text-muted size-3.5' />
              <Badge variant='secondary' pill className='h-5.5 px-2' size='sm'>
                Never
              </Badge>
            </div>
          )
        }

        return (
          <div className='flex items-center gap-2'>
            <Lucide.Clock className={clx('size-3.5', expired ? 'text-danger' : 'text-dimmed')} />
            <Text
              className={clx(
                'text-sm',
                expired ? 'text-danger font-medium' : 'text-muted-foreground'
              )}
            >
              {formatDate(expiration)}
            </Text>
            {expired && (
              <Badge variant='danger' pill className='h-5.5 px-2' size='sm'>
                Expired
              </Badge>
            )}
          </div>
        )
      }
    }),
    columnHelper.display({
      id: 'status',
      header: 'Status',
      cell: (info) => {
        const key = info.row.original
        if (key.deleted) {
          return (
            <Badge variant='secondary' pill className='h-5.5 px-2' size='sm'>
              <Lucide.Ban className='size-3' />
              Deleted
            </Badge>
          )
        }
        if (key.expired) {
          return (
            <Badge variant='danger' pill className='h-5.5 px-2' size='sm'>
              <Lucide.XCircle className='size-3' />
              Expired
            </Badge>
          )
        }
        return (
          <Badge variant='success' pill className='h-5.5 px-2' size='sm'>
            <Lucide.CheckCircle2 className='size-3' />
            Active
          </Badge>
        )
      }
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: (info) => {
        const key = info.row.original
        return (
          <div className='flex justify-end gap-1'>
            <Button
              type='button'
              variant='plain'
              size='sm-icon'
              onClick={(e) => {
                e.stopPropagation()
                onDelete(key.id)
              }}
              title='Delete Access Key'
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
    data: keys,
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
            <TableHead>Name</TableHead>
            <TableHead>Access Key ID</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Expiration</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className='w-20 text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={`skeleton-${i}`}>
              <TableCell>
                <div className='flex items-center gap-2'>
                  <div className='bg-dimmed/10 size-4 animate-pulse rounded' />
                  <div className='bg-dimmed/10 h-4 w-32 animate-pulse rounded' />
                </div>
              </TableCell>
              <TableCell>
                <div className='flex items-center gap-2'>
                  <div className='bg-dimmed/10 h-3.5 w-40 animate-pulse rounded' />
                  <div className='bg-dimmed/10 size-3.5 animate-pulse rounded' />
                </div>
              </TableCell>
              <TableCell>
                <div className='flex items-center gap-1.5'>
                  <div className='bg-dimmed/10 size-3.5 animate-pulse rounded' />
                  <div className='bg-dimmed/10 h-3.5 w-24 animate-pulse rounded' />
                </div>
              </TableCell>
              <TableCell>
                <div className='flex items-center gap-1.5'>
                  <div className='bg-dimmed/10 size-3.5 animate-pulse rounded' />
                  <div className='bg-dimmed/10 h-3.5 w-24 animate-pulse rounded' />
                </div>
              </TableCell>
              <TableCell>
                <div className='bg-dimmed/10 h-5.5 w-20 animate-pulse rounded-full' />
              </TableCell>
              <TableCell className='text-right'>
                <div className='bg-dimmed/10 ml-auto h-8 w-8 animate-pulse rounded' />
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
          placeholder='Search keys by name...'
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
      ) : table.getRowModel().rows.length === 0 && keys.length > 0 ? (
        <div className='border-border bg-dimmed/10 flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-16 text-center'>
          <IconBox variant='tertiary-subtle' size='lg' circle className='mb-4'>
            <Lucide.Search className='size-16' />
          </IconBox>
          <div className='space-y-1'>
            <Text className='font-semibold'>No keys found</Text>
            <Text className='text-muted-foreground text-sm'>
              Try adjusting your search or filters.
            </Text>
          </div>
        </div>
      ) : keys.length === 0 ? (
        <div className='border-border bg-dimmed/10 flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-16 text-center'>
          <IconBox variant='tertiary-subtle' size='lg' circle className='mb-4'>
            <Lucide.KeyRound className='size-16' />
          </IconBox>
          <div className='space-y-1'>
            <Text className='font-semibold'>No access keys</Text>
            <Text className='text-muted-foreground text-sm'>
              Get started by creating a new access key or importing an existing one.
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
                    const keyId = row.original.id
                    window.location.href = `/keys/${keyId}`
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
