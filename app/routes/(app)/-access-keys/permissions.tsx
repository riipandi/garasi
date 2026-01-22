import * as Lucide from 'lucide-react'
import type { AccessKey } from './types'

interface PermissionsSectionProps {
  accessKey: AccessKey
}

export function PermissionsSection({ accessKey }: PermissionsSectionProps) {
  return (
    <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
      <h3 className='mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900'>
        <Lucide.Shield className='size-4 text-blue-600' />
        Permissions
      </h3>
      <div className='space-y-2'>
        {accessKey.permissions &&
        typeof accessKey.permissions === 'object' &&
        Object.keys(accessKey.permissions).length > 0 ? (
          Object.entries(accessKey.permissions).map(([key, value]) => (
            <div
              key={key}
              className='flex items-center justify-between rounded-md bg-white p-3 text-xs shadow-sm'
            >
              <span className='font-mono text-gray-700'>{key}</span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium ${
                  value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {value ? (
                  <>
                    <Lucide.Check className='size-3.5' />
                    Allowed
                  </>
                ) : (
                  <>
                    <Lucide.X className='size-3.5' />
                    Denied
                  </>
                )}
              </span>
            </div>
          ))
        ) : (
          <div className='flex items-center gap-3 rounded-md bg-white p-4 text-sm text-gray-500 shadow-sm'>
            <Lucide.Shield className='size-5 text-gray-400' />
            <span>No permissions configured for this access key.</span>
          </div>
        )}
      </div>
    </div>
  )
}
