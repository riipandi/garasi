import { HTTPError, getQuery, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { GetBlockInfoParams } from '~/shared/schemas/block.schema'
import type { GetBlockInfoRequest } from '~/shared/schemas/block.schema'
import type { GetBlockInfoResponse } from '~/shared/schemas/block.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  const params = getQuery<GetBlockInfoParams>(event)

  if (!params?.node) {
    logger.warn('Node parameter is required')
    throw new HTTPError({ status: 400, statusText: 'Node parameter is required' })
  }

  const body = await readBody<GetBlockInfoRequest>(event)
  if (!body?.blockHash) {
    logger.warn('Block hash is required')
    throw new HTTPError({ status: 400, statusText: 'Block hash is required' })
  }

  logger
    .withMetadata({ node: params.node, blockHash: body.blockHash })
    .debug('Getting block information')
  const data = await gfetch<GetBlockInfoResponse>('/v2/GetBlockInfo', {
    method: 'POST',
    params,
    body
  })

  return createResponse<GetBlockInfoResponse>(event, 'Get Block Information', { data })
})
