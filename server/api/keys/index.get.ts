import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { ListAccessKeysResponse } from '~/shared/schemas/keys.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context
  const log = logger.withPrefix('ListKeys')

  const data = await gfetch<ListAccessKeysResponse[]>('/v2/ListKeys')
  log.withMetadata(data).debug('Access keys listed successfully')

  return createResponse<ListAccessKeysResponse[]>(event, 'List Access Keys', { data })
})
