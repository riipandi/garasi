import { getQuery, HTTPError } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { GetNodeStatisticsParams } from '~/shared/schemas/node.schema'
import type { GetNodeStatisticsResponse } from '~/shared/schemas/node.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  const params = getQuery<GetNodeStatisticsParams>(event)
  if (!params?.node) {
    logger.withPrefix('GetNodeStatistics').debug('Node parameter is required')
    throw new HTTPError({ status: 400, statusText: 'Node parameter is required' })
  }

  const data = await gfetch<GetNodeStatisticsResponse>('/v2/GetNodeStatistics', { params })
  logger.withMetadata(data).debug('Getting node statistics')

  return createResponse<GetNodeStatisticsResponse>(event, 'Get Node Statistics', { data })
})
