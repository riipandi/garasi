import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { GetClusterStatusResponse } from '~/shared/schemas/cluster.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  const data = await gfetch<GetClusterStatusResponse>('/v2/GetClusterStatus')
  logger.withMetadata(data).info('Getting cluster status')

  return createResponse<GetClusterStatusResponse>(event, 'Get Cluster Status', { data })
})
