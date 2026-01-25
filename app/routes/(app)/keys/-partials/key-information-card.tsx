import * as Lucide from 'lucide-react'
import type { GetKeyInformationResponse } from '~/shared/schemas/keys.schema'

// Extend the schema type with additional properties needed by the UI
interface AccessKey extends GetKeyInformationResponse {
  deleted?: boolean
  neverExpires?: boolean
  secretKeyId?: string
}

interface KeyInformationCardProps {
  accessKey: AccessKey
  showSecretKey: boolean
  onToggleSecretKey: () => void
  onCopyAccessKey: () => void
  onCopySecretKey: () => void
  formatDate: (dateString: string | null) => string
  formatExpiration: (expiration: string | null, neverExpires: boolean) => string
  expired: boolean
}

export function KeyInformationCard({
  accessKey,
  showSecretKey,
  onToggleSecretKey,
  onCopyAccessKey,
  onCopySecretKey,
  formatDate,
  formatExpiration,
  expired
}: KeyInformationCardProps) {
  return (
    <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
      <h3 className='mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900'>
        <Lucide.KeyRound className='size-4 text-blue-600' />
        Key Information
      </h3>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        {/* Access Key ID */}
        <div>
          <label className='mb-1.5 block text-xs font-medium text-gray-600'>Access Key ID</label>
          <div className='flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm'>
            <code className='flex-1 font-mono text-sm text-gray-900'>{accessKey.accessKeyId}</code>
            <button
              type='button'
              onClick={onCopyAccessKey}
              className='rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none'
              title='Copy Access Key ID'
            >
              <Lucide.Copy className='size-4' />
            </button>
          </div>
        </div>

        {/* Secret Key */}
        <div>
          <label className='mb-1.5 block text-xs font-medium text-gray-600'>
            <div className='flex items-center gap-2'>
              Secret Key
              <span className='text-orange-600'>
                <Lucide.AlertTriangle className='inline-block size-3 align-middle' />
              </span>
            </div>
          </label>
          {accessKey.secretKeyId || accessKey.secretAccessKey ? (
            <div className='flex items-center gap-2 rounded-md border border-orange-200 bg-orange-50 px-3 py-2 shadow-sm'>
              <code className='min-w-0 flex-1 truncate font-mono text-sm text-gray-900'>
                {showSecretKey
                  ? accessKey.secretAccessKey || accessKey.secretKeyId
                  : '*'.repeat(54)}
              </code>
              <button
                type='button'
                onClick={onToggleSecretKey}
                className='shrink-0 rounded p-1 text-gray-400 transition-colors hover:bg-orange-100 hover:text-orange-600 focus:ring-2 focus:ring-orange-500 focus:outline-none'
                title={showSecretKey ? 'Hide Secret Key' : 'Show Secret Key'}
              >
                {showSecretKey ? (
                  <Lucide.EyeOff className='size-4' />
                ) : (
                  <Lucide.Eye className='size-4' />
                )}
              </button>
              <button
                type='button'
                onClick={onCopySecretKey}
                className='shrink-0 rounded p-1 text-gray-400 transition-colors hover:bg-orange-100 hover:text-orange-600 focus:ring-2 focus:ring-orange-500 focus:outline-none'
                title='Copy Secret Key'
              >
                <Lucide.Copy className='size-4' />
              </button>
            </div>
          ) : (
            <div className='flex items-center gap-2 rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-500 shadow-sm'>
              <span>N/A</span>
            </div>
          )}
        </div>

        {/* Created At */}
        <div>
          <label className='mb-1.5 block text-xs font-medium text-gray-600'>Created At</label>
          <div className='flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm'>
            <Lucide.Calendar className='size-4 text-gray-500' />
            <span>{formatDate(accessKey.created || null)}</span>
          </div>
        </div>

        {/* Expires At */}
        <div>
          <label className='mb-1.5 block text-xs font-medium text-gray-600'>Expires At</label>
          <div
            className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm shadow-sm ${
              expired
                ? 'border-red-200 bg-red-50 text-red-900'
                : 'border-gray-300 bg-white text-gray-900'
            }`}
          >
            <Lucide.Clock className={`size-4 ${expired ? 'text-red-600' : 'text-gray-500'}`} />
            <span>
              {formatExpiration(accessKey.expiration || null, accessKey.neverExpires || false)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
