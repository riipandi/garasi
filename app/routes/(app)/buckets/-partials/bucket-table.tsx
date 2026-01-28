import { createColumnHelper, flexRender, useReactTable } from '@tanstack/react-table'
import { getCoreRowModel, getFilteredRowModel } from '@tanstack/react-table'
import { getPaginationRowModel, getSortedRowModel } from '@tanstack/react-table'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import { Badge } from '~/app/components/badge'
import { Button } from '~/app/components/button'
import { IconBox } from '~/app/components/icon-box'
import { InputGroup, InputGroupAddon } from '~/app/components/input-group'
import { Stack } from '~/app/components/stack'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow
} from '~/app/components/table'
import { Text } from '~/app/components/text'
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
          <Stack direction='row'>
            {aliases.map((alias) => (
              <Badge key={alias} variant='success' size='sm' pill>
                {alias}
              </Badge>
            ))}
          </Stack>
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
          <Stack direction='row'>
            {aliases.map((alias, index) => (
              <Badge
                key={`${alias.accessKeyId}-${alias.alias}-${index}`}
                variant='primary'
                size='sm'
                pill
                title={`Key: ${alias.accessKeyId}`}
              >
                {alias.alias}
              </Badge>
            ))}
          </Stack>
        ) : (
          <Text className='text-dimmed'>None</Text>
        )
      }
    }),
    columnHelper.display({
      id: 'delete',
      header: '',
      cell: (info) => {
        const bucket = info.row.original
        return (
          <div className='mx-2 flex justify-center'>
            <Button
              type='button'
              variant='danger'
              size='sm-icon'
              onClick={(e) => {
                e.stopPropagation()
                onDelete(bucket.id)
              }}
              title='Delete Bucket'
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
            <TableHead className='w-16 text-right'></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={`skeleton-row-bucket-${i}`}>
              <TableCell>
                <div className='bg-muted h-4 w-64 animate-pulse rounded' />
              </TableCell>
              <TableCell>
                <div className='bg-muted h-4 w-32 animate-pulse rounded' />
              </TableCell>
              <TableCell>
                <div className='bg-muted h-4 w-40 animate-pulse rounded' />
              </TableCell>
              <TableCell>
                <div className='bg-muted h-4 w-40 animate-pulse rounded' />
              </TableCell>
              <TableCell className='text-right'>
                <div className='bg-muted ml-auto h-8 w-8 animate-pulse rounded' />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )

  return (
    <Stack>
      <InputGroup>
        <InputGroupAddon align='start'>
          <Lucide.Search className='text-dimmed size-4' />
        </InputGroupAddon>
        <input
          type='text'
          value={filtering}
          onChange={(e) => setFiltering(e.target.value)}
          placeholder='Search buckets by ID or alias...'
          disabled={isLoading}
          className='text-foreground flex-1 bg-transparent py-2 pr-4 pl-2 text-sm ring-0 outline-none disabled:cursor-not-allowed disabled:opacity-50'
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
        <div className='border-border bg-muted/5 flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-16 text-center'>
          <IconBox variant='tertiary-subtle' size='lg' circle className='mb-4'>
            <Lucide.Search className='size-16' />
          </IconBox>
          <Stack>
            <Text className='font-semibold'>No buckets found</Text>
            <Text className='text-muted-foreground'>Try adjusting your search or filters.</Text>
          </Stack>
        </div>
      ) : buckets.length === 0 ? (
        <div className='border-border bg-muted/5 flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-16 text-center'>
          <IconBox variant='tertiary-subtle' size='lg' circle className='mb-4'>
            <Lucide.Database className='size-16' />
          </IconBox>
          <Stack>
            <Text className='font-semibold'>No buckets found</Text>
            <Text className='text-muted-foreground'>
              Get started by creating your first bucket to store your data.
            </Text>
          </Stack>
        </div>
      ) : (
        <TableContainer>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={header.id === 'delete' ? 'w-16 text-right' : ''}
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
    </Stack>
  )
}
