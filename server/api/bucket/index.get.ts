import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { ListBucketsResponse } from '~/shared/schemas/bucket.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  const data = await gfetch<ListBucketsResponse[]>('/v2/ListBuckets')
  logger.withMetadata(data).debug('Listing buckets')

  return createResponse<ListBucketsResponse[]>(event, 'List Buckets', { data })
})
