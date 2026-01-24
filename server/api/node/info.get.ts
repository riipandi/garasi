import { getQuery, HTTPError } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { GetNodeInfoRequest } from '~/shared/schemas/node.schema'
import type { GetNodeInfoResponse } from '~/shared/schemas/node.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context
  const log = logger.withPrefix('GetNodeInfo')

  const params = getQuery<GetNodeInfoRequest>(event)
  if (!params?.node) {
    log.warn('Node parameter is required')
    throw new HTTPError({ status: 400, statusText: 'Node parameter is required' })
  }

  log.withMetadata({ node: params.node }).debug('Getting node information')
  const data = await gfetch<GetNodeInfoResponse>('/v2/GetNodeInfo', { params })

  return createResponse<GetNodeInfoResponse>(event, 'Get Node Information', { data })
})
