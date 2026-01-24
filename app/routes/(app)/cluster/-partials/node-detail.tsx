import { QueryClient, useMutation, useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import fetcher from '~/app/fetcher'
import type { NodeInfoResponse, RepairOperationResponse, RepairType } from './types'

interface NodeDetailProps {
  nodeId: string
  queryClient: QueryClient
}

export function NodeDetail({ nodeId, queryClient }: NodeDetailProps) {
  const [showRepairDialog, setShowRepairDialog] = React.useState(false)
  const [selectedRepairType, setSelectedRepairType] = React.useState<RepairType>('tables')

  // Get node info
  const { data: nodeInfoData, isLoading } = useQuery({
    queryKey: ['cluster', 'node', 'info', nodeId],
    queryFn: () =>
      fetcher<NodeInfoResponse>('/node/info', {
        params: { node: nodeId }
      }),
    enabled: !!nodeId
  })

  const nodeInfo = nodeInfoData?.success?.[nodeId]

  // Repair operation mutation
  const repairMutation = useMutation({
    mutationFn: ({ node, repairType }: { node: string; repairType: RepairType }) =>
      fetcher<RepairOperationResponse>('/node/repair', {
        method: 'POST',
        params: { node },
        body: { repairType }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cluster', 'node', 'info'] })
      setShowRepairDialog(false)
    }
  })

  const handleRepair = () => {
    repairMutation.mutate({ node: nodeId, repairType: selectedRepairType })
  }

  const repairTypes: { label: string; value: RepairType }[] = [
    { label: 'Tables', value: 'tables' },
    { label: 'Blocks', value: 'blocks' },
    { label: 'Versions', value: 'versions' },
    { label: 'Multipart Uploads', value: 'multipartUploads' },
    { label: 'Block References', value: 'blockRefs' },
    { label: 'Block Refcount', value: 'blockRc' },
    { label: 'Rebalance', value: 'rebalance' },
    { label: 'Aliases', value: 'aliases' },
    { label: 'Clear Resync Queue', value: 'clearResyncQueue' }
  ]

  if (isLoading) {
    return (
      <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6'>
        <div className='flex items-center justify-center py-8'>
          <svg className='size-8 animate-spin' fill='none' viewBox='0 0 24 24'>
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='4'
            />
            <path
              className='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            />
          </svg>
        </div>
      </div>
    )
  }

  if (!nodeInfo) {
    return (
      <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6'>
        <div className='rounded border border-gray-200 bg-gray-50 px-3 py-8 text-center text-sm text-gray-700'>
          <Lucide.XCircle className='mx-auto mb-2 size-8 text-gray-400' />
          <p>Unable to load node information</p>
          <Link
            to='/cluster'
            className='mt-2 inline-block text-sm text-blue-600 hover:text-blue-700'
          >
            Back to Cluster
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6'>
      <div className='mb-4 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Link
            to='/cluster'
            className='rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600'
          >
            <Lucide.ArrowLeft className='size-5' />
          </Link>
          <div>
            <h2 className='text-lg font-semibold sm:text-xl'>Node Details</h2>
            <p className='text-sm text-gray-500'>{nodeId}</p>
          </div>
        </div>
        <Lucide.Settings2 className='size-5 text-gray-400' />
      </div>

      {/* Node Information */}
      <div className='mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4'>
        <h3 className='mb-3 text-sm font-medium text-gray-900'>Node Information</h3>
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
          <div>
            <p className='text-xs text-gray-500'>Node ID</p>
            <p className='text-sm font-medium text-gray-900'>{nodeInfo.nodeId}</p>
          </div>
          <div>
            <p className='text-xs text-gray-500'>Garage Version</p>
            <p className='text-sm font-medium text-gray-900'>{nodeInfo.garageVersion}</p>
          </div>
          <div>
            <p className='text-xs text-gray-500'>Rust Version</p>
            <p className='text-sm font-medium text-gray-900'>{nodeInfo.rustVersion}</p>
          </div>
          <div>
            <p className='text-xs text-gray-500'>Database Engine</p>
            <p className='text-sm font-medium text-gray-900'>{nodeInfo.dbEngine}</p>
          </div>
        </div>

        {nodeInfo.garageFeatures && nodeInfo.garageFeatures.length > 0 && (
          <div className='mt-3'>
            <p className='mb-1 text-xs text-gray-500'>Garage Features</p>
            <div className='flex flex-wrap gap-1'>
              {nodeInfo.garageFeatures.map((feature, index) => (
                <span
                  key={index}
                  className='rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800'
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Repair Operations */}
      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <h3 className='text-sm font-medium text-gray-900'>Repair Operations</h3>
          <button
            type='button'
            onClick={() => setShowRepairDialog(!showRepairDialog)}
            className='rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50'
          >
            {showRepairDialog ? 'Hide' : 'Show'} Repair Options
          </button>
        </div>

        {showRepairDialog && (
          <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
            <div className='mb-3'>
              <label htmlFor='repair-type' className='mb-2 block text-sm font-medium text-gray-700'>
                Repair Type
              </label>
              <select
                id='repair-type'
                value={typeof selectedRepairType === 'object' ? 'scrub' : selectedRepairType}
                onChange={(e) => {
                  const value = e.target.value
                  setSelectedRepairType(
                    value === 'scrub' ? { scrub: 'all' } : (value as RepairType)
                  )
                }}
                className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none'
              >
                {repairTypes.map((type) => (
                  <option
                    key={type.label}
                    value={typeof type.value === 'object' ? 'scrub' : type.value}
                  >
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type='button'
              onClick={handleRepair}
              disabled={repairMutation.isPending}
              className='flex w-full items-center justify-center gap-2 rounded-md bg-orange-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
            >
              {repairMutation.isPending ? (
                <>
                  <svg className='size-4 animate-spin' fill='none' viewBox='0 0 24 24'>
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    />
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    />
                  </svg>
                  Running Repair...
                </>
              ) : (
                <>
                  <Lucide.Wrench className='size-4' />
                  Run Repair Operation
                </>
              )}
            </button>

            {/* Repair Results */}
            {repairMutation.data && (
              <div className='mt-3 rounded-lg border border-gray-200 bg-white p-3'>
                <p className='text-sm font-medium text-gray-900'>Repair Results</p>
                <div className='mt-2 space-y-1'>
                  {Object.entries(repairMutation.data.success).map(([node]) => (
                    <div key={node} className='flex items-center gap-2 text-xs'>
                      <Lucide.CheckCircle2 className='size-3.5 text-green-600' />
                      <span className='text-green-700'>{node}: Repair started</span>
                    </div>
                  ))}
                  {Object.entries(repairMutation.data.error).map(([node, error]) => (
                    <div key={node} className='flex items-center gap-2 text-xs'>
                      <Lucide.XCircle className='size-3.5 text-red-600' />
                      <span className='text-red-700'>
                        {node}: {error}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
