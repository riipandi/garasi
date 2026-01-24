import { HTTPError, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { ApplyClusterLayoutRequest } from '~/shared/schemas/layout.schema'
import type { ApplyClusterLayoutResponse } from '~/shared/schemas/layout.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context
  const log = logger.withPrefix('ApplyClusterLayout')

  const body = await readBody<ApplyClusterLayoutRequest>(event)

  if (body?.version === undefined || body?.version === null) {
    log.warn('Version is required')
    throw new HTTPError({ status: 400, statusText: 'Version is required' })
  }

  log.withMetadata({ version: body.version }).debug('Applying cluster layout')
  const data = await gfetch<ApplyClusterLayoutResponse>('/v2/ApplyClusterLayout', {
    method: 'POST',
    body
  })

  return createResponse<ApplyClusterLayoutResponse>(event, 'Apply Cluster Layout', { data })
})
