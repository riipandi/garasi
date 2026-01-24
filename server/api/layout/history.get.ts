import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { GetLayoutHistoryResponse } from '~/shared/schemas/layout.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  const data = await gfetch<GetLayoutHistoryResponse>('/v2/GetClusterLayoutHistory')
  logger.withMetadata(data).debug('Getting cluster layout history')

  return createResponse<GetLayoutHistoryResponse>(event, 'Get Cluster Layout History', { data })
})
