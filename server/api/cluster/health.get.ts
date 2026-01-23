import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { GetClusterHealthResponse } from '~/shared/schemas/cluster.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  const data = await gfetch<GetClusterHealthResponse>('/v2/GetClusterHealth')
  logger.withMetadata(data).info('Getting cluster health')

  return createResponse<GetClusterHealthResponse>(event, 'Get Cluster Health', { data })
})
