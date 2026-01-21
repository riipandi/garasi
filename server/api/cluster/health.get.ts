import { defineHandler, HTTPError } from 'nitro/h3'

interface GetClusterHealthResp {
  status: string // One of: 'healthy', 'degraded', 'unavailable'
  knownNodes: number
  connectedNodes: number
  storageNodes: number
  storageNodesUp: number
  partitions: number
  partitionsQuorum: number
  partitionsAllOk: number
}

export default defineHandler(async (event) => {
  const { gfetch, logger } = event.context

  try {
    logger.info('Getting cluster health')
    const data = await gfetch<GetClusterHealthResp>('/v2/GetClusterHealth')

    return { status: 'success', message: 'Get Cluster Health', data }
  } catch (error) {
    event.res.status = error instanceof HTTPError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unknown error'
    const errors = error instanceof Error ? error.stack : null
    logger.withMetadata({ status: event.res.status }).withError(error).error(message)
    return { success: false, message, data: null, errors }
  }
})
