import { defineHandler, HTTPError, readBody } from 'nitro/h3'
import { createErrorResonse } from '~/server/platform/responder'

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

interface ApplyClusterLayoutRequestBody {
  version: number
}

interface ApplyClusterLayoutResp {
  message: string[]
  layout: GetClusterLayoutResp
}

export default defineHandler(async (event) => {
  const { gfetch, logger } = event.context

  try {
    const body = await readBody<ApplyClusterLayoutRequestBody>(event)

    if (body?.version === undefined || body?.version === null) {
      logger.debug('Version is required')
      throw new HTTPError({ status: 400, statusText: 'Version is required' })
    }

    logger.withMetadata({ version: body.version }).info('Applying cluster layout')
    const data = await gfetch<ApplyClusterLayoutResp>('/v2/ApplyClusterLayout', {
      method: 'POST',
      body
    })

    return { status: 'success', message: 'Apply Cluster Layout', data }
  } catch (error) {
    return createErrorResonse(event, error)
  }
})
