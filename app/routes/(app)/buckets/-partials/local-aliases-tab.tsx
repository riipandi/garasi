import * as Lucide from 'lucide-react'
import type { Bucket } from './types'

interface LocalAliasesTabProps {
  bucket: Bucket
  onShowAddLocalAliasDialog: () => void
  onRemoveLocalAlias: (accessKeyId: string, alias: string) => void
}

export function LocalAliasesTab({
  bucket,
  onShowAddLocalAliasDialog,
  onRemoveLocalAlias
}: LocalAliasesTabProps) {
  const hasAliases = (bucket.localAliases?.length ?? 0) > 0

  return (
    <>
      {hasAliases ? (
        <div className='flex flex-col gap-3'>
          {bucket.localAliases?.map((alias, index) => (
            <div
              key={index}
              className='flex items-center justify-between rounded-md border border-gray-200 bg-white px-4 py-3 shadow-sm'
            >
              <div className='flex items-center gap-3'>
                <Lucide.Key className='size-4 text-blue-600' />
                <div>
                  <span className='text-sm font-medium text-gray-900'>{alias.alias}</span>
                  <span className='ml-2 text-sm text-gray-500'>(Key: {alias.accessKeyId})</span>
                </div>
              </div>
              <div className='ml-4 flex items-center gap-2 border-l border-gray-200 pl-4'>
                <button
                  type='button'
                  onClick={() => onRemoveLocalAlias(alias.accessKeyId, alias.alias)}
                  className='flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-red-600 transition-all hover:bg-red-50 focus:outline-none'
                  title='Remove alias'
                >
                  <Lucide.Trash2 className='size-4' />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='flex items-center gap-4 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-4'>
          <Lucide.Key className='size-6 shrink-0 text-gray-400' />
          <div className='flex-1'>
            <p className='text-sm font-medium text-gray-700'>No local aliases configured</p>
            <p className='text-sm text-gray-500'>
              Local aliases are accessible only by specific keys
            </p>
          </div>
          <button
            type='button'
            onClick={onShowAddLocalAliasDialog}
            className='flex shrink-0 items-center gap-2 rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
          >
            <Lucide.Plus className='size-4' />
            Add Local Alias
          </button>
        </div>
      )}
    </>
  )
}
