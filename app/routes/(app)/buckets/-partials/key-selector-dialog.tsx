import { useQuery } from '@tanstack/react-query'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import fetcher from '~/app/fetcher'
import type { KeysResponse } from '../../keys/-partials/types'
import type { Bucket } from './types'

interface KeySelectorDialogProps {
  isOpen: boolean
  onClose: () => void
  bucket: Bucket
  onAllowKey: (
    accessKeyId: string,
    permissions: { owner?: boolean; read?: boolean; write?: boolean }
  ) => void
}

export function KeySelectorDialog({ isOpen, onClose, bucket, onAllowKey }: KeySelectorDialogProps) {
  const [selectedKey, setSelectedKey] = React.useState<string | null>(null)
  const [permissions, setPermissions] = React.useState({ owner: true, read: true, write: true })
  const [searchQuery, setSearchQuery] = React.useState('')

  // Fetch all keys for the selector dialog
  const { data: keysData, isLoading: isKeysLoading } = useQuery({
    queryKey: ['keys'],
    queryFn: () => fetcher<KeysResponse>('/keys')
  })

  const allKeys = keysData?.data ?? []

  // Filter out keys that are already assigned to this bucket
  const assignedKeyIds = bucket.keys?.map((k) => k.accessKeyId) ?? []
  const availableKeys = allKeys.filter((key) => !assignedKeyIds.includes(key.id))

  // Filter keys by search query
  const filteredKeys = availableKeys.filter((key) => {
    const query = searchQuery.toLowerCase()
    return key.name.toLowerCase().includes(query) || key.id.toLowerCase().includes(query)
  })

  const handleClose = () => {
    onClose()
    setSelectedKey(null)
    setPermissions({ owner: true, read: true, write: true })
    setSearchQuery('')
  }

  const handleSelectKey = (keyId: string) => {
    setSelectedKey(keyId)
  }

  const handleAllowSelectedKey = () => {
    if (selectedKey) {
      onAllowKey(selectedKey, permissions)
      handleClose()
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity duration-200 ${
        isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <div className='mx-auto w-full max-w-md overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-gray-200 px-6 py-4'>
          <div className='flex items-center gap-3'>
            <div className='flex size-10 items-center justify-center rounded-full bg-blue-100'>
              <Lucide.Lock className='size-5 text-blue-600' />
            </div>
            <div>
              <h3 className='text-base font-semibold text-gray-900'>Allow Access Key</h3>
              <p className='text-xs text-gray-500'>Grant access to this bucket</p>
            </div>
          </div>
          <button
            type='button'
            onClick={handleClose}
            className='rounded-md p-2 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600 focus:outline-none'
          >
            <Lucide.X className='size-5' />
          </button>
        </div>

        {/* Content */}
        <div className='px-6 py-4'>
          {isKeysLoading ? (
            <div className='flex flex-col items-center justify-center py-12'>
              <svg className='size-8 animate-spin text-blue-600' fill='none' viewBox='0 0 24 24'>
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                />
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                />
              </svg>
              <p className='mt-3 text-sm text-gray-600'>Loading keys...</p>
            </div>
          ) : availableKeys.length === 0 ? (
            <div className='flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 px-6 py-12'>
              <div className='flex size-12 items-center justify-center rounded-full bg-gray-100'>
                <Lucide.Lock className='size-6 text-gray-400' />
              </div>
              <p className='mt-3 text-sm font-medium text-gray-700'>
                {allKeys.length === 0 ? 'No keys available' : 'All keys already have access'}
              </p>
              <p className='mt-1 text-xs text-gray-500'>
                {allKeys.length === 0
                  ? 'Create a key first to grant access'
                  : 'All existing keys are already assigned to this bucket'}
              </p>
            </div>
          ) : (
            <>
              <div className='mb-4'>
                <label className='mb-2 block text-xs font-semibold tracking-wider text-gray-500 uppercase'>
                  Select Key
                </label>
                {/* Search Bar */}
                <div className='relative mb-3'>
                  <Lucide.Search className='absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400' />
                  <input
                    type='text'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder='Search by name or ID...'
                    className='w-full rounded-lg border border-gray-200 py-2 pr-4 pl-10 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 focus:outline-none'
                  />
                  {searchQuery && (
                    <button
                      type='button'
                      onClick={() => setSearchQuery('')}
                      className='absolute top-1/2 right-3 size-4 -translate-y-1/2 rounded-full bg-gray-200 text-gray-500 hover:bg-gray-300 focus:outline-none'
                    >
                      <Lucide.X className='size-3' />
                    </button>
                  )}
                </div>

                {/* Key List */}
                <div className='max-h-56 overflow-y-auto rounded-lg border border-gray-200'>
                  {filteredKeys.length === 0 ? (
                    <div className='flex flex-col items-center justify-center px-4 py-8'>
                      <Lucide.Search className='size-8 text-gray-300' />
                      <p className='mt-2 text-sm text-gray-500'>
                        {searchQuery ? 'No keys found matching your search' : 'No keys available'}
                      </p>
                    </div>
                  ) : (
                    <div className='divide-y divide-gray-100'>
                      {filteredKeys.map((key) => (
                        <button
                          key={key.id}
                          type='button'
                          onClick={() => handleSelectKey(key.id)}
                          className={`flex w-full items-center gap-2 px-3 py-2 text-left transition-all ${
                            selectedKey === key.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div
                            className={`flex size-6 shrink-0 items-center justify-center rounded-full ${
                              selectedKey === key.id ? 'bg-blue-500' : 'bg-gray-100'
                            }`}
                          >
                            {selectedKey === key.id ? (
                              <Lucide.Check className='size-3.5 text-white' />
                            ) : (
                              <Lucide.Key className='size-3 text-gray-500' />
                            )}
                          </div>
                          <div className='min-w-0 flex-1'>
                            <span className='block truncate text-sm font-medium text-gray-900'>
                              {key.name}
                            </span>
                            <span className='block truncate font-mono text-xs text-gray-500'>
                              {key.id}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Key Count */}
                <div className='mt-2 flex items-center justify-between text-xs text-gray-500'>
                  <span>
                    Showing {filteredKeys.length} of {availableKeys.length} key
                    {availableKeys.length !== 1 ? 's' : ''}
                  </span>
                  {searchQuery && (
                    <button
                      type='button'
                      onClick={() => setSearchQuery('')}
                      className='text-blue-600 hover:text-blue-700'
                    >
                      Clear search
                    </button>
                  )}
                </div>
              </div>

              {/* Permissions */}
              <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
                <label className='mb-3 block text-xs font-semibold tracking-wider text-gray-500 uppercase'>
                  Permissions
                </label>
                <div className='grid grid-cols-3 gap-3'>
                  <label className='flex cursor-pointer items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2.5 transition-all hover:border-blue-300 has-checked:border-blue-500 has-checked:bg-blue-50'>
                    <input
                      type='checkbox'
                      checked={permissions.owner}
                      onChange={(e) => setPermissions({ ...permissions, owner: e.target.checked })}
                      className='h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0'
                    />
                    <span className='text-sm font-medium text-gray-700'>Owner</span>
                  </label>
                  <label className='flex cursor-pointer items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2.5 transition-all hover:border-blue-300 has-checked:border-blue-500 has-checked:bg-blue-50'>
                    <input
                      type='checkbox'
                      checked={permissions.read}
                      onChange={(e) => setPermissions({ ...permissions, read: e.target.checked })}
                      className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0'
                    />
                    <span className='text-sm font-medium text-gray-700'>Read</span>
                  </label>
                  <label className='flex cursor-pointer items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2.5 transition-all hover:border-blue-300 has-checked:border-blue-500 has-checked:bg-blue-50'>
                    <input
                      type='checkbox'
                      checked={permissions.write}
                      onChange={(e) => setPermissions({ ...permissions, write: e.target.checked })}
                      className='h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-0'
                    />
                    <span className='text-sm font-medium text-gray-700'>Write</span>
                  </label>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {availableKeys.length > 0 && !isKeysLoading && filteredKeys.length > 0 && (
          <div className='flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4'>
            <button
              type='button'
              onClick={handleClose}
              className='rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
            >
              Cancel
            </button>
            <button
              type='button'
              onClick={handleAllowSelectedKey}
              disabled={!selectedKey}
              className='flex items-center gap-2 rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
            >
              <Lucide.Plus className='size-4' />
              Allow Key
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
