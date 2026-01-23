import { defineHandler } from 'nitro/h3'
import { createErrorResonse, createResponse } from '~/server/platform/responder'

export default defineHandler(async (event) => {
  const { gfetch, logger } = event.context
  try {
    const data = await gfetch<string>('/health')
    logger.withMetadata({ data }).debug('Check Cluster Health')

    // Format the message for response
    const message = data.substring(0, data.indexOf('\n'))

    return createResponse(event, message)
  } catch (error) {
    return createErrorResonse(event, error)
  }
})
