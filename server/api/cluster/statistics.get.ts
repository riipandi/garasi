import { defineHandler, HTTPError } from 'nitro/h3'

interface GetClusterStatisticsResp {
  freeform: string
}

export default defineHandler(async (event) => {
  const { gfetch, logger } = event.context

  try {
    logger.info('Getting cluster statistics')
    const data = await gfetch<GetClusterStatisticsResp>('/v2/GetClusterStatistics')

    return { status: 'success', message: 'Get Cluster Statistics', data }
  } catch (error) {
    event.res.status = error instanceof HTTPError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unknown error'
    const errors = error instanceof Error ? error.stack : null
    logger.withMetadata({ status: event.res.status }).withError(error).error(message)
    return { success: false, message, data: null, errors }
  }
})
