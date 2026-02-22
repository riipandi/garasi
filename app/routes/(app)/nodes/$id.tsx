import { queryOptions, useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogClose,
  AlertDialogPopup,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '~/app/components/alert-dialog'
import { Button } from '~/app/components/button'
import { Card, CardBody } from '~/app/components/card'
import { Text, TextLink } from '~/app/components/typography'
import { Heading } from '~/app/components/typography'
import nodeService from '~/app/services/node.service'
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

export const Route = createFileRoute('/(app)/nodes/$id')({
  component: RouteComponent,
  loader: ({ context, params }) => {
    context.queryClient.ensureQueryData(nodeInfoQuery(params.id))
  }
})

const nodeInfoQuery = (nodeId: string) =>
  queryOptions({
    queryKey: ['cluster', 'node', 'info', nodeId],
    queryFn: () => nodeService.getNodeInfo({ node: nodeId })
  })

function RouteComponent() {
  const { queryClient } = Route.useRouteContext()
  const { id } = Route.useParams()

  const [showEditDialog, setShowEditDialog] = React.useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const [runningOperation, setRunningOperation] = React.useState<RepairType | null>(null)
  const [operationResults, setOperationResults] = React.useState<
    Record<string, { success: boolean; message: string; timestamp: number }>
  >({})

  const { data: nodeInfoData } = useSuspenseQuery(nodeInfoQuery(id))
  const nodeInfo = nodeInfoData?.data?.success?.[id] as NodeInfo | undefined

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
      nodeService.launchRepairOperation({ node }, { repairType }),
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

  const handleEditNode = () => {
    setShowEditDialog(true)
  }

  const handleDeleteNode = () => {
    setShowDeleteDialog(true)
  }

  if (!nodeInfo) {
    return (
      <div className='mx-auto w-full max-w-7xl space-y-6'>
        <Card>
          <div className='flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 py-16 text-center'>
            <Lucide.XCircle className='text-muted mb-4 size-16' />
            <Text className='font-medium'>Unable to load node information</Text>
            <TextLink render={<Link to='/nodes' />} className='mt-2'>
              Back to Nodes
            </TextLink>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className='mx-auto w-full max-w-7xl space-y-6'>
      <div className='flex items-start gap-4'>
        <Link
          to='/nodes'
          className='hover:bg-dimmed/10 rounded-md p-2 text-gray-500 transition-colors hover:text-gray-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
        >
          <Lucide.ArrowLeft className='size-5' />
        </Link>
        <div className='min-w-0 flex-1'>
          <div className='flex items-center justify-between gap-3'>
            <Heading level={1} size='lg'>
              Node Information
            </Heading>
            <div className='flex items-center gap-4'>
              <Button variant='outline' onClick={handleEditNode}>
                <Lucide.Edit2 className='size-4' />
                Edit Node
              </Button>
              <Button variant='danger' onClick={handleDeleteNode}>
                <Lucide.Trash2 className='size-4' />
                Delete
              </Button>
            </div>
          </div>
          <Text className='text-muted mt-1 text-sm'>Node ID: {nodeInfo.nodeId}</Text>
        </div>
      </div>

      <React.Suspense
        fallback={
          <Card>
            <CardBody className='space-y-6'>
              <div className='flex items-start gap-4'>
                <div className='bg-dimmed/10 size-14 shrink-0 animate-pulse rounded-lg' />
                <div className='min-w-0 flex-1 space-y-3'>
                  <div className='bg-dimmed/10 h-6 w-48 animate-pulse rounded' />
                  <div className='flex gap-2'>
                    <div className='bg-dimmed/10 h-5 w-16 animate-pulse rounded-full' />
                    <div className='bg-dimmed/10 h-5 w-20 animate-pulse rounded' />
                  </div>
                </div>
              </div>
              <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={`skeleton-${i}`} className='space-y-2'>
                    <div className='bg-dimmed/10 h-3 w-20 animate-pulse rounded' />
                    <div className='bg-dimmed/10 h-4 w-24 animate-pulse rounded' />
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        }
      >
        <NodeInformationCard nodeInfo={nodeInfo} />
      </React.Suspense>

      <React.Suspense
        fallback={
          <Card>
            <CardBody className='space-y-4'>
              <div className='bg-dimmed/10 h-5 w-40 animate-pulse rounded' />
              <div className='space-y-3'>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={`ops-skeleton-${i}`}
                    className='flex items-center justify-between rounded-lg border border-gray-100 p-4'
                  >
                    <div className='space-y-2'>
                      <div className='bg-dimmed/10 h-4 w-32 animate-pulse rounded' />
                      <div className='bg-dimmed/10 h-3 w-48 animate-pulse rounded' />
                    </div>
                    <div className='bg-dimmed/10 h-9 w-24 animate-pulse rounded' />
                  </div>
                ))}
              </div>
            </CardBody>
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

      {/* Edit Node Dialog */}
      <AlertDialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Node</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogBody>
            <AlertDialogDescription>Node editing functionality coming soon.</AlertDialogDescription>
          </AlertDialogBody>
          <AlertDialogFooter>
            <AlertDialogClose>Close</AlertDialogClose>
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Node</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogBody>
            <AlertDialogDescription>
              Node deletion functionality coming soon.
            </AlertDialogDescription>
          </AlertDialogBody>
          <AlertDialogFooter>
            <AlertDialogClose>Close</AlertDialogClose>
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>
    </div>
  )
}
