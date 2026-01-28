import * as Lucide from 'lucide-react'
import { Badge } from '~/app/components/badge'
import { Button } from '~/app/components/button'
import { Card, CardBody, CardHeader, CardTitle } from '~/app/components/card'
import { Heading } from '~/app/components/heading'
import { Text } from '~/app/components/text'
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

  const scrubOperations = [
    {
      id: { scrub: 'start' } as RepairType,
      name: 'Start',
      icon: Lucide.Play,
      variant: 'primary' as const
    },
    {
      id: { scrub: 'pause' } as RepairType,
      name: 'Pause',
      icon: Lucide.Pause,
      variant: 'tertiary' as const
    },
    {
      id: { scrub: 'resume' } as RepairType,
      name: 'Resume',
      icon: Lucide.Play,
      variant: 'primary' as const
    },
    {
      id: { scrub: 'cancel' } as RepairType,
      name: 'Cancel',
      icon: Lucide.X,
      variant: 'danger' as const
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Heading size='md'>Repair Operations</Heading>
        </CardTitle>
      </CardHeader>
      <CardBody>
        <div className='space-y-4'>
          <div className='space-y-3'>
            {repairOperations.map((op) => {
              const status = getOperationStatus(op.id)
              const result = operationResults[JSON.stringify(op.id)]

              return (
                <div
                  key={op.name}
                  className={`flex items-center justify-between rounded-lg border p-4 ${
                    status === 'success'
                      ? 'border-success/30 bg-success/10'
                      : status === 'error'
                        ? 'border-danger/30 bg-danger/10'
                        : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className='flex items-center gap-3'>
                    <div
                      className={`rounded-md p-2 ${
                        status === 'success'
                          ? 'bg-success/20'
                          : status === 'error'
                            ? 'bg-danger/20'
                            : 'bg-primary/15'
                      }`}
                    >
                      <op.icon
                        className={`size-5 ${
                          status === 'success'
                            ? 'text-success'
                            : status === 'error'
                              ? 'text-danger'
                              : 'text-primary'
                        }`}
                      />
                    </div>
                    <div className='flex-1'>
                      <Text className='text-sm font-semibold'>{op.name}</Text>
                      <Text className='text-muted text-xs'>{op.summary}</Text>
                      {result && (
                        <Text
                          className={`mt-1 text-xs ${result.success ? 'text-success' : 'text-danger'}`}
                        >
                          {result.message}
                        </Text>
                      )}
                    </div>
                  </div>
                  {status === 'running' ? (
                    <Badge variant='warning'>
                      <Lucide.Loader2 className='size-3.5 animate-spin' />
                      Running...
                    </Badge>
                  ) : status === 'success' ? (
                    <Badge variant='success'>
                      <Lucide.CheckCircle2 className='size-3.5' />
                      Success
                    </Badge>
                  ) : status === 'error' ? (
                    <Button variant='danger' size='sm' onClick={() => handleRepair(op.id)}>
                      <Lucide.RefreshCw className='size-3.5' />
                      Retry
                    </Button>
                  ) : (
                    <Button
                      variant='primary'
                      size='sm'
                      onClick={() => handleRepair(op.id)}
                      disabled={repairMutation.isPending}
                    >
                      <Lucide.Play className='size-3.5' />
                      Run
                    </Button>
                  )}
                </div>
              )
            })}
          </div>

          <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
            <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <div className='flex items-center gap-3'>
                <div className='rounded-md bg-purple-100 p-2'>
                  <Lucide.Sparkles className='size-5 text-purple-600' />
                </div>
                <div>
                  <Text className='text-sm font-semibold'>Scrub Operations</Text>
                  <Text className='text-muted text-xs'>Control data scrubbing process</Text>
                </div>
              </div>
              <div className='flex flex-wrap gap-2'>
                {scrubOperations.map((op) => {
                  const status = getOperationStatus(op.id)

                  return (
                    <Button
                      key={op.name}
                      variant={op.variant}
                      size='sm'
                      onClick={() => handleRepair(op.id)}
                      disabled={repairMutation.isPending}
                    >
                      {status === 'running' ? (
                        <>
                          <Lucide.Loader2 className='size-3.5 animate-spin' />
                          Running...
                        </>
                      ) : status === 'success' ? (
                        <>
                          <Lucide.CheckCircle2 className='size-3.5' />
                          {op.name}
                        </>
                      ) : status === 'error' ? (
                        <>
                          <Lucide.RefreshCw className='size-3.5' />
                          Retry
                        </>
                      ) : (
                        <>
                          <op.icon className='size-3.5' />
                          {op.name}
                        </>
                      )}
                    </Button>
                  )
                })}
              </div>
            </div>
            {scrubOperations.map((op) => {
              const result = operationResults[JSON.stringify(op.id)]
              if (!result) return null

              return (
                <div
                  key={`result-${op.name}`}
                  className={`mt-2 rounded-md px-3 py-2 text-xs ${
                    result.success ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'
                  }`}
                >
                  {result.message}
                </div>
              )
            })}
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
