import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { GetClusterStatusResponse } from '~/shared/schemas/cluster.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  logger.debug('Getting cluster status')
  const data = await gfetch<GetClusterStatusResponse>('/v2/GetClusterStatus')
  logger.withMetadata(data).debug('Cluster status retrieved')

  return createResponse<GetClusterStatusResponse>(event, 'Get Cluster Status', { data })
})
