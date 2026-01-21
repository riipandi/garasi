import { defineHandler, HTTPError, getQuery, readBody } from 'nitro/h3'

export default defineHandler(async (event) => {
  const { gfetch, logger } = event.context

  try {
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
  } catch (error) {
    event.res.status = error instanceof HTTPError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unknown error'
    const errors = error instanceof Error ? error.stack : null
    logger.withMetadata({ status: event.res.status }).withError(error).error(message)
    return { success: false, message, data: null, errors }
  }
})
