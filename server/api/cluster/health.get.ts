import { defineHandler } from 'nitro/h3'
import { createErrorResonse } from '~/server/platform/responder'

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
    return createErrorResonse(event, error)
  }
})
