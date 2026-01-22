import * as Lucide from 'lucide-react'
import type { Bucket } from './types'

interface GlobalAliasesTabProps {
  bucket: Bucket
  onShowAddGlobalAliasDialog: () => void
  onRemoveGlobalAlias: (alias: string) => void
}

export function GlobalAliasesTab({
  bucket,
  onShowAddGlobalAliasDialog,
  onRemoveGlobalAlias
}: GlobalAliasesTabProps) {
  const hasAliases = (bucket.globalAliases?.length ?? 0) > 0
  const isLastAlias = (bucket.globalAliases?.length ?? 0) === 1

  return (
    <>
      {hasAliases ? (
        <div className='flex flex-col gap-3'>
          {bucket.globalAliases?.map((alias) => (
            <div
              key={alias}
              className='flex items-center justify-between rounded-md border border-gray-200 bg-white px-4 py-3 shadow-sm'
            >
              <div className='flex items-center gap-3'>
                <Lucide.Globe className='size-4 text-green-600' />
                <span className='text-sm font-medium text-gray-900'>{alias}</span>
              </div>
              <div className='ml-4 flex items-center gap-2 border-l border-gray-200 pl-4'>
                <button
                  type='button'
                  onClick={() => onRemoveGlobalAlias(alias)}
                  disabled={isLastAlias}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                    isLastAlias
                      ? 'cursor-not-allowed text-gray-300'
                      : 'text-red-600 hover:bg-red-50'
                  }`}
                  title={isLastAlias ? 'Cannot remove last global alias' : 'Remove alias'}
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
          <Lucide.Globe className='size-6 shrink-0 text-gray-400' />
          <div className='flex-1'>
            <p className='text-sm font-medium text-gray-700'>No global aliases configured</p>
            <p className='text-sm text-gray-500'>Global aliases are accessible by all keys</p>
          </div>
          <button
            type='button'
            onClick={onShowAddGlobalAliasDialog}
            className='flex shrink-0 items-center gap-2 rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
          >
            <Lucide.Plus className='size-4' />
            Add Global Alias
          </button>
        </div>
      )}
    </>
  )
}
