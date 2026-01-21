import { defineHandler, HTTPError } from 'nitro/h3'

interface ListKeysResponseItem {
  id: string
  name: string
  created: string | null
  deleted: boolean
}

export default defineHandler(async (event) => {
  const { gfetch, logger } = event.context

  try {
    logger.info('Listing access keys')
    const data = await gfetch<ListKeysResponseItem[]>('/v2/ListKeys')

    return { status: 'success', message: 'List Access Keys', data }
  } catch (error) {
    event.res.status = error instanceof HTTPError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unknown error'
    const errors = error instanceof Error ? error.stack : null
    logger.withMetadata({ status: event.res.status }).withError(error).error(message)
    return { success: false, message, data: null, errors }
  }
})
