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
      cell: (info) => (
        <div className='flex items-center gap-2'>
          <Text className='font-mono text-sm'>{info.getValue()}</Text>
          <button
            type='button'
            onClick={(e) => {
              e.stopPropagation()
              navigator.clipboard.writeText(info.getValue())
            }}
            className='text-dimmed hover:text-foreground transition-colors'
            title='Copy Access Key ID'
          >
            <Lucide.Copy className='size-3.5' />
          </button>
        </div>
      )
    }),
    columnHelper.accessor('created', {
      header: 'Created',
      cell: (info) => formatDate(info.getValue() || null)
    }),
    columnHelper.display({
      id: 'status',
      header: 'Status',
      cell: (info) => {
        const key = info.row.original
        if (key.deleted) {
          return (
            <Badge variant='secondary' pill className='h-5 px-2' size='sm'>
              <Lucide.Trash2 className='h-3 w-3' />
              Deleted
            </Badge>
          )
        }
        return (
          <Badge variant='success' pill className='h-5 px-2' size='sm'>
            <Lucide.CheckCircle2 className='h-3 w-3' />
            Active
          </Badge>
        )
      }
    }),
    columnHelper.display({
      id: 'delete',
      header: '',
      cell: (info) => {
        const key = info.row.original
        return (
          <div className='mx-2 flex justify-center'>
            <Button
              type='button'
              variant='plain'
              size='sm-icon'
              onClick={(e) => {
                e.stopPropagation()
                onDelete(key.id)
              }}
              title='Delete Access Key'
            >
              <Lucide.Trash2 className='text-danger size-4' />
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
            <TableHead>Status</TableHead>
            <TableHead className='w-16 text-right'></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={`skeleton-name-${i}`}>
              <TableCell>
                <div className='h-4 w-32 animate-pulse rounded bg-gray-100' />
              </TableCell>
              <TableCell>
                <div className='h-4 w-40 animate-pulse rounded bg-gray-100' />
              </TableCell>
              <TableCell>
                <div className='h-4 w-24 animate-pulse rounded bg-gray-100' />
              </TableCell>
              <TableCell>
                <div className='h-6 w-20 animate-pulse rounded-full bg-gray-100' />
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
          placeholder='Search access keys by name...'
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
        <div className='border-border bg-dimmed/5 flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-16 text-center'>
          <IconBox variant='tertiary-subtle' size='lg' circle className='mb-4'>
            <Lucide.Search className='size-16' />
          </IconBox>
          <div className='space-y-1'>
            <Text className='font-semibold'>No keys found</Text>
            <Text className='text-muted-foreground'>Try adjusting your search or filters.</Text>
          </div>
        </div>
      ) : keys.length === 0 ? (
        <div className='border-border bg-dimmed/5 flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-16 text-center'>
          <IconBox variant='tertiary-subtle' size='lg' circle className='mb-4'>
            <Lucide.KeyRound className='size-16' />
          </IconBox>
          <div className='space-y-1'>
            <Text className='font-semibold'>No access keys found</Text>
            <Text className='text-muted-foreground'>
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
                      className={clx('rounded-t', header.id === 'delete' ? 'w-16 text-right' : '')}
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
                      className={cell.column.id === 'delete' ? 'text-right' : ''}
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
