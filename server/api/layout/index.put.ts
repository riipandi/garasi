import { HTTPError, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'

interface ZoneRedundancy {
  atLeast?: number | null
  maximum?: string | null
}

interface LayoutParameters {
  zoneRedundancy: ZoneRedundancy
}

// interface NodeAssignedRole {
//   zone: string
//   tags: string[]
//   capacity: number | null
// }

interface NodeRoleChange {
  id: string
  remove?: boolean
  zone?: string
  tags?: string[]
  capacity?: number | null
}

interface UpdateClusterLayoutRequestBody {
  roles: NodeRoleChange[]
  parameters: LayoutParameters | null
}

interface LayoutNodeRole {
  id: string
  zone: string
  tags: string[]
  capacity: number | null
  storedPartitions: number | null
  usableCapacity: number | null
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

  const body = await readBody<UpdateClusterLayoutRequestBody>(event)

  if (!body?.roles || !Array.isArray(body.roles)) {
    logger.debug('Roles array is required')
    throw new HTTPError({ status: 400, statusText: 'Roles array is required' })
  }

  logger.withMetadata({ roles: body.roles }).info('Updating cluster layout')
  const data = await gfetch<GetClusterLayoutResp>('/v2/UpdateClusterLayout', {
    method: 'POST',
    body
  })

  return { status: 'success', message: 'Update Cluster Layout', data }
})
