import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { ListBucketsResponse } from '~/shared/schemas/bucket.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  logger.debug('Listing buckets')
  const data = await gfetch<ListBucketsResponse[]>('/v2/ListBuckets')
  logger.withMetadata({ bucketCount: data.length }).debug('Buckets listed successfully')

  return createResponse<ListBucketsResponse[]>(event, 'List Buckets', { data })
})
