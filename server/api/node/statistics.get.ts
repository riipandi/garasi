import { defineHandler, HTTPError, getQuery } from 'nitro/h3'

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

export default defineHandler(async (event) => {
  const { gfetch, logger } = event.context

  try {
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
  } catch (error) {
    event.res.status = error instanceof HTTPError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unknown error'
    const errors = error instanceof Error ? error.stack : null
    logger.withMetadata({ status: event.res.status }).withError(error).error(message)
    return { success: false, message, data: null, errors }
  }
})
