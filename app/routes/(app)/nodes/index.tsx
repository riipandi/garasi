import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import { Alert, AlertDescription } from '~/app/components/alert'
import { Button } from '~/app/components/button'
import { toast } from '~/app/components/toast'
import { Heading } from '~/app/components/typography'
import { Text } from '~/app/components/typography'
import clusterService from '~/app/services/cluster.service'
import { ConnectNodesDialog } from './-partials/connect-nodes-dialog'
import { NodeTable } from './-partials/node-table'

const clusterStatusQuery = queryOptions({
  queryKey: ['cluster', 'status'],
  queryFn: () => clusterService.getClusterStatus()
})

export const Route = createFileRoute('/(app)/nodes/')({
  component: RouteComponent,
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(clusterStatusQuery)
  },
  staticData: { breadcrumb: 'Nodes' }
})

function RouteComponent() {
  const { queryClient } = Route.useRouteContext()
  const [isConnectDialogOpen, setIsConnectDialogOpen] = React.useState(false)
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const { data: statusData } = useSuspenseQuery(clusterStatusQuery)

  const nodes = statusData?.data?.nodes || []

  const handleRefreshNodes = async () => {
    setIsRefreshing(true)
    try {
      await queryClient.invalidateQueries({ queryKey: ['cluster', 'status'] })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleDeleteNode = (nodeId: string) => {
    console.log('Delete node:', nodeId)
    toast.add({ title: 'Delete node not implemented yet', type: 'info' })
  }

  return (
    <div className='mx-auto w-full max-w-7xl space-y-6'>
      <div className='min-w-0 flex-1 space-y-1.5'>
        <Heading level={1} size='lg'>
          Nodes
        </Heading>
        <Text className='text-muted'>Manage your Garage cluster nodes</Text>
      </div>

      <div className='flex flex-wrap gap-2.5'>
        <Button onClick={() => setIsConnectDialogOpen(true)}>
          <Lucide.Plus className='size-4' />
          Connect Nodes
        </Button>
        <Button
          variant='outline'
          onClick={handleRefreshNodes}
          disabled={isRefreshing}
          progress={isRefreshing}
        >
          <Lucide.RefreshCw className='size-4' />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <NodeTable nodes={nodes} onDelete={handleDeleteNode} isLoading={isRefreshing} />

      <Alert variant='info'>
        <Lucide.Info className='size-4' />
        <AlertDescription>
          Nodes are the servers that make up your Garage cluster. Each node stores data and
          participates in the cluster consensus.
        </AlertDescription>
      </Alert>

      <ConnectNodesDialog
        queryClient={queryClient}
        isOpen={isConnectDialogOpen}
        onClose={() => setIsConnectDialogOpen(false)}
      />
    </div>
  )
}
