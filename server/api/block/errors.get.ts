import { defineProtectedHandler } from '~/server/platform/guards'

interface BlockError {
  blockHash: string
  refcount: number
  errorCount: number
  lastTrySecsAgo: number
  nextTryInSecs: number
}

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  logger.info('Listing block errors')
  const data = await gfetch<BlockError>('/v2/ListBlockErrors')

  return { status: 'success', message: 'List Block Errors', data }
})
