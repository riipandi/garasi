import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { ListBucketsResponse } from '~/shared/schemas/bucket.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context
  const log = logger.withPrefix('ListBuckets')

  log.debug('Listing buckets')
  const data = await gfetch<ListBucketsResponse[]>('/v2/ListBuckets')
  log.withMetadata({ bucketCount: data.length }).debug('Buckets listed successfully')

  return createResponse<ListBucketsResponse[]>(event, 'List Buckets', { data })
})
