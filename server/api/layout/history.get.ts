import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { GetLayoutHistoryResponse } from '~/shared/schemas/layout.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context
  const log = logger.withPrefix('GetLayoutHistory')

  log.debug('Getting cluster layout history')
  const data = await gfetch<GetLayoutHistoryResponse>('/v2/GetClusterLayoutHistory')
  log.withMetadata(data).debug('Cluster layout history retrieved')

  return createResponse<GetLayoutHistoryResponse>(event, 'Get Cluster Layout History', { data })
})
