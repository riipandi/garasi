import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { GetLayoutHistoryResponse } from '~/shared/schemas/layout.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  logger.debug('Getting cluster layout history')
  const data = await gfetch<GetLayoutHistoryResponse>('/v2/GetClusterLayoutHistory')
  logger.withMetadata(data).debug('Cluster layout history retrieved')

  return createResponse<GetLayoutHistoryResponse>(event, 'Get Cluster Layout History', { data })
})
