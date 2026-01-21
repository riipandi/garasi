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

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  logger.info('Reverting cluster layout')
  const data = await gfetch<GetClusterLayoutResp>('/v2/RevertClusterLayout', {
    method: 'POST'
  })

  return { status: 'success', message: 'Revert Cluster Layout', data }
})
