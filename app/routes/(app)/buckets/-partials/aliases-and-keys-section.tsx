import * as Lucide from 'lucide-react'
import * as React from 'react'
import { AccessKeysTab } from './access-keys-tab'
import { GlobalAliasesTab } from './global-aliases-tab'
import { KeySelectorDialog } from './key-selector-dialog'
import { LocalAliasesTab } from './local-aliases-tab'
import type { Bucket } from './types'

interface AliasesAndKeysSectionProps {
  bucket: Bucket
  aliasTab: 'global' | 'local' | 'keys'
  setAliasTab: (tab: 'global' | 'local' | 'keys') => void
  onShowAddGlobalAliasDialog: () => void
  onShowAddLocalAliasDialog: () => void
  onRemoveGlobalAlias: (alias: string) => void
  onRemoveLocalAlias: (accessKeyId: string, alias: string) => void
  onAllowBucketKey: (
    accessKeyId: string,
    permissions: { owner?: boolean; read?: boolean; write?: boolean }
  ) => void
  onViewKey: (accessKeyId: string) => void
  onDeleteKey: (accessKeyId: string) => void
}

export function AliasesAndKeysSection({
  bucket,
  aliasTab,
  setAliasTab,
  onShowAddGlobalAliasDialog,
  onShowAddLocalAliasDialog,
  onRemoveGlobalAlias,
  onRemoveLocalAlias,
  onAllowBucketKey,
  onViewKey,
  onDeleteKey
}: AliasesAndKeysSectionProps) {
  const [showKeySelectorDialog, setShowKeySelectorDialog] = React.useState(false)

  const handleCloseKeySelector = () => {
    setShowKeySelectorDialog(false)
  }

  const handleAllowBucketKey = (
    accessKeyId: string,
    permissions: { owner?: boolean; read?: boolean; write?: boolean }
  ) => {
    onAllowBucketKey(accessKeyId, permissions)
    setShowKeySelectorDialog(false)
  }

  return (
    <div className='overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm'>
      <div className='border-b border-gray-200 px-6 py-4'>
        <h3 className='text-lg font-semibold text-gray-900'>Bucket Keys and Aliases</h3>
        <p className='text-sm text-gray-500'>Configure bucket aliases and access keys</p>
      </div>

      {/* Tab Navigation */}
      <div className='border-b border-gray-200'>
        <nav className='flex' aria-label='Tabs'>
          <button
            onClick={() => setAliasTab('global')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              aliasTab === 'global'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            <Lucide.Globe className='size-4' />
            Global Aliases
          </button>
          <button
            onClick={() => setAliasTab('local')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              aliasTab === 'local'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            <Lucide.Key className='size-4' />
            Local Aliases
          </button>
          <button
            onClick={() => setAliasTab('keys')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              aliasTab === 'keys'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            <Lucide.Lock className='size-4' />
            Access Keys
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className='p-6'>
        {aliasTab === 'global' && (
          <GlobalAliasesTab
            bucket={bucket}
            onShowAddGlobalAliasDialog={onShowAddGlobalAliasDialog}
            onRemoveGlobalAlias={onRemoveGlobalAlias}
          />
        )}

        {aliasTab === 'local' && (
          <LocalAliasesTab
            bucket={bucket}
            onShowAddLocalAliasDialog={onShowAddLocalAliasDialog}
            onRemoveLocalAlias={onRemoveLocalAlias}
          />
        )}

        {aliasTab === 'keys' && (
          <AccessKeysTab
            bucket={bucket}
            onShowKeySelectorDialog={() => setShowKeySelectorDialog(true)}
            onViewKey={onViewKey}
            onDeleteKey={onDeleteKey}
          />
        )}
      </div>

      {/* Add Alias Button for Non-Empty States */}
      {((aliasTab === 'global' && (bucket.globalAliases?.length ?? 0) > 0) ||
        (aliasTab === 'local' && (bucket.localAliases?.length ?? 0) > 0) ||
        (aliasTab === 'keys' && (bucket.keys?.length ?? 0) > 0)) && (
        <div className='mt-4 border-t border-gray-200 pt-4'>
          <button
            type='button'
            onClick={() => {
              if (aliasTab === 'global') {
                onShowAddGlobalAliasDialog()
              } else if (aliasTab === 'local') {
                onShowAddLocalAliasDialog()
              } else {
                setShowKeySelectorDialog(true)
              }
            }}
            className='flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
          >
            <Lucide.Plus className='size-4' />
            {aliasTab === 'global'
              ? 'Add Global Alias'
              : aliasTab === 'local'
                ? 'Add Local Alias'
                : 'Allow Access Key'}
          </button>
        </div>
      )}

      {/* Key Selector Dialog */}
      <KeySelectorDialog
        isOpen={showKeySelectorDialog}
        onClose={handleCloseKeySelector}
        bucket={bucket}
        onAllowKey={handleAllowBucketKey}
      />
    </div>
  )
}
