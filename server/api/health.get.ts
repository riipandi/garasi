import { defineHandler } from 'nitro/h3'
import { createErrorResonse, createResponse } from '~/server/platform/responder'

export default defineHandler(async (event) => {
  const { gfetch, logger } = event.context
  const log = logger.withPrefix('HealthCheck')
  try {
    log.debug('Checking cluster health status')
    const data = await gfetch<string>('/health')
    log.withMetadata({ data }).debug('Cluster health check completed')

    // Format the message for response
    const message = data.substring(0, data.indexOf('\n'))

    return createResponse(event, message)
  } catch (error) {
    log.withError(error).error('Failed to check cluster health')
    return createErrorResonse(event, error)
  }
})
