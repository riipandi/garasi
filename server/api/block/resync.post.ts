import { getQuery, HTTPError, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { RetryBlockResyncParams, RetryBlockResyncRequest } from '~/shared/schemas/block.schema'
import type { RetryBlockResyncResponse } from '~/shared/schemas/block.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  const params = getQuery<RetryBlockResyncParams>(event)
  if (!params?.node) {
    logger.withPrefix('RetryBlockResync').debug('Node parameter is required')
    throw new HTTPError({ status: 400, statusText: 'Node parameter is required' })
  }

  const body = await readBody<RetryBlockResyncRequest>(event)
  if (!body || typeof body.all !== 'boolean') {
    logger.withPrefix('RetryBlockResync').debug('All parameter is required')
    throw new HTTPError({ status: 400, statusText: 'All parameter is required' })
  }

  const data = await gfetch<RetryBlockResyncResponse>('/v2/RetryBlockResync', {
    method: 'POST',
    params,
    body
  })
  logger.withMetadata(data).debug('Retrying block resynchronization')

  return createResponse<RetryBlockResyncResponse>(event, 'Retry Block Resync', { data })
})
