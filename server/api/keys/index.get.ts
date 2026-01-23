import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { ListAccessKeysResponse } from '~/shared/schemas/keys.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  const data = await gfetch<ListAccessKeysResponse[]>('/v2/ListKeys')
  logger.withMetadata(data).debug('List Access Keys')

  return createResponse<ListAccessKeysResponse[]>(event, 'List Access Keys', { data })
})
