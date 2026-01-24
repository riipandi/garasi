import { HTTPError, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { UpdateClusterLayoutRequest } from '~/shared/schemas/layout.schema'
import type { UpdateClusterLayoutResponse } from '~/shared/schemas/layout.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context
  const log = logger.withPrefix('UpdateClusterLayout')

  const body = await readBody<UpdateClusterLayoutRequest>(event)

  if (!body?.roles || !Array.isArray(body.roles)) {
    log.warn('Roles array is required')
    throw new HTTPError({ status: 400, statusText: 'Roles array is required' })
  }

  log.withMetadata({ roleCount: body.roles.length }).debug('Updating cluster layout')
  const data = await gfetch<UpdateClusterLayoutResponse>('/v2/UpdateClusterLayout', {
    method: 'POST',
    body
  })

  return createResponse<UpdateClusterLayoutResponse>(event, 'Update Cluster Layout', { data })
})
