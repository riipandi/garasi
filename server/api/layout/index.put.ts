import { HTTPError, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { UpdateClusterLayoutRequest } from '~/shared/schemas/layout.schema'
import type { UpdateClusterLayoutResponse } from '~/shared/schemas/layout.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  const body = await readBody<UpdateClusterLayoutRequest>(event)

  if (!body?.roles || !Array.isArray(body.roles)) {
    logger.withPrefix('UpdateClusterLayout').debug('Roles array is required')
    throw new HTTPError({ status: 400, statusText: 'Roles array is required' })
  }

  const data = await gfetch<UpdateClusterLayoutResponse>('/v2/UpdateClusterLayout', {
    method: 'POST',
    body
  })
  logger.withMetadata(data).debug('Updating cluster layout')

  return createResponse<UpdateClusterLayoutResponse>(event, 'Update Cluster Layout', { data })
})
