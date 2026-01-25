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
          <code className='font-mono text-sm'>{info.getValue()}</code>
          <button
            type='button'
            onClick={(e) => {
              e.stopPropagation()
              navigator.clipboard.writeText(info.getValue())
            }}
            className='text-gray-400 transition-colors hover:text-gray-600'
            title='Copy Access Key ID'
          >
            <Lucide.Copy className='h-3.5 w-3.5' />
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
            <span className='inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700'>
              <Lucide.Trash2 className='h-3 w-3' />
              Deleted
            </span>
          )
        }
        return (
          <span className='inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800'>
            <Lucide.CheckCircle2 className='h-3 w-3' />
            Active
          </span>
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
            <button
              type='button'
              onClick={(e) => {
                e.stopPropagation()
                onDelete(key.id)
              }}
              className='rounded p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none'
              title='Delete Access Key'
            >
              <Lucide.Trash2 className='size-4' />
            </button>
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

  // Skeleton loader for table rows
  const TableSkeleton = () => (
    <div className='overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm'>
      <table className='min-w-full divide-y divide-gray-200'>
        <thead className='bg-gray-50'>
          <tr>
            <th className='px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
              Name
            </th>
            <th className='px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
              Access Key ID
            </th>
            <th className='px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
              Created
            </th>
            <th className='px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
              Status
            </th>
            <th className='w-16 px-4 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase'></th>
          </tr>
        </thead>
        <tbody className='divide-y divide-gray-200'>
          {Array.from({ length: 5 }).map((_, index) => (
            <tr key={index} className='animate-pulse'>
              <td className='px-4 py-3'>
                <div className='h-4 w-32 rounded bg-gray-200' />
              </td>
              <td className='px-4 py-3'>
                <div className='h-4 w-40 rounded bg-gray-200' />
              </td>
              <td className='px-4 py-3'>
                <div className='h-4 w-24 rounded bg-gray-200' />
              </td>
              <td className='px-4 py-3'>
                <div className='h-6 w-20 rounded-full bg-gray-200' />
              </td>
              <td className='px-4 py-3'>
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
          placeholder='Search access keys by name...'
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
      ) : table.getRowModel().rows.length === 0 && keys.length > 0 ? (
        <div className='flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 py-16 text-center'>
          <Lucide.Search className='mb-4 h-16 w-16 text-gray-400' />
          <h3 className='text-lg font-medium text-gray-900'>No keys found</h3>
          <p className='text-normal mt-2 text-gray-500'>Try adjusting your search or filters.</p>
        </div>
      ) : keys.length === 0 ? (
        <div className='flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 py-16 text-center'>
          <Lucide.KeyRound className='mb-4 h-16 w-16 text-gray-400' />
          <h3 className='text-lg font-medium text-gray-900'>No access keys found</h3>
          <p className='text-normal mt-2 text-gray-500'>
            Get started by creating a new access key or importing an existing one.
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
                      className={`px-4 py-3 text-xs font-medium tracking-wider text-gray-500 uppercase ${
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
                    const keyId = row.original.id
                    window.location.href = `/keys/${keyId}`
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={`px-4 py-2 text-sm whitespace-nowrap text-gray-900 ${
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
