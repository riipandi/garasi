import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import { Badge } from '~/app/components/badge'
import { Card, CardBody, CardHeader, CardTitle } from '~/app/components/card'
import { Text, TextLink } from '~/app/components/typography'
import { Heading } from '~/app/components/typography'
import clusterService from '~/app/services/cluster.service'
import { clx } from '~/app/utils'

export const Route = createFileRoute('/(app)/cluster/')({
  component: RouteComponent,
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(clusterHealthQuery)
    context.queryClient.ensureQueryData(clusterStatusQuery)
  }
})

const clusterHealthQuery = queryOptions({
  queryKey: ['cluster', 'health'],
  queryFn: () => clusterService.getClusterHealth()
})

const clusterStatusQuery = queryOptions({
  queryKey: ['cluster', 'status'],
  queryFn: () => clusterService.getClusterStatus()
})

function RouteComponent() {
  const { data: healthData } = useSuspenseQuery(clusterHealthQuery)
  const { data: statusData } = useSuspenseQuery(clusterStatusQuery)

  const health = healthData?.data
  const status = statusData?.data

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return {
          bg: 'bg-success/10',
          border: 'border-success/30',
          text: 'text-success',
          icon: 'text-success'
        }
      case 'degraded':
        return {
          bg: 'bg-warning/10',
          border: 'border-warning/30',
          text: 'text-warning',
          icon: 'text-warning'
        }
      case 'unavailable':
        return {
          bg: 'bg-danger/10',
          border: 'border-danger/30',
          text: 'text-danger',
          icon: 'text-danger'
        }
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-muted',
          icon: 'text-muted'
        }
    }
  }

  const statusColor = getStatusColor(health?.status || 'unknown')

  const formatTimeAgo = (seconds: number | null): string => {
    if (seconds === null) return 'Never'
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <div className='mx-auto w-full max-w-7xl space-y-6'>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Card className={clx(statusColor.bg, statusColor.border)}>
          <CardBody>
            <div className='flex items-center justify-between'>
              <div>
                <Text className='text-muted'>Overall Status</Text>
                <Text className={clx('mt-1 text-lg font-semibold', statusColor.text)}>
                  {health?.status || 'Unknown'}
                </Text>
              </div>
              {health?.status === 'healthy' && (
                <Lucide.CheckCircle2 className={clx('size-6', statusColor.icon)} />
              )}
              {health?.status === 'degraded' && (
                <Lucide.AlertTriangle className={clx('size-6', statusColor.icon)} />
              )}
              {health?.status === 'unavailable' && (
                <Lucide.XCircle className={clx('size-6', statusColor.icon)} />
              )}
              {!health?.status && <Lucide.HelpCircle className={clx('size-6', statusColor.icon)} />}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className='flex items-center justify-between'>
              <div>
                <Text className='text-muted'>Known Nodes</Text>
                <Text className='mt-1 text-lg font-semibold'>{health?.knownNodes || 0}</Text>
              </div>
              <Lucide.Server className='text-muted size-6' />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className='flex items-center justify-between'>
              <div>
                <Text className='text-muted'>Connected Nodes</Text>
                <Text className='mt-1 text-lg font-semibold'>{health?.connectedNodes || 0}</Text>
              </div>
              <Lucide.Wifi className='text-muted size-6' />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className='flex items-center justify-between'>
              <div>
                <Text className='text-muted'>Storage Nodes</Text>
                <Text className='mt-1 text-lg font-semibold'>{health?.storageNodes || 0}</Text>
              </div>
              <Lucide.HardDrive className='text-muted size-6' />
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader hidden>
          <CardTitle>Cluster Overview</CardTitle>
        </CardHeader>
        <CardBody>
          <div className='grid grid-cols-3 gap-4'>
            <div className='bg-accent/70 rounded-lg p-4'>
              <Text className='text-muted'>Nodes</Text>
              <Text className='text-dimmed text-xs'>connected / known</Text>
              <Text className='mt-2 text-2xl font-semibold'>
                {health?.connectedNodes || 0} / {health?.knownNodes || 0}
              </Text>
            </div>
            <div className='bg-accent/70 rounded-lg p-4'>
              <Text className='text-muted'>Partitions</Text>
              <Text className='text-dimmed text-xs'>healthy / total</Text>
              <Text className='mt-2 text-2xl font-semibold'>
                {health?.partitionsAllOk || 0} / {health?.partitions || 0}
              </Text>
            </div>
            <div className='bg-accent/70 rounded-lg p-4'>
              <Text className='text-muted'>Partitions</Text>
              <Text className='text-dimmed text-xs'>quorum / all ok</Text>
              <Text className='mt-2 text-2xl font-semibold'>
                {health?.partitionsQuorum || 0} / {health?.partitionsAllOk || 0}
              </Text>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className='p-0'>
          <div className='flex items-center justify-between px-6 py-4'>
            <div>
              <Heading size='md'>Node Status</Heading>
              <Text className='text-muted text-sm'>
                Layout Version: {status?.layoutVersion || 0}
              </Text>
            </div>
            <TextLink render={<Link to='/nodes' />}>
              View All
              <Lucide.ArrowRight className='size-4' />
            </TextLink>
          </div>

          {status?.nodes && status.nodes.length > 0 ? (
            <div className='overflow-x-auto border-t border-gray-200'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='text-muted px-4 py-3 text-left text-xs font-medium uppercase'>
                      Node
                    </th>
                    <th className='text-muted px-4 py-3 text-left text-xs font-medium uppercase'>
                      Address
                    </th>
                    <th className='text-muted px-4 py-3 text-left text-xs font-medium uppercase'>
                      Status
                    </th>
                    <th className='text-muted px-4 py-3 text-left text-xs font-medium uppercase'>
                      Last Seen
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200'>
                  {status.nodes.slice(0, 5).map((node) => (
                    <tr key={node.id} className='transition-colors hover:bg-gray-50'>
                      <td className='px-4 py-3'>
                        <div className='flex items-center gap-2'>
                          <TextLink
                            render={<Link to='/nodes/$id' params={{ id: node.id }} />}
                            className='font-medium'
                          >
                            {node.hostname || node.id}
                          </TextLink>
                          {node.draining && <Badge variant='warning'>Draining</Badge>}
                        </div>
                      </td>
                      <td className='text-muted px-4 py-3 text-sm'>{node.addr || 'N/A'}</td>
                      <td className='px-4 py-3'>
                        <Badge variant={node.isUp ? 'success' : 'danger'} pill>
                          {node.isUp ? (
                            <Lucide.CheckCircle2 className='size-3' />
                          ) : (
                            <Lucide.XCircle className='size-3' />
                          )}
                          {node.isUp ? 'Online' : 'Offline'}
                        </Badge>
                      </td>
                      <td className='text-muted px-4 py-3 text-sm'>
                        {formatTimeAgo(node.lastSeenSecsAgo)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 py-16 text-center'>
              <Lucide.Server className='text-muted mb-4 size-16' />
              <Text className='font-medium'>No nodes found in cluster</Text>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
