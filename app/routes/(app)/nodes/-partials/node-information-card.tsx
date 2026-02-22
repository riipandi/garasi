import { Badge } from '~/app/components/badge'
import { Card, CardBody } from '~/app/components/card'
import { Text } from '~/app/components/typography'

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
      <CardBody className='space-y-4'>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <div className='rounded-lg bg-gray-50 p-4'>
            <Text className='text-muted'>Layout Version</Text>
            <Text className='mt-1 text-sm font-medium'>{nodeInfo.garageVersion}</Text>
          </div>
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
