import { defineHandler } from 'nitro/h3'
import { createErrorResonse } from '~/server/platform/responder'

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
    return createErrorResonse(event, error)
  }
})
