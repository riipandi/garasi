import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { RevertClusterLayoutResponse } from '~/shared/schemas/layout.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  const data = await gfetch<RevertClusterLayoutResponse>('/v2/RevertClusterLayout', {
    method: 'POST'
  })
  logger.withMetadata(data).debug('Reverting cluster layout')

  return createResponse<RevertClusterLayoutResponse>(event, 'Revert Cluster Layout', { data })
})
