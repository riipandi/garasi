import * as Lucide from 'lucide-react'
import { Badge } from '~/app/components/badge'
import { Button } from '~/app/components/button'
import { Card, CardBody, CardHeader, CardTitle } from '~/app/components/card'
import { Text } from '~/app/components/typography'
import { Heading } from '~/app/components/typography'

export interface NodeInfo {
  nodeId: string
  garageVersion: string
  rustVersion: string
  dbEngine: string
  garageFeatures: string[] | null
}

interface NodeInformationCardProps {
  nodeInfo: NodeInfo
}

export function NodeInformationCard({ nodeInfo }: NodeInformationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Heading size='md'>Node Information</Heading>
        </CardTitle>
      </CardHeader>
      <CardBody className='space-y-4'>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          <div className='col-span-1 sm:col-span-2 lg:col-span-4'>
            <div className='flex items-start justify-between gap-4 rounded-lg bg-gray-50 p-4'>
              <div className='min-w-0 flex-1'>
                <Text className='text-muted'>Node ID</Text>
                <Text className='font-mono text-sm font-medium break-all'>{nodeInfo.nodeId}</Text>
              </div>
              <Button
                variant='outline'
                size='sm'
                onClick={() => navigator.clipboard.writeText(nodeInfo.nodeId)}
              >
                <Lucide.Copy className='size-4' />
              </Button>
            </div>
          </div>
        </div>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          <div className='rounded-lg bg-gray-50 p-4'>
            <Text className='text-muted'>Garage Version</Text>
            <Text className='mt-1 text-sm font-medium'>{nodeInfo.garageVersion}</Text>
          </div>
          <div className='rounded-lg bg-gray-50 p-4'>
            <Text className='text-muted'>Rust Version</Text>
            <Text className='mt-1 text-sm font-medium'>{nodeInfo.rustVersion}</Text>
          </div>
          <div className='rounded-lg bg-gray-50 p-4'>
            <Text className='text-muted'>Database Engine</Text>
            <Text className='mt-1 text-sm font-medium'>{nodeInfo.dbEngine}</Text>
          </div>
        </div>
        {nodeInfo.garageFeatures && nodeInfo.garageFeatures.length > 0 && (
          <div>
            <Text className='text-muted'>Garage Features</Text>
            <div className='mt-2 flex flex-wrap gap-1'>
              {nodeInfo.garageFeatures.map((feature) => (
                <Badge key={feature} variant='info'>
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  )
}
