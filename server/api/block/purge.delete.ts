import { HTTPError, getQuery, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  const { node } = getQuery<{ node: string }>(event)

  if (!node) {
    logger.debug('Node parameter is required')
    throw new HTTPError({ status: 400, statusText: 'Node parameter is required' })
  }

  const body = await readBody<string[]>(event)

  if (!body || !Array.isArray(body) || body.length === 0) {
    logger.debug('Block hashes array is required and must not be empty')
    throw new HTTPError({
      status: 400,
      statusText: 'Block hashes array is required and must not be empty'
    })
  }

  logger.withMetadata({ node, blockHashes: body }).info('Purging blocks')
  const data = await gfetch('/v2/PurgeBlocks', {
    method: 'POST',
    params: { node },
    body
  })

  return { status: 'success', message: 'Purge Blocks', data }
})
