import { defineHandler } from 'nitro/h3'
import { createErrorResonse } from '~/server/platform/responder'

interface ListBucketsResponseItem {
  id: string
  created: string
  globalAliases: string[]
  localAliases: Array<{
    accessKeyId: string
    alias: string
  }>
}

export default defineHandler(async (event) => {
  const { gfetch, logger } = event.context

  try {
    logger.info('Listing buckets')
    const data = await gfetch<ListBucketsResponseItem[]>('/v2/ListBuckets')
    return { status: 'success', message: 'List Buckets', data }
  } catch (error) {
    return createErrorResonse(event, error)
  }
})
