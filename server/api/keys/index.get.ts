import { defineProtectedHandler } from '~/server/platform/guards'

interface ListKeysResponseItem {
  id: string
  name: string
  created: string | null
  deleted: boolean
}

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  logger.info('Listing access keys')
  const data = await gfetch<ListKeysResponseItem[]>('/v2/ListKeys')

  return { status: 'success', message: 'List Access Keys', data }
})
