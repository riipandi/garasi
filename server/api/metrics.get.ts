import { defineHandler, HTTPError } from 'nitro/h3'

export default defineHandler(async (event) => {
  const { gfetch, logger } = event.context
  try {
    const data = await gfetch('/metrics')
    return { status: 'success', message: 'Get Metrics', data }
  } catch (error) {
    event.res.status = error instanceof HTTPError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unknown error'
    const errors = error instanceof Error ? error.stack : null
    logger.withMetadata({ status: event.res.status }).withError(error).error(message)
    return { success: false, message, data: null, errors }
  }
})
