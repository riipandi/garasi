import { defineProtectedHandler } from '~/server/platform/guards'

interface ListBucketsResponseItem {
  id: string
  created: string
  globalAliases: string[]
  localAliases: Array<{
    accessKeyId: string
    alias: string
  }>
}

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  logger.info('Listing buckets')
  const data = await gfetch<ListBucketsResponseItem[]>('/v2/ListBuckets')
  return { status: 'success', message: 'List Buckets', data }
})
