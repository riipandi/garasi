import { queryOptions, useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import { Card } from '~/app/components/card'
import { Text, TextLink } from '~/app/components/text'
import { getNodeInfo, launchRepairOperation } from '~/app/services/node.service'
import type { RepairType } from '~/shared/schemas/node.schema'

const NodeInformationCard = React.lazy(() =>
  import('./-partials/node-information-card').then((m) => ({
    default: m.NodeInformationCard
  }))
)
const RepairOperationsCard = React.lazy(() =>
  import('./-partials/repair-operations-card').then((m) => ({
    default: m.RepairOperationsCard
  }))
)

interface NodeInfo {
  nodeId: string
  garageVersion: string
  rustVersion: string
  dbEngine: string
  garageFeatures: string[] | null
}

export const Route = createFileRoute('/(app)/cluster/nodes/$id')({
  component: RouteComponent,
  loader: ({ context, params }) => {
    context.queryClient.ensureQueryData(nodeInfoQuery(params.id))
  }
})

const nodeInfoQuery = (nodeId: string) =>
  queryOptions({
    queryKey: ['cluster', 'node', 'info', nodeId],
    queryFn: () => getNodeInfo({ node: nodeId })
  })

function RouteComponent() {
  const { queryClient } = Route.useRouteContext()
  const { id } = Route.useParams()

  const { data: nodeInfoData } = useSuspenseQuery(nodeInfoQuery(id))
  const nodeInfo = nodeInfoData?.data?.success?.[id] as NodeInfo | undefined

  const [runningOperation, setRunningOperation] = React.useState<RepairType | null>(null)
  const [operationResults, setOperationResults] = React.useState<
    Record<string, { success: boolean; message: string; timestamp: number }>
  >({})

  React.useEffect(() => {
    const now = Date.now()
    Object.entries(operationResults).forEach(([opKey, result]) => {
      if (now - result.timestamp > 5000) {
        setOperationResults((prev) => {
          const newState = { ...prev }
          delete newState[opKey]
          return newState
        })
      }
    })
  }, [operationResults])

  const repairMutation = useMutation({
    mutationFn: ({ node, repairType }: { node: string; repairType: RepairType }) =>
      launchRepairOperation({ node }, { repairType }),
    onMutate: (variables) => {
      setRunningOperation(variables.repairType)
    },
    onSuccess: (data, variables) => {
      const opKey = JSON.stringify(variables.repairType)
      const success = data.data?.success && Object.keys(data.data.success).length > 0
      const error = data.data?.error && Object.keys(data.data.error).length > 0

      if (success) {
        setOperationResults((prev) => ({
          ...prev,
          [opKey]: {
            success: true,
            message: 'Operation completed successfully',
            timestamp: Date.now()
          }
        }))
      } else if (error && data.data?.error) {
        const firstError = Object.entries(data.data.error)[0]
        if (firstError) {
          setOperationResults((prev) => ({
            ...prev,
            [opKey]: {
              success: false,
              message: `${firstError[0]}: ${firstError[1]}`,
              timestamp: Date.now()
            }
          }))
        }
      }
      queryClient.invalidateQueries({ queryKey: ['cluster', 'node', 'info'] })
    },
    onError: (error) => {
      const opKey = JSON.stringify(runningOperation)
      setOperationResults((prev) => ({
        ...prev,
        [opKey]: {
          success: false,
          message: error.message || 'Operation failed',
          timestamp: Date.now()
        }
      }))
    },
    onSettled: () => {
      setRunningOperation(null)
    }
  })

  const handleRepair = (repairType: RepairType) => {
    setOperationResults((prev) => {
      const newState = { ...prev }
      delete newState[JSON.stringify(repairType)]
      return newState
    })
    repairMutation.mutate({ node: id, repairType })
  }

  const getOperationStatus = (repairType: RepairType) => {
    const opKey = JSON.stringify(repairType)
    const result = operationResults[opKey]
    const isRunning = JSON.stringify(runningOperation) === opKey

    if (isRunning) return 'running'
    if (result) return result.success ? 'success' : 'error'
    return 'idle'
  }

  if (!nodeInfo) {
    return (
      <div className='mx-auto max-w-screen-2xl space-y-6'>
        <Card>
          <div className='flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 py-16 text-center'>
            <Lucide.XCircle className='text-muted mb-4 size-16' />
            <Text className='font-medium'>Unable to load node information</Text>
            <TextLink render={<Link to='/cluster' />} className='mt-2'>
              Back to Cluster
            </TextLink>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-screen-2xl space-y-6'>
      <React.Suspense
        fallback={
          <Card>
            <div className='flex items-center justify-center py-8'>
              <Lucide.Loader2 className='text-muted size-6 animate-spin' />
            </div>
          </Card>
        }
      >
        <NodeInformationCard nodeInfo={nodeInfo} />
      </React.Suspense>

      <React.Suspense
        fallback={
          <Card>
            <div className='flex items-center justify-center py-8'>
              <Lucide.Loader2 className='text-muted size-6 animate-spin' />
            </div>
          </Card>
        }
      >
        <RepairOperationsCard
          repairMutation={repairMutation}
          operationResults={operationResults}
          handleRepair={handleRepair}
          getOperationStatus={getOperationStatus}
        />
      </React.Suspense>
    </div>
  )
}
