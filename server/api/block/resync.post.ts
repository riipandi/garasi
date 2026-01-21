import { HTTPError, getQuery, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  const { node } = getQuery<{ node: string }>(event)

  if (!node) {
    logger.debug('Node parameter is required')
    throw new HTTPError({ status: 400, statusText: 'Node parameter is required' })
  }

  const body = await readBody(event)

  if (!body) {
    logger.debug('Request body is required')
    throw new HTTPError({ status: 400, statusText: 'Request body is required' })
  }

  logger.withMetadata({ node, body }).info('Retrying block resync')
  const data = await gfetch('/v2/RetryBlockResync', {
    method: 'POST',
    params: { node },
    body
  })

  return { status: 'success', message: 'Retry Block Resync', data }
})
