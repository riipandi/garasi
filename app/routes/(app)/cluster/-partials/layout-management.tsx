import { QueryClient, useMutation, useQuery } from '@tanstack/react-query'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import { Badge } from '~/app/components/badge'
import { Button } from '~/app/components/button'
import { Card, CardBody } from '~/app/components/card'
import { Field, FieldLabel } from '~/app/components/field'
import { Input } from '~/app/components/input'
import {
  Select,
  SelectList,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue
} from '~/app/components/select'
import { Spinner } from '~/app/components/spinner'
import { Text } from '~/app/components/typography'
import { getClusterLayout } from '~/app/services/layout.service'
import { getLayoutHistory } from '~/app/services/layout.service'
import { previewLayoutChanges } from '~/app/services/layout.service'
import { applyClusterLayout } from '~/app/services/layout.service'
import { updateClusterLayout } from '~/app/services/layout.service'
import { revertClusterLayout } from '~/app/services/layout.service'
import { skipDeadNodes } from '~/app/services/layout.service'

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

  const isStagedChangesArray = (changes: any): changes is any[] => {
    return Array.isArray(changes)
  }

  const { data: layoutData, isLoading: isLoadingLayout } = useQuery({
    queryKey: ['cluster', 'layout'],
    queryFn: () => getClusterLayout()
  })

  const { data: historyData } = useQuery({
    queryKey: ['cluster', 'layout', 'history'],
    queryFn: () => getLayoutHistory(),
    enabled: showHistory
  })

  const layout = layoutData?.data
  const history = historyData?.data

  const previewMutation = useMutation({
    mutationFn: () => previewLayoutChanges(),
    onSuccess: () => {
      setShowPreview(true)
    }
  })

  const applyMutation = useMutation({
    mutationFn: (version: number) => applyClusterLayout({ version }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cluster', 'layout'] })
      queryClient.invalidateQueries({ queryKey: ['cluster', 'health'] })
      queryClient.invalidateQueries({ queryKey: ['cluster', 'status'] })
    }
  })

  const updateMutation = useMutation({
    mutationFn: (data: { roles: any[]; parameters: any }) => updateClusterLayout(data),
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

  const revertMutation = useMutation({
    mutationFn: () => revertClusterLayout(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cluster', 'layout'] })
      queryClient.invalidateQueries({ queryKey: ['cluster', 'health'] })
      queryClient.invalidateQueries({ queryKey: ['cluster', 'status'] })
    }
  })

  const skipDeadMutation = useMutation({
    mutationFn: (data: { version: number; allowMissingData: boolean }) => skipDeadNodes(data),
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

  const hasStagedChanges =
    layout?.stagedRoleChanges &&
    isStagedChangesArray(layout.stagedRoleChanges) &&
    layout.stagedRoleChanges.length > 0

  const nodeOptions =
    layout?.roles?.map((role: { id: string }) => ({
      value: role.id,
      label: role.id
    })) || []

  return (
    <div className='space-y-6'>
      <div className='mb-4 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Text className='text-lg font-semibold'>Layout Information</Text>
          <Badge variant='info'>v{layout?.version || layoutVersion || 0}</Badge>
        </div>
        <Lucide.LayoutGrid className='text-muted size-5' />
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <Card>
          <CardBody>
            <div className='flex items-center justify-between'>
              <div>
                <Text className='text-muted'>Current Version</Text>
                <Text className='mt-1 text-2xl font-semibold'>
                  {layout?.version || layoutVersion || 0}
                </Text>
              </div>
              <Lucide.Tag className='text-muted size-6' />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className='flex items-center justify-between'>
              <div>
                <Text className='text-muted'>Partition Size</Text>
                <Text className='mt-1 text-2xl font-semibold'>
                  {layout?.partitionSize
                    ? `${(layout.partitionSize / 1024 / 1024).toFixed(2)} MB`
                    : 'N/A'}
                </Text>
              </div>
              <Lucide.HardDrive className='text-muted size-6' />
            </div>
          </CardBody>
        </Card>
      </div>

      {layout?.parameters?.zoneRedundancy && (
        <Card>
          <CardBody>
            <Text className='text-muted'>Zone Redundancy</Text>
            <div className='mt-2 flex gap-2'>
              {typeof layout.parameters.zoneRedundancy === 'object' &&
                layout.parameters.zoneRedundancy.atLeast && (
                  <Badge variant='primary'>
                    At least {layout.parameters.zoneRedundancy.atLeast}
                  </Badge>
                )}
              {layout.parameters.zoneRedundancy === 'maximum' && (
                <Badge variant='primary'>Maximum</Badge>
              )}
            </div>
          </CardBody>
        </Card>
      )}

      {hasStagedChanges && (
        <Card>
          <CardBody className='border-warning/30 bg-warning/10'>
            <div className='flex items-start gap-3'>
              <Lucide.AlertTriangle className='text-warning mt-0.5 size-6 shrink-0' />
              <div className='flex-1'>
                <Text className='text-warning font-semibold'>
                  Staged Changes (
                  {isStagedChangesArray(layout.stagedRoleChanges)
                    ? layout.stagedRoleChanges.length
                    : 1}
                  )
                </Text>
                <Text className='text-muted mt-1 text-sm'>
                  There are pending changes to the cluster layout. Preview and apply to make them
                  active.
                </Text>
                <div className='mt-3 space-y-2'>
                  {isStagedChangesArray(layout.stagedRoleChanges) &&
                    layout.stagedRoleChanges.map((change: any, index: number) => (
                      <div
                        key={`${change.id}-${change.zone || 'no-zone'}-${index}`}
                        className='border-warning/30 flex items-center gap-2 rounded-lg border bg-white p-3'
                      >
                        <Lucide.Edit3 className='text-warning size-4' />
                        <Text className='text-muted text-sm'>
                          {change.remove ? 'Remove' : 'Update'} node {change.id}
                          {change.zone && ` to zone ${change.zone}`}
                        </Text>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardBody>
          <Text className='mb-4 font-semibold'>Layout Actions</Text>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            <Button
              variant='primary'
              onClick={handleApply}
              disabled={!hasStagedChanges || applyMutation.isPending}
            >
              {applyMutation.isPending ? (
                <>
                  <Spinner className='size-4' />
                  Applying...
                </>
              ) : (
                <>
                  <Lucide.Check className='size-4' />
                  Apply Layout
                </>
              )}
            </Button>

            <Button
              variant='outline'
              onClick={() => previewMutation.mutate()}
              disabled={previewMutation.isPending || isLoadingLayout}
            >
              {previewMutation.isPending ? (
                <>
                  <Spinner className='size-4' />
                  Loading...
                </>
              ) : (
                <>
                  <Lucide.Eye className='size-4' />
                  Preview Changes
                </>
              )}
            </Button>

            <Button
              variant='outline'
              onClick={() => revertMutation.mutate()}
              disabled={revertMutation.isPending || !hasStagedChanges}
            >
              {revertMutation.isPending ? (
                <>
                  <Spinner className='size-4' />
                  Reverting...
                </>
              ) : (
                <>
                  <Lucide.RotateCcw className='size-4' />
                  Revert Layout
                </>
              )}
            </Button>

            <Button
              variant='danger'
              onClick={handleSkipDeadNodes}
              disabled={skipDeadMutation.isPending}
            >
              {skipDeadMutation.isPending ? (
                <>
                  <Spinner className='size-4' />
                  Skipping...
                </>
              ) : (
                <>
                  <Lucide.SkipForward className='size-4' />
                  Skip Dead Nodes
                </>
              )}
            </Button>

            <Button variant='outline' onClick={() => setShowUpdateForm(!showUpdateForm)}>
              <Lucide.Edit className='size-4' />
              {showUpdateForm ? 'Hide' : 'Show'} Update Form
            </Button>

            <Button variant='outline' onClick={() => setShowHistory(!showHistory)}>
              <Lucide.History className='size-4' />
              {showHistory ? 'Hide' : 'Show'} History
            </Button>
          </div>
        </CardBody>
      </Card>

      {showUpdateForm && (
        <Card>
          <CardBody>
            <Text className='mb-4 font-semibold'>Update Cluster Layout</Text>

            <div className='space-y-4'>
              <Field>
                <FieldLabel>Select Node</FieldLabel>
                <Select items={nodeOptions}>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Select a node...' />
                  </SelectTrigger>
                  <SelectPopup>
                    <SelectList>
                      {nodeOptions.map((option) => (
                        <SelectItem key={option.value} value={option}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectList>
                  </SelectPopup>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Zone</FieldLabel>
                <Input
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  placeholder='Enter zone (optional)'
                />
              </Field>

              <Field>
                <FieldLabel>Capacity (GB)</FieldLabel>
                <Input
                  type='number'
                  value={selectedCapacity}
                  onChange={(e) => setSelectedCapacity(e.target.value)}
                  placeholder='Enter capacity (optional)'
                />
              </Field>

              <Button
                variant='primary'
                block
                onClick={handleUpdateLayout}
                disabled={!selectedNode || updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <>
                    <Spinner className='size-4' />
                    Updating...
                  </>
                ) : (
                  <>
                    <Lucide.Check className='size-4' />
                    Update Layout
                  </>
                )}
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {showHistory && history && (
        <Card>
          <CardBody>
            <Text className='mb-4 font-semibold'>Layout History</Text>
            <div className='max-h-96 space-y-2 overflow-y-auto'>
              {history.versions.map((version: { version: number }) => (
                <div
                  key={version.version}
                  className={`flex items-center justify-between rounded-lg border px-4 py-3 ${
                    version.version === history.currentVersion
                      ? 'border-primary/30 bg-primary/10'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className='flex items-center gap-3'>
                    <Text className='font-medium'>v{version.version}</Text>
                    {version.version === history.currentVersion && (
                      <Badge variant='primary'>Current</Badge>
                    )}
                  </div>
                  <Text className='text-muted text-sm'>Layout version {version.version}</Text>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {showPreview && previewMutation.data?.data && (
        <Card>
          <CardBody className='border-primary/30 bg-primary/10'>
            <div className='flex items-start gap-3'>
              <Lucide.Eye className='text-primary mt-0.5 size-6 shrink-0' />
              <div className='flex-1'>
                <Text className='text-primary font-semibold'>Preview Results</Text>
                <div className='mt-2 space-y-2'>
                  {previewMutation.data.data.message ? (
                    <Text className='text-muted text-sm'>{previewMutation.data.data.message}</Text>
                  ) : (
                    <Text className='text-danger text-sm'>
                      Error: {previewMutation.data.data.error || 'Unknown error'}
                    </Text>
                  )}
                </div>
              </div>
              <Button variant='outline' size='sm' onClick={() => setShowPreview(false)}>
                <Lucide.X className='size-4' />
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  )
}
