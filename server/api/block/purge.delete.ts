import { HTTPError, getQuery, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { PurgeBlocksParams, PurgeBlocksResponse } from '~/shared/schemas/block.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context
  const log = logger.withPrefix('PurgeBlocks')

  const params = getQuery<PurgeBlocksParams>(event)
  if (!params?.node) {
    log.warn('Node parameter is required')
    throw new HTTPError({ status: 400, statusText: 'Node parameter is required' })
  }

  const body = await readBody<string[]>(event)

  if (!body || !Array.isArray(body) || body.length === 0) {
    log.warn('Block hashes array is required and must not be empty')
    throw new HTTPError({
      status: 400,
      statusText: 'Block hashes array is required and must not be empty'
    })
  }

  log.withMetadata({ node: params.node, blockCount: body.length }).debug('Purging blocks')
  const data = await gfetch<PurgeBlocksResponse>('/v2/PurgeBlocks', {
    method: 'POST',
    params,
    body
  })

  return createResponse<PurgeBlocksResponse>(event, 'Purge Blocks', { data })
})
