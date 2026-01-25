import * as Lucide from 'lucide-react'
import type { RepairType } from '~/shared/schemas/node.schema'

interface RepairOperationsCardProps {
  repairMutation: {
    isPending: boolean
    mutate: (variables: { node: string; repairType: RepairType }) => void
  }
  operationResults: Record<string, { success: boolean; message: string; timestamp: number }>
  handleRepair: (repairType: RepairType) => void
  getOperationStatus: (repairType: RepairType) => 'idle' | 'running' | 'success' | 'error'
}

export function RepairOperationsCard({
  repairMutation,
  operationResults,
  handleRepair,
  getOperationStatus
}: RepairOperationsCardProps) {
  // Repair operations with descriptions
  const repairOperations = [
    {
      id: 'tables' as RepairType,
      name: 'Tables',
      summary: 'Repair table data integrity and consistency',
      icon: Lucide.Database
    },
    {
      id: 'blocks' as RepairType,
      name: 'Blocks',
      summary: 'Repair block storage and references',
      icon: Lucide.Box
    },
    {
      id: 'versions' as RepairType,
      name: 'Versions',
      summary: 'Repair object version metadata',
      icon: Lucide.GitBranch
    },
    {
      id: 'multipartUploads' as RepairType,
      name: 'Multipart Uploads',
      summary: 'Repair incomplete multipart uploads',
      icon: Lucide.FileUp
    },
    {
      id: 'blockRefs' as RepairType,
      name: 'Block References',
      summary: 'Repair block reference tracking',
      icon: Lucide.Link
    },
    {
      id: 'blockRc' as RepairType,
      name: 'Block Refcount',
      summary: 'Repair block reference counts',
      icon: Lucide.Hash
    },
    {
      id: 'rebalance' as RepairType,
      name: 'Rebalance',
      summary: 'Rebalance data across cluster nodes',
      icon: Lucide.Scale
    },
    {
      id: 'aliases' as RepairType,
      name: 'Aliases',
      summary: 'Repair bucket alias mappings',
      icon: Lucide.SwitchCamera
    },
    {
      id: 'clearResyncQueue' as RepairType,
      name: 'Clear Resync Queue',
      summary: 'Clear items in the resynchronization queue',
      icon: Lucide.Trash2
    }
  ]

  // Scrub operations
  const scrubOperations = [
    {
      id: { scrub: 'start' } as RepairType,
      name: 'Start',
      icon: Lucide.Play,
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      id: { scrub: 'pause' } as RepairType,
      name: 'Pause',
      icon: Lucide.Pause,
      color: 'bg-yellow-600 hover:bg-yellow-700'
    },
    {
      id: { scrub: 'resume' } as RepairType,
      name: 'Resume',
      icon: Lucide.Play,
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      id: { scrub: 'cancel' } as RepairType,
      name: 'Cancel',
      icon: Lucide.X,
      color: 'bg-red-600 hover:bg-red-700'
    }
  ]

  return (
    <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
      <div className='mb-4 flex items-center gap-2'>
        <Lucide.Wrench className='size-5 text-orange-500' />
        <h2 className='text-lg font-semibold text-gray-900'>Repair Operations</h2>
      </div>

      <div className='space-y-4'>
        {/* Regular Repair Operations */}
        <div className='space-y-3'>
          {repairOperations.map((op) => {
            const status = getOperationStatus(op.id)
            const result = operationResults[JSON.stringify(op.id)]

            return (
              <div
                key={op.name}
                className={`flex items-center justify-between rounded-lg border p-4 ${
                  status === 'success'
                    ? 'border-green-200 bg-green-50'
                    : status === 'error'
                      ? 'border-red-200 bg-red-50'
                      : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className='flex items-center gap-3'>
                  <div
                    className={`rounded-md p-2 ${
                      status === 'success'
                        ? 'bg-green-100'
                        : status === 'error'
                          ? 'bg-red-100'
                          : 'bg-blue-100'
                    }`}
                  >
                    <op.icon
                      className={`size-5 ${
                        status === 'success'
                          ? 'text-green-600'
                          : status === 'error'
                            ? 'text-red-600'
                            : 'text-blue-600'
                      }`}
                    />
                  </div>
                  <div className='flex-1'>
                    <h3 className='text-sm font-semibold text-gray-900'>{op.name}</h3>
                    <p className='text-xs text-gray-500'>{op.summary}</p>
                    {result && (
                      <p
                        className={`mt-1 text-xs ${
                          result.success ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {result.message}
                      </p>
                    )}
                  </div>
                </div>
                {status === 'running' ? (
                  <div className='flex items-center gap-1.5 rounded-md bg-orange-600 px-3 py-2 text-xs font-medium text-white shadow-sm'>
                    <svg className='size-3 animate-spin' fill='none' viewBox='0 0 24 24'>
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
                    Running...
                  </div>
                ) : status === 'success' ? (
                  <div className='flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-2 text-xs font-medium text-white shadow-sm'>
                    <Lucide.CheckCircle2 className='size-3' />
                    Success
                  </div>
                ) : status === 'error' ? (
                  <button
                    type='button'
                    onClick={() => handleRepair(op.id)}
                    className='flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-2 text-xs font-medium text-white shadow-sm transition-all hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none'
                  >
                    <Lucide.RefreshCw className='size-3' />
                    Retry
                  </button>
                ) : (
                  <button
                    type='button'
                    onClick={() => handleRepair(op.id)}
                    disabled={repairMutation.isPending}
                    className='flex items-center gap-1.5 rounded-md bg-orange-600 px-3 py-2 text-xs font-medium text-white shadow-sm transition-all hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
                  >
                    <Lucide.Play className='size-3' />
                    Run
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Scrub Operations */}
        <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex items-center gap-3'>
              <div className='rounded-md bg-purple-100 p-2'>
                <Lucide.Sparkles className='size-5 text-purple-600' />
              </div>
              <div>
                <h3 className='text-sm font-semibold text-gray-900'>Scrub Operations</h3>
                <p className='text-xs text-gray-500'>Control data scrubbing process</p>
              </div>
            </div>
            <div className='flex flex-wrap gap-2'>
              {scrubOperations.map((op) => {
                const status = getOperationStatus(op.id)

                return (
                  <button
                    key={op.name}
                    type='button'
                    onClick={() => handleRepair(op.id)}
                    disabled={repairMutation.isPending}
                    className={`relative flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium text-white shadow-sm transition-all focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                      status === 'success'
                        ? 'bg-green-600 ring-2 ring-green-500 ring-offset-2 hover:bg-green-700'
                        : status === 'error'
                          ? 'bg-red-600 ring-2 ring-red-500 ring-offset-2 hover:bg-red-700'
                          : op.color
                    }`}
                  >
                    {status === 'running' ? (
                      <>
                        <svg className='size-3 animate-spin' fill='none' viewBox='0 0 24 24'>
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
                        Running...
                      </>
                    ) : status === 'success' ? (
                      <>
                        <Lucide.CheckCircle2 className='size-3' />
                        {op.name}
                      </>
                    ) : status === 'error' ? (
                      <>
                        <Lucide.RefreshCw className='size-3' />
                        Retry
                      </>
                    ) : (
                      <>
                        <op.icon className='size-3' />
                        {op.name}
                      </>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
          {/* Scrub result messages */}
          {scrubOperations.map((op) => {
            const result = operationResults[JSON.stringify(op.id)]
            if (!result) return null

            return (
              <div
                key={`result-${op.name}`}
                className={`mt-2 rounded-md px-3 py-2 text-xs ${
                  result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {result.message}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
