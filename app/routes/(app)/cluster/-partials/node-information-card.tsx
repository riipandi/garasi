import * as Lucide from 'lucide-react'

// Local type for node info since shared schema uses any for success values
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
    <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
      <div className='mb-4 flex items-center gap-2'>
        <Lucide.Info className='size-5 text-blue-500' />
        <h2 className='text-lg font-semibold text-gray-900'>Node Information</h2>
      </div>
      <div className='space-y-4'>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {/* Node ID - Full width for 64 character ID */}
          <div className='col-span-1 rounded-lg border border-gray-200 bg-gray-50 p-4 sm:col-span-2 lg:col-span-4'>
            <div className='flex items-center justify-between gap-4'>
              <div className='min-w-0 flex-1'>
                <p className='text-xs text-gray-500'>Node ID</p>
                <p className='mt-1 font-mono text-sm font-medium break-all text-gray-900'>
                  {nodeInfo.nodeId}
                </p>
              </div>
              <button
                type='button'
                onClick={() => navigator.clipboard.writeText(nodeInfo.nodeId)}
                className='shrink-0 rounded-md p-2 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600'
                title='Copy Node ID'
              >
                <Lucide.Copy className='size-4' />
              </button>
            </div>
          </div>
        </div>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
            <p className='text-xs text-gray-500'>Garage Version</p>
            <p className='mt-1 text-sm font-medium text-gray-900'>{nodeInfo.garageVersion}</p>
          </div>
          <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
            <p className='text-xs text-gray-500'>Rust Version</p>
            <p className='mt-1 text-sm font-medium text-gray-900'>{nodeInfo.rustVersion}</p>
          </div>
          <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
            <p className='text-xs text-gray-500'>Database Engine</p>
            <p className='mt-1 text-sm font-medium text-gray-900'>{nodeInfo.dbEngine}</p>
          </div>
        </div>
      </div>

      {nodeInfo.garageFeatures && nodeInfo.garageFeatures.length > 0 && (
        <div className='mt-4'>
          <p className='mb-2 text-xs text-gray-500'>Garage Features</p>
          <div className='flex flex-wrap gap-1'>
            {nodeInfo.garageFeatures.map((feature, index) => (
              <span
                key={index}
                className='rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800'
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
