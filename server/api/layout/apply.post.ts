import { HTTPError, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { ApplyClusterLayoutRequest } from '~/shared/schemas/layout.schema'
import type { ApplyClusterLayoutResponse } from '~/shared/schemas/layout.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  const body = await readBody<ApplyClusterLayoutRequest>(event)

  if (body?.version === undefined || body?.version === null) {
    logger.withPrefix('ApplyClusterLayout').debug('Version is required')
    throw new HTTPError({ status: 400, statusText: 'Version is required' })
  }

  const data = await gfetch<ApplyClusterLayoutResponse>('/v2/ApplyClusterLayout', {
    method: 'POST',
    body
  })
  logger.withMetadata(data).debug('Applying cluster layout')

  return createResponse<ApplyClusterLayoutResponse>(event, 'Apply Cluster Layout', { data })
})
