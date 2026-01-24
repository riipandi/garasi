import { defineHandler } from 'nitro/h3'
import { createErrorResonse, createResponse } from '~/server/platform/responder'

export default defineHandler(async (event) => {
  const { gfetch, logger } = event.context
  try {
    logger.debug('Checking cluster health status')
    const data = await gfetch<string>('/health')
    logger.withMetadata({ data }).debug('Cluster health check completed')

    // Format the message for response
    const message = data.substring(0, data.indexOf('\n'))

    return createResponse(event, message)
  } catch (error) {
    logger.withError(error).error('Failed to check cluster health')
    return createErrorResonse(event, error)
  }
})
