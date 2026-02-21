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
import type { ListBucketsResponse } from '~/shared/schemas/bucket.schema'

interface BucketTableProps {
  buckets: ListBucketsResponse[]
  onDelete: (bucketId: string) => void
  isLoading?: boolean
}

const columnHelper = createColumnHelper<ListBucketsResponse>()

export function BucketTable({ buckets, onDelete, isLoading = false }: BucketTableProps) {
  const [filtering, setFiltering] = React.useState('')

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const columns = [
    columnHelper.accessor('id', {
      header: 'Bucket ID',
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
            title='Copy Bucket ID'
          >
            <Lucide.Copy className='size-3.5' />
          </button>
        </div>
      ),
      filterFn: (row, value) => {
        return row.original.id.toLowerCase().includes(value.toLowerCase())
      }
    }),
    columnHelper.accessor('created', {
      header: 'Created',
      cell: (info) => formatDate(info.getValue())
    }),
    columnHelper.accessor('globalAliases', {
      header: 'Global Aliases',
      cell: (info) => {
        const aliases = info.getValue<string[]>()
        return aliases.length > 0 ? (
          <div className='flex flex-wrap gap-1'>
            {aliases.map((alias) => (
              <Badge key={alias} variant='success' size='sm' pill>
                {alias}
              </Badge>
            ))}
          </div>
        ) : (
          <Text className='text-dimmed'>None</Text>
        )
      }
    }),
    columnHelper.accessor('localAliases', {
      header: 'Local Aliases',
      cell: (info) => {
        const aliases = info.getValue<{ accessKeyId: string; alias: string }[]>()
        return aliases.length > 0 ? (
          <div className='flex flex-wrap gap-1'>
            {aliases.map((alias) => (
              <Badge
                key={`${alias.accessKeyId}-${alias.alias}`}
                variant='primary'
                size='sm'
                pill
                title={`Key: ${alias.accessKeyId}`}
              >
                {alias.alias}
              </Badge>
            ))}
          </div>
        ) : (
          <Text className='text-dimmed'>None</Text>
        )
      }
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: (info) => {
        const bucket = info.row.original
        return (
          <div className='flex justify-end gap-1'>
            <Button
              type='button'
              variant='plain'
              size='sm-icon'
              onClick={(e) => {
                e.stopPropagation()
                onDelete(bucket.id)
              }}
              title='Delete Bucket'
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
    data: buckets,
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
            <TableHead>Bucket ID</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Global Aliases</TableHead>
            <TableHead>Local Aliases</TableHead>
            <TableHead className='w-20 text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={`skeleton-row-bucket-${i}`}>
              <TableCell>
                <div className='h-4 w-64 animate-pulse rounded bg-gray-100' />
              </TableCell>
              <TableCell>
                <div className='h-4 w-32 animate-pulse rounded bg-gray-100' />
              </TableCell>
              <TableCell>
                <div className='h-4 w-40 animate-pulse rounded bg-gray-100' />
              </TableCell>
              <TableCell>
                <div className='h-4 w-40 animate-pulse rounded bg-gray-100' />
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
          placeholder='Search buckets by ID...'
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
      ) : table.getRowModel().rows.length === 0 && buckets.length > 0 ? (
        <div className='border-border bg-dimmed/5 flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-16 text-center'>
          <IconBox variant='tertiary-subtle' size='lg' circle className='mb-4'>
            <Lucide.Search className='size-16' />
          </IconBox>
          <div className='space-y-1'>
            <Text className='font-semibold'>No buckets found</Text>
            <Text className='text-muted-foreground'>Try adjusting your search or filters.</Text>
          </div>
        </div>
      ) : buckets.length === 0 ? (
        <div className='border-border bg-dimmed/5 flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-16 text-center'>
          <IconBox variant='tertiary-subtle' size='lg' circle className='mb-4'>
            <Lucide.Database className='size-16' />
          </IconBox>
          <div className='space-y-1'>
            <Text className='font-semibold'>No buckets</Text>
            <Text className='text-muted-foreground'>
              Get started by creating your first bucket to store your data.
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
                    const bucketId = row.original.id
                    window.location.href = `/buckets/${bucketId}`
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
