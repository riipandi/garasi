import { HTTPError, getQuery } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'

interface GetNodeInfoParams {
  node: string // Node ID to query, or `*` for all nodes, or `self` for the node responding to the request
}

interface NodeInfoResp {
  nodeId: string
  garageVersion: string
  rustVersion: string
  dbEngine: string
  garageFeatures: string[] | null
}

interface GetNodeInfoResp {
  success: Record<string, NodeInfoResp>
  error: Record<string, string>
}

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  const { node } = getQuery<GetNodeInfoParams>(event)

  if (!node) {
    logger.debug('Node parameter is required')
    throw new HTTPError({ status: 400, statusText: 'Node parameter is required' })
  }

  logger.withMetadata({ node }).info('Getting node information')
  const data = await gfetch<GetNodeInfoResp>('/v2/GetNodeInfo', {
    params: { node }
  })

  return { status: 'success', message: 'Get Node Info', data }
})
