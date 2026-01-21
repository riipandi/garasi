import { defineHandler } from 'nitro/h3'
import { createErrorResonse } from '~/server/platform/responder'

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
    return createErrorResonse(event, error)
  }
})
