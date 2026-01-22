import { QueryClient, useMutation, useQuery } from '@tanstack/react-query'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import { fetcher } from '~/app/fetcher'
import type {
  ClusterLayoutResponse,
  LayoutHistoryResponse,
  PreviewLayoutResponse,
  SkipDeadNodesResponse
} from './types'

interface LayoutManagementProps {
  layoutVersion?: number
  queryClient: QueryClient
}

export function LayoutManagement({ layoutVersion, queryClient }: LayoutManagementProps) {
  const [showPreview, setShowPreview] = React.useState(false)
  const [showHistory, setShowHistory] = React.useState(false)
  const [showUpdateForm, setShowUpdateForm] = React.useState(false)
  const [selectedNode, setSelectedNode] = React.useState<string>('')
  const [selectedZone, setSelectedZone] = React.useState<string>('')
  const [selectedCapacity, setSelectedCapacity] = React.useState<string>('')

  // Get cluster layout
  const { data: layoutData, isLoading: isLoadingLayout } = useQuery({
    queryKey: ['cluster', 'layout'],
    queryFn: () => fetcher<{ success: boolean; data: ClusterLayoutResponse }>('/layout')
  })

  // Get layout history
  const { data: historyData } = useQuery({
    queryKey: ['cluster', 'layout', 'history'],
    queryFn: () => fetcher<{ success: boolean; data: LayoutHistoryResponse }>('/layout/history'),
    enabled: showHistory
  })

  const layout = layoutData?.data
  const history = historyData?.data

  // Preview layout changes
  const previewMutation = useMutation({
    mutationFn: () =>
      fetcher<{ success: boolean; data: PreviewLayoutResponse }>('/layout/preview', {
        method: 'POST'
      }),
    onSuccess: () => {
      setShowPreview(true)
    }
  })

  // Apply layout
  const applyMutation = useMutation({
    mutationFn: (version: number) =>
      fetcher<{ success: boolean; data: { message: string[] } }>('/layout/apply', {
        method: 'POST',
        body: { version }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cluster', 'layout'] })
      queryClient.invalidateQueries({ queryKey: ['cluster', 'health'] })
      queryClient.invalidateQueries({ queryKey: ['cluster', 'status'] })
    }
  })

  // Update layout
  const updateMutation = useMutation({
    mutationFn: (data: { roles: any[]; parameters: any }) =>
      fetcher<{ success: boolean; data: ClusterLayoutResponse }>('/layout', {
        method: 'PUT',
        body: data
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cluster', 'layout'] })
      queryClient.invalidateQueries({ queryKey: ['cluster', 'health'] })
      queryClient.invalidateQueries({ queryKey: ['cluster', 'status'] })
      setShowUpdateForm(false)
      setSelectedNode('')
      setSelectedZone('')
      setSelectedCapacity('')
    }
  })

  // Revert layout
  const revertMutation = useMutation({
    mutationFn: () =>
      fetcher<{ success: boolean; data: ClusterLayoutResponse }>('/layout/revert', {
        method: 'POST'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cluster', 'layout'] })
      queryClient.invalidateQueries({ queryKey: ['cluster', 'health'] })
      queryClient.invalidateQueries({ queryKey: ['cluster', 'status'] })
    }
  })

  // Skip dead nodes
  const skipDeadMutation = useMutation({
    mutationFn: (data: { version: number; allowMissingData: boolean }) =>
      fetcher<{ success: boolean; data: SkipDeadNodesResponse }>('/layout/skip-dead-nodes', {
        method: 'POST',
        body: data
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cluster', 'layout'] })
    }
  })

  const handleApply = () => {
    if (layout?.version) {
      applyMutation.mutate(layout.version)
    }
  }

  const handleSkipDeadNodes = () => {
    if (layout?.version) {
      skipDeadMutation.mutate({ version: layout.version, allowMissingData: true })
    }
  }

  const handleUpdateLayout = () => {
    if (selectedNode) {
      const roleChange: any = {
        id: selectedNode
      }
      if (selectedZone) roleChange.zone = selectedZone
      if (selectedCapacity) roleChange.capacity = parseFloat(selectedCapacity)
      updateMutation.mutate({
        roles: [roleChange],
        parameters: layout?.parameters || null
      })
    }
  }

  const hasStagedChanges = layout?.stagedRoleChanges && layout.stagedRoleChanges.length > 0

  return (
    <div className='space-y-6'>
      {/* Layout Version Info */}
      <div className='mb-4 flex items-center justify-between'>
        <h3 className='text-lg font-semibold text-gray-900'>Layout Information</h3>
        <Lucide.LayoutGrid className='size-5 text-gray-400' />
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        {/* Current Version */}
        <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-500'>Current Version</p>
              <p className='mt-1 text-2xl font-semibold text-gray-900'>
                {layout?.version || layoutVersion || 0}
              </p>
            </div>
            <Lucide.Tag className='size-6 text-gray-400' />
          </div>
        </div>

        {/* Partition Size */}
        <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-500'>Partition Size</p>
              <p className='mt-1 text-2xl font-semibold text-gray-900'>
                {layout?.partitionSize
                  ? `${(layout.partitionSize / 1024 / 1024).toFixed(2)} MB`
                  : 'N/A'}
              </p>
            </div>
            <Lucide.HardDrive className='size-6 text-gray-400' />
          </div>
        </div>
      </div>

      {/* Zone Redundancy */}
      {layout?.parameters?.zoneRedundancy && (
        <div className='mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4'>
          <p className='text-sm font-medium text-gray-500'>Zone Redundancy</p>
          <div className='mt-2 flex gap-2'>
            {layout.parameters.zoneRedundancy.atLeast && (
              <span className='rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800'>
                At least {layout.parameters.zoneRedundancy.atLeast}
              </span>
            )}
            {layout.parameters.zoneRedundancy.maximum && (
              <span className='rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800'>
                Max {layout.parameters.zoneRedundancy.maximum}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Staged Changes */}
      {hasStagedChanges && (
        <div className='rounded-lg border border-yellow-200 bg-yellow-50 p-6'>
          <div className='flex items-start gap-3'>
            <Lucide.AlertTriangle className='mt-0.5 size-6 shrink-0 text-yellow-600' />
            <div className='flex-1'>
              <p className='text-base font-medium text-yellow-800'>
                Staged Changes ({layout.stagedRoleChanges.length})
              </p>
              <p className='mt-1 text-sm text-yellow-700'>
                There are pending changes to the cluster layout. Preview and apply to make them
                active.
              </p>
              <div className='mt-3 space-y-2'>
                {layout.stagedRoleChanges.map((change, index) => (
                  <div
                    key={index}
                    className='flex items-center gap-2 rounded-lg border border-yellow-200 bg-white p-3'
                  >
                    <Lucide.Edit3 className='size-4 text-yellow-600' />
                    <span className='text-sm text-yellow-800'>
                      {change.remove ? 'Remove' : 'Update'} node {change.id}
                      {change.zone && ` to zone ${change.zone}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Layout Actions */}
      <div className='rounded-lg border border-gray-200 bg-white p-6'>
        <h3 className='mb-4 text-lg font-semibold text-gray-900'>Layout Actions</h3>

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {/* Apply Layout */}
          <button
            type='button'
            onClick={handleApply}
            disabled={!hasStagedChanges || applyMutation.isPending}
            className='flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
          >
            {applyMutation.isPending ? (
              <svg className='size-4 animate-spin' fill='none' viewBox='0 0 24 24'>
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
            ) : (
              <Lucide.Check className='size-4' />
            )}
            Apply Layout
          </button>

          {/* Preview Changes */}
          <button
            type='button'
            onClick={() => previewMutation.mutate()}
            disabled={previewMutation.isPending || isLoadingLayout}
            className='flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
          >
            {previewMutation.isPending ? (
              <svg className='size-4 animate-spin' fill='none' viewBox='0 0 24 24'>
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
            ) : (
              <Lucide.Eye className='size-4' />
            )}
            Preview Changes
          </button>

          {/* Revert Layout */}
          <button
            type='button'
            onClick={() => revertMutation.mutate()}
            disabled={revertMutation.isPending || !hasStagedChanges}
            className='flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
          >
            {revertMutation.isPending ? (
              <svg className='size-4 animate-spin' fill='none' viewBox='0 0 24 24'>
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
            ) : (
              <Lucide.RotateCcw className='size-4' />
            )}
            Revert Layout
          </button>

          {/* Skip Dead Nodes */}
          <button
            type='button'
            onClick={handleSkipDeadNodes}
            disabled={skipDeadMutation.isPending}
            className='flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 shadow-sm transition-all hover:bg-red-100 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
          >
            {skipDeadMutation.isPending ? (
              <svg className='size-4 animate-spin' fill='none' viewBox='0 0 24 24'>
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
            ) : (
              <Lucide.SkipForward className='size-4' />
            )}
            Skip Dead Nodes
          </button>

          {/* Update Layout */}
          <button
            type='button'
            onClick={() => setShowUpdateForm(!showUpdateForm)}
            className='flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
          >
            <Lucide.Edit className='size-4' />
            {showUpdateForm ? 'Hide' : 'Show'} Update Form
          </button>

          {/* Show History */}
          <button
            type='button'
            onClick={() => setShowHistory(!showHistory)}
            className='flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
          >
            <Lucide.History className='size-4' />
            {showHistory ? 'Hide' : 'Show'} History
          </button>
        </div>
      </div>

      {/* Update Layout Form */}
      {showUpdateForm && (
        <div className='rounded-lg border border-gray-200 bg-white p-6'>
          <h3 className='mb-4 text-lg font-semibold text-gray-900'>Update Cluster Layout</h3>

          <div className='space-y-4'>
            {/* Node Selection */}
            <div>
              <label htmlFor='node-select' className='block text-sm font-medium text-gray-700'>
                Select Node
              </label>
              <select
                id='node-select'
                value={selectedNode}
                onChange={(e) => setSelectedNode(e.target.value)}
                className='mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none'
              >
                <option value=''>Select a node...</option>
                {layout?.roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.id}
                  </option>
                ))}
              </select>
            </div>

            {/* Zone Selection */}
            <div>
              <label htmlFor='zone-input' className='block text-sm font-medium text-gray-700'>
                Zone
              </label>
              <input
                id='zone-input'
                type='text'
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                placeholder='Enter zone (optional)'
                className='mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none'
              />
            </div>

            {/* Capacity Input */}
            <div>
              <label htmlFor='capacity-input' className='block text-sm font-medium text-gray-700'>
                Capacity (GB)
              </label>
              <input
                id='capacity-input'
                type='number'
                value={selectedCapacity}
                onChange={(e) => setSelectedCapacity(e.target.value)}
                placeholder='Enter capacity (optional)'
                className='mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none'
              />
            </div>

            {/* Submit Button */}
            <button
              type='button'
              onClick={handleUpdateLayout}
              disabled={!selectedNode || updateMutation.isPending}
              className='flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
            >
              {updateMutation.isPending ? (
                <svg className='size-4 animate-spin' fill='none' viewBox='0 0 24 24'>
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
              ) : (
                <Lucide.Check className='size-4' />
              )}
              Update Layout
            </button>
          </div>
        </div>
      )}

      {/* Layout History */}
      {showHistory && history && (
        <div className='rounded-lg border border-gray-200 bg-white p-6'>
          <h3 className='mb-4 text-lg font-semibold text-gray-900'>Layout History</h3>
          <div className='max-h-96 space-y-2 overflow-y-auto'>
            {history.versions.map((version) => (
              <div
                key={version.version}
                className={`flex items-center justify-between rounded-lg border px-4 py-3 ${
                  version.version === history.currentVersion
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className='flex items-center gap-3'>
                  <span className='font-medium text-gray-900'>v{version.version}</span>
                  {version.version === history.currentVersion && (
                    <span className='rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800'>
                      Current
                    </span>
                  )}
                </div>
                <span className='text-sm text-gray-500'>
                  {new Date(version.timestamp * 1000).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview Results */}
      {showPreview && previewMutation.data?.data && (
        <div className='rounded-lg border border-blue-200 bg-blue-50 p-6'>
          <div className='flex items-start gap-3'>
            <Lucide.Eye className='mt-0.5 size-6 shrink-0 text-blue-600' />
            <div className='flex-1'>
              <p className='text-base font-medium text-blue-800'>Preview Results</p>
              <div className='mt-2 space-y-2'>
                {'message' in previewMutation.data.data ? (
                  previewMutation.data.data.message.map((msg: string, index: number) => (
                    <p key={index} className='text-sm text-blue-700'>
                      • {msg}
                    </p>
                  ))
                ) : (
                  <p className='text-sm text-red-700'>Error: {previewMutation.data.data.error}</p>
                )}
              </div>
            </div>
            <button
              type='button'
              onClick={() => setShowPreview(false)}
              className='rounded-full p-1 text-blue-600 hover:bg-blue-200'
            >
              <Lucide.X className='size-4' />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
