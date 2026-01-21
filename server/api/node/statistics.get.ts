import { HTTPError, getQuery } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'

interface GetNodeStatisticsParams {
  node: string // Node ID to query, or `*` for all nodes, or `self` for the node responding to the request
}

interface NodeStatisticsResp {
  freeform: string
}

interface GetNodeStatisticsResp {
  success: Record<string, NodeStatisticsResp>
  error: Record<string, string>
}

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  const { node } = getQuery<GetNodeStatisticsParams>(event)

  if (!node) {
    logger.debug('Node parameter is required')
    throw new HTTPError({ status: 400, statusText: 'Node parameter is required' })
  }

  logger.withMetadata({ node }).info('Getting node statistics')
  const data = await gfetch<GetNodeStatisticsResp>('/v2/GetNodeStatistics', {
    params: { node }
  })

  return { status: 'success', message: 'Get Node Statistics', data }
})
