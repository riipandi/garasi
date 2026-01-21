import { HTTPError, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'

interface ConnectClusterNodesRequestBody {
  nodes: string[] // Array of node addresses in format "node_id@net_address"
}

interface ConnectNodeResponse {
  success: boolean
  error: string | null
}

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  const body = await readBody<ConnectClusterNodesRequestBody>(event)

  if (!body?.nodes || !Array.isArray(body.nodes) || body.nodes.length === 0) {
    logger.debug('Nodes array is required and must not be empty')
    throw new HTTPError({
      status: 400,
      statusText: 'Nodes array is required and must not be empty'
    })
  }

  logger.withMetadata({ nodes: body.nodes }).info('Connecting cluster nodes')
  const data = await gfetch<ConnectNodeResponse[]>('/v2/ConnectClusterNodes', {
    method: 'POST',
    body: body.nodes
  })

  return { status: 'success', message: 'Connect Cluster Nodes', data }
})
