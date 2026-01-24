import { createColumnHelper, flexRender, useReactTable } from '@tanstack/react-table'
import { getCoreRowModel, getFilteredRowModel } from '@tanstack/react-table'
import { getPaginationRowModel, getSortedRowModel } from '@tanstack/react-table'
import * as Lucide from 'lucide-react'
import * as React from 'react'
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
          <code className='font-mono text-sm'>{info.getValue()}</code>
          <button
            type='button'
            onClick={(e) => {
              e.stopPropagation()
              navigator.clipboard.writeText(info.getValue())
            }}
            className='text-gray-400 transition-colors hover:text-gray-600'
            title='Copy Bucket ID'
          >
            <Lucide.Copy className='h-3.5 w-3.5' />
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
              <span
                key={alias}
                className='inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800'
              >
                {alias}
              </span>
            ))}
          </div>
        ) : (
          <span className='text-gray-400'>None</span>
        )
      }
    }),
    columnHelper.accessor('localAliases', {
      header: 'Local Aliases',
      cell: (info) => {
        const aliases = info.getValue<{ accessKeyId: string; alias: string }[]>()
        return aliases.length > 0 ? (
          <div className='flex flex-wrap gap-1'>
            {aliases.map((alias, index) => (
              <span
                key={index}
                className='inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800'
                title={`Key: ${alias.accessKeyId}`}
              >
                {alias.alias}
              </span>
            ))}
          </div>
        ) : (
          <span className='text-gray-400'>None</span>
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
            <button
              type='button'
              onClick={(e) => {
                e.stopPropagation()
                onDelete(bucket.id)
              }}
              className='rounded p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none'
              title='Delete Bucket'
            >
              <Lucide.Trash2 className='size-4' />
            </button>
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

  // Skeleton loader for table rows
  const TableSkeleton = () => (
    <div className='overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm'>
      <table className='min-w-full divide-y divide-gray-200'>
        <thead className='bg-gray-50'>
          <tr>
            <th className='px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
              Bucket ID
            </th>
            <th className='px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
              Created
            </th>
            <th className='px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
              Global Aliases
            </th>
            <th className='px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
              Local Aliases
            </th>
            <th className='w-16 px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase'></th>
          </tr>
        </thead>
        <tbody className='divide-y divide-gray-200'>
          {Array.from({ length: 5 }).map((_, index) => (
            <tr key={index} className='animate-pulse'>
              <td className='px-6 py-4'>
                <div className='h-4 w-64 rounded bg-gray-200' />
              </td>
              <td className='px-6 py-4'>
                <div className='h-4 w-32 rounded bg-gray-200' />
              </td>
              <td className='px-6 py-4'>
                <div className='h-4 w-40 rounded bg-gray-200' />
              </td>
              <td className='px-6 py-4'>
                <div className='h-4 w-40 rounded bg-gray-200' />
              </td>
              <td className='px-6 py-4'>
                <div className='flex justify-end'>
                  <div className='h-8 w-8 rounded bg-gray-200' />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className='space-y-4'>
      {/* Search/Filter Input */}
      <div className='relative'>
        <div className='pointer-events-none absolute left-3 flex h-full items-center'>
          <Lucide.Search className='size-4 text-gray-400' />
        </div>
        <input
          type='text'
          value={filtering}
          onChange={(e) => setFiltering(e.target.value)}
          placeholder='Search buckets by ID or alias...'
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

      {/* Table */}
      {isLoading ? (
        <TableSkeleton />
      ) : table.getRowModel().rows.length === 0 && buckets.length > 0 ? (
        <div className='flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 py-16 text-center'>
          <Lucide.Search className='mb-4 h-16 w-16 text-gray-400' />
          <h3 className='text-lg font-medium text-gray-900'>No buckets found</h3>
          <p className='text-normal mt-2 text-gray-500'>Try adjusting your search or filters.</p>
        </div>
      ) : buckets.length === 0 ? (
        <div className='flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 py-16 text-center'>
          <Lucide.Database className='mb-4 h-16 w-16 text-gray-400' />
          <h3 className='text-lg font-medium text-gray-900'>No buckets found</h3>
          <p className='text-normal mt-2 text-gray-500'>
            Get started by creating your first bucket to store your data.
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
                      className={`px-6 py-3 text-xs font-medium tracking-wider text-gray-500 uppercase ${
                        header.id === 'delete' ? 'w-16 text-right' : 'text-left'
                      }`}
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
                    const bucketId = row.original.id
                    window.location.href = `/buckets/${bucketId}`
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={`px-6 py-3 text-sm whitespace-nowrap text-gray-900 ${
                        cell.column.id === 'delete' ? 'text-right' : ''
                      }`}
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
  )
}
