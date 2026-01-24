import { getQuery, HTTPError } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { GetNodeStatisticsParams } from '~/shared/schemas/node.schema'
import type { GetNodeStatisticsResponse } from '~/shared/schemas/node.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context
  const log = logger.withPrefix('GetNodeStatistics')

  const params = getQuery<GetNodeStatisticsParams>(event)
  if (!params?.node) {
    log.warn('Node parameter is required')
    throw new HTTPError({ status: 400, statusText: 'Node parameter is required' })
  }

  log.withMetadata({ node: params.node }).debug('Getting node statistics')
  const data = await gfetch<GetNodeStatisticsResponse>('/v2/GetNodeStatistics', { params })

  return createResponse<GetNodeStatisticsResponse>(event, 'Get Node Statistics', { data })
})
