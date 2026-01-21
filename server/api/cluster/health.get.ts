import { defineProtectedHandler } from '~/server/platform/guards'

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

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  logger.info('Getting cluster health')
  const data = await gfetch<GetClusterHealthResp>('/v2/GetClusterHealth')

  return { status: 'success', message: 'Get Cluster Health', data }
})
