import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { GetClusterHealthResponse } from '~/shared/schemas/cluster.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context
  const log = logger.withPrefix('GetClusterHealth')

  log.debug('Getting cluster health status')
  const data = await gfetch<GetClusterHealthResponse>('/v2/GetClusterHealth')
  log.withMetadata(data).debug('Cluster health retrieved')

  return createResponse<GetClusterHealthResponse>(event, 'Get Cluster Health', { data })
})
