import { getQuery, HTTPError } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { ListBlockErrorsParams } from '~/shared/schemas/block.schema'
import type { ListBlockErrorsResponse } from '~/shared/schemas/block.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  const params = getQuery<ListBlockErrorsParams>(event)
  if (!params?.node) {
    logger.withPrefix('ListBlockErrors').debug('Node parameter is required')
    throw new HTTPError({ status: 400, statusText: 'Node parameter is required' })
  }

  const data = await gfetch<ListBlockErrorsResponse>('/v2/ListBlockErrors', { params })
  logger.withMetadata(data).debug('Listing block errors')

  return createResponse<ListBlockErrorsResponse>(event, 'List Block Errors', { data })
})
