import { Link } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import { Badge } from '~/app/components/badge'
import { Button } from '~/app/components/button'
import {
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardHeaderAction,
  CardTitle
} from '~/app/components/card'
import {
  Item,
  ItemAction,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle
} from '~/app/components/item'
import { Separator } from '~/app/components/separator'
import { Stack } from '~/app/components/stack'
import { Text } from '~/app/components/typography'
import type { ClusterStatistics } from './types'

interface StorageNodesProps {
  statistics: ClusterStatistics | undefined
}

export function StorageNodes({ statistics }: StorageNodesProps) {
  const nodes = statistics?.nodes || []
  const hasNodes = nodes.length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Storage Nodes</CardTitle>
        <CardDescription>Overview of your storage nodes</CardDescription>
        {hasNodes && (
          <CardHeaderAction>
            <Button variant='outline' nativeButton={false} render={<Link to='/nodes' />}>
              <Lucide.Server className='size-4' />
              Manage Nodes
            </Button>
          </CardHeaderAction>
        )}
      </CardHeader>
      <CardBody className={hasNodes ? 'p-10' : 'p-12'}>
        {!hasNodes ? (
          <div className='flex flex-col items-center justify-center py-8 text-center'>
            <Lucide.HardDrive className='text-dimmed mb-4 size-12' />
            <Text className='text-dimmed mb-4'>No storage nodes available</Text>
            <Text className='text-muted-foreground mb-6'>
              Add storage nodes to your cluster to get started.
            </Text>
            <Button type='button' nativeButton={false} render={<Link to='/nodes' />}>
              <Lucide.Plus className='size-4' />
              Add Node
            </Button>
          </div>
        ) : (
          <Stack spacing='md'>
            {nodes.map((node) => (
              <Item key={node.id} className='bg-dimmed/5'>
                <ItemMedia>
                  <div className='bg-primary/10 mt-1.5 flex size-14 items-center justify-center rounded-lg'>
                    <Lucide.Server className='text-primary size-6' />
                  </div>
                </ItemMedia>
                <ItemContent className='w-full min-w-0 px-2'>
                  <ItemTitle>{node.hostname}</ItemTitle>
                  <ItemDescription className='font-mono text-xs max-w-32 truncate'>
                    {node.id}
                  </ItemDescription>
                  <div className='text-dimmed mt-1 flex items-center gap-3 text-xs'>
                    <span>
                      {node.partitions} partition{node.partitions !== 1 ? 's' : ''}
                    </span>
                    <Separator orientation='vertical' className='h-3' />
                    <span>{node.capacity} used</span>
                  </div>
                </ItemContent>
                <ItemAction className='gap-2'>
                  <Badge variant='primary' pill size='sm'>
                    {node.zone}
                  </Badge>
                  <Separator orientation='vertical' className='mx-3 h-5' />
                  <Button
                    size='sm-icon'
                    variant='outline'
                    nativeButton={false}
                    render={<Link to='/nodes/$id' params={{ id: node.id }} />}
                  >
                    <Lucide.ChevronRight className='size-4' />
                  </Button>
                </ItemAction>
              </Item>
            ))}
          </Stack>
        )}
      </CardBody>
    </Card>
  )
}
