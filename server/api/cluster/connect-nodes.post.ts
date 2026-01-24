import { HTTPError, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { ConnectClusterNodesRequest } from '~/shared/schemas/cluster.schema'
import type { ConnectClusterNodesResponse } from '~/shared/schemas/cluster.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  const body = await readBody<ConnectClusterNodesRequest>(event)
  if (!body?.nodes || !Array.isArray(body.nodes) || body.nodes.length === 0) {
    logger.warn('Nodes array is required and must not be empty')
    throw new HTTPError({
      status: 400,
      statusText: 'Nodes array is required and must not be empty'
    })
  }

  // Validate node format: <node_id>@<net_address>
  const nodeFormatRegex = /^[a-f0-9]+@[^@]+:[0-9]+$/i
  const invalidNodes = body.nodes.filter((node) => !nodeFormatRegex.test(node))

  if (invalidNodes.length > 0) {
    logger.withMetadata({ invalidNodes }).warn('Invalid node format detected')
    throw new HTTPError({
      status: 400,
      statusText: 'Invalid node format. Each node must follow the format <node_id>@<net_address>'
    })
  }

  logger.withMetadata({ nodeCount: body.nodes.length }).debug('Connecting cluster nodes')
  const data = await gfetch<ConnectClusterNodesResponse[]>('/v2/ConnectClusterNodes', {
    method: 'POST',
    body: body.nodes
  })

  return createResponse<ConnectClusterNodesResponse[]>(event, 'Connect Cluster Nodes', { data })
})
