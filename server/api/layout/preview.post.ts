import { defineProtectedHandler } from '~/server/platform/guards'

interface ZoneRedundancy {
  atLeast?: number | null
  maximum?: string | null
}

interface LayoutParameters {
  zoneRedundancy: ZoneRedundancy
}

interface LayoutNodeRole {
  id: string
  zone: string
  tags: string[]
  capacity: number | null
  storedPartitions: number | null
  usableCapacity: number | null
}

interface NodeRoleChange {
  id: string
  remove?: boolean
  zone?: string
  tags?: string[]
  capacity?: number | null
}

interface GetClusterLayoutResp {
  version: number
  roles: LayoutNodeRole[]
  parameters: LayoutParameters
  partitionSize: number
  stagedRoleChanges: NodeRoleChange[]
  stagedParameters: LayoutParameters | null
}

interface PreviewClusterLayoutChangesRespSuccess {
  message: string[]
  newLayout: GetClusterLayoutResp
}

interface PreviewClusterLayoutChangesRespError {
  error: string
}

type PreviewClusterLayoutChangesResp =
  | PreviewClusterLayoutChangesRespSuccess
  | PreviewClusterLayoutChangesRespError

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  logger.info('Previewing cluster layout changes')
  const data = await gfetch<PreviewClusterLayoutChangesResp>('/v2/PreviewClusterLayoutChanges', {
    method: 'POST'
  })

  return { status: 'success', message: 'Preview Cluster Layout Changes', data }
})
