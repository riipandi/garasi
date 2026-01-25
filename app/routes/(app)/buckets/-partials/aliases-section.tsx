import * as Lucide from 'lucide-react'
import * as React from 'react'
import type { GetBucketInfoResponse } from '~/shared/schemas/bucket.schema'

interface AliasesSectionProps {
  bucket: GetBucketInfoResponse
  onShowAddGlobalAliasDialog: () => void
  onShowAddLocalAliasDialog: () => void
  onRemoveGlobalAlias: (alias: string) => void
  onRemoveLocalAlias: (accessKeyId: string, alias: string) => void
}

type AliasItem = {
  id: string
  alias: string
  type: 'global' | 'local'
  accessKeyId?: string
  keyName?: string
}

export function AliasesSection({
  bucket,
  onShowAddGlobalAliasDialog,
  onShowAddLocalAliasDialog,
  onRemoveGlobalAlias,
  onRemoveLocalAlias
}: AliasesSectionProps) {
  // Combine global and local aliases into a single list
  const aliases: AliasItem[] = React.useMemo(() => {
    const items: AliasItem[] = []

    // Add global aliases
    bucket.globalAliases?.forEach((alias) => {
      items.push({
        id: `global-${alias}`,
        alias,
        type: 'global'
      })
    })

    // Add local aliases from keys
    bucket.keys?.forEach((key) => {
      key.bucketLocalAliases.forEach((alias) => {
        items.push({
          id: `local-${key.accessKeyId}-${alias}`,
          alias,
          type: 'local',
          accessKeyId: key.accessKeyId,
          keyName: key.name
        })
      })
    })

    return items
  }, [bucket.globalAliases, bucket.keys])

  const hasAliases = aliases.length > 0
  const isLastGlobalAlias = (bucket.globalAliases?.length ?? 0) === 1

  return (
    <div className='overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm'>
      <div className='border-b border-gray-200 px-6 py-4'>
        <h3 className='text-lg font-semibold text-gray-900'>Aliases</h3>
        <p className='text-sm text-gray-500'>Configure global and local aliases for this bucket</p>
      </div>
      <div className='p-6'>
        {hasAliases ? (
          <div className='flex flex-col gap-3'>
            {aliases.map((item) => (
              <div
                key={item.id}
                className='flex items-center justify-between rounded-md border border-gray-200 bg-white px-4 py-3 shadow-sm'
              >
                <div className='flex items-center gap-3'>
                  <div className='flex flex-col'>
                    <span className='text-sm font-medium text-gray-900'>{item.alias}</span>
                    {item.type === 'local' && item.keyName && (
                      <span className='text-xs text-gray-500'>Key: {item.keyName}</span>
                    )}
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <div className='flex flex-wrap gap-2'>
                    {item.type === 'global' ? (
                      <span className='inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800'>
                        Global
                      </span>
                    ) : (
                      <span className='inline-flex items-center rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800'>
                        Local
                      </span>
                    )}
                  </div>
                  <div className='ml-4 flex items-center gap-2 border-l border-gray-200 pl-4'>
                    <button
                      type='button'
                      onClick={() => {
                        if (item.type === 'global') {
                          onRemoveGlobalAlias(item.alias)
                        } else {
                          onRemoveLocalAlias(item.accessKeyId!, item.alias)
                        }
                      }}
                      disabled={item.type === 'global' && isLastGlobalAlias}
                      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                        item.type === 'global' && isLastGlobalAlias
                          ? 'cursor-not-allowed text-gray-300'
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                      title={
                        item.type === 'global' && isLastGlobalAlias
                          ? 'Cannot remove last global alias'
                          : 'Remove alias'
                      }
                    >
                      <Lucide.Trash2 className='size-4' />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='flex flex-col items-center gap-6 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8'>
            <Lucide.Link2 className='size-12 text-gray-400' />
            <div className='text-center'>
              <p className='text-base font-medium text-gray-700'>No aliases configured</p>
              <p className='text-sm text-gray-500'>
                Add global or local aliases to make this bucket more accessible
              </p>
            </div>
            <div className='flex flex-wrap justify-center gap-3'>
              <button
                type='button'
                onClick={onShowAddGlobalAliasDialog}
                className='flex items-center gap-2 rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
              >
                <Lucide.Globe className='size-4' />
                Add Global Alias
              </button>
              <button
                type='button'
                onClick={onShowAddLocalAliasDialog}
                className='flex items-center gap-2 rounded-md border border-transparent bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:outline-none'
              >
                <Lucide.Key className='size-4' />
                Add Local Alias
              </button>
            </div>
          </div>
        )}

        {/* Add Alias Button (shown when there are aliases) */}
        {hasAliases && (
          <div className='mt-4 flex flex-wrap justify-end gap-3 border-t border-gray-200 pt-4'>
            <button
              type='button'
              onClick={onShowAddGlobalAliasDialog}
              className='flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
            >
              <Lucide.Globe className='size-4' />
              <span className='hidden sm:inline'>Add Global Alias</span>
            </button>
            <button
              type='button'
              onClick={onShowAddLocalAliasDialog}
              className='flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:outline-none'
            >
              <Lucide.Key className='size-4' />
              <span className='hidden sm:inline'>Add Local Alias</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
