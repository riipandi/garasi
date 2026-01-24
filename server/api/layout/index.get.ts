import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { GetClusterLayoutResponse } from '~/shared/schemas/layout.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context
  const log = logger.withPrefix('GetClusterLayout')

  log.debug('Getting cluster layout')
  const data = await gfetch<GetClusterLayoutResponse>('/v2/GetClusterLayout')
  log.withMetadata(data).debug('Cluster layout retrieved')

  return createResponse<GetClusterLayoutResponse>(event, 'Get Cluster Layout', { data })
})
