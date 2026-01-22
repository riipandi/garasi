import * as Lucide from 'lucide-react'

interface StorageNode {
  id: string
  hostname: string
  zone: string
  capacity: string
  partitions: number
  dataAvailable: {
    used: string
    total: string
    percentage: number
  }
  metaAvailable: {
    used: string
    total: string
    percentage: number
  }
}

interface ClusterStatistics {
  nodes: StorageNode[]
  clusterWide: {
    data: string
    metadata: string
  }
}

interface StorageNodesProps {
  statistics: ClusterStatistics | undefined
}

export function StorageNodes({ statistics }: StorageNodesProps) {
  const nodes = statistics?.nodes || []

  return (
    <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6'>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-lg font-semibold sm:text-xl'>Storage Nodes</h2>
        <Lucide.HardDrive className='size-5 text-gray-400' />
      </div>

      <div className='space-y-3'>
        {nodes.length > 0 ? (
          nodes.map((node) => (
            <div key={node.id} className='rounded-lg border border-gray-200 bg-gray-50 px-4 py-3'>
              <div className='mb-2 flex items-center justify-between'>
                <span className='font-medium text-gray-900'>{node.hostname}</span>
                <span className='rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800'>
                  {node.zone}
                </span>
              </div>
              <div className='grid grid-cols-2 gap-2 text-sm'>
                <div>
                  <span className='text-gray-500'>Data:</span>{' '}
                  <span className='font-medium text-gray-900'>
                    {node.dataAvailable.percentage.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className='text-gray-500'>Meta:</span>{' '}
                  <span className='font-medium text-gray-900'>
                    {node.metaAvailable.percentage.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className='text-gray-500'>Partitions:</span>{' '}
                  <span className='font-medium text-gray-900'>{node.partitions}</span>
                </div>
                <div>
                  <span className='text-gray-500'>Capacity:</span>{' '}
                  <span className='font-medium text-gray-900'>{node.capacity}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className='rounded border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700'>
            No storage nodes available
          </div>
        )}
      </div>
    </div>
  )
}
