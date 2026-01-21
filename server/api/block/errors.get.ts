import { defineHandler, HTTPError } from 'nitro/h3'

interface BlockError {
  blockHash: string
  refcount: number
  errorCount: number
  lastTrySecsAgo: number
  nextTryInSecs: number
}

export default defineHandler(async (event) => {
  const { gfetch, logger } = event.context

  try {
    logger.info('Listing block errors')
    const data = await gfetch<BlockError>('/v2/ListBlockErrors')

    return { status: 'success', message: 'List Block Errors', data }
  } catch (error) {
    event.res.status = error instanceof HTTPError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unknown error'
    const errors = error instanceof Error ? error.stack : null
    logger.withMetadata({ status: event.res.status }).withError(error).error(message)
    return { success: false, message, data: null, errors }
  }
})
