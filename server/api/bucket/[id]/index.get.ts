import { defineHandler, HTTPError, getQuery, getRouterParam } from 'nitro/h3'

interface GetBucketInfoParams {
  id?: string // Exact bucket ID to look up
  globalAlias?: string // Global alias of bucket to look up
  search?: string // Partial ID or alias to search for
}

interface GetBucketInfoResponse {
  id: string
  created: string
  globalAliases: string[]
  localAliases: Array<{
    accessKeyId: string
    alias: string
  }>
  websiteAccess: boolean
  websiteConfig: {
    indexDocument: string
    errorDocument: string | null
  } | null
  keys: Array<{
    accessKeyId: string
    name: string
    permissions: {
      owner: boolean
      read: boolean
      write: boolean
    }
    bucketLocalAliases: string[]
  }>
  objects: number
  bytes: number
  unfinishedUploads: number
  unfinishedMultipartUploads: number
  unfinishedMultipartUploadParts: number
  unfinishedMultipartUploadBytes: number
  quotas: {
    maxObjects: number | null
    maxSize: number | null
  }
}

export default defineHandler(async (event) => {
  const { gfetch, logger } = event.context

  try {
    const id = getRouterParam(event, 'id')
    if (!id) {
      logger.debug('Bucket ID is required')
      throw new HTTPError({ status: 400, statusText: 'Bucket ID is required' })
    }

    const { globalAlias, search } = getQuery<GetBucketInfoParams>(event)

    logger.withMetadata({ id, globalAlias, search }).info('Getting bucket information')
    const data = await gfetch<GetBucketInfoResponse>('/v2/GetBucketInfo', {
      params: { id, globalAlias, search }
    })

    if (!data) {
      return { success: false, message: 'Bucket not found', data: null }
    }

    return { status: 'success', message: 'Get Bucket Info', data }
  } catch (error) {
    event.res.status = error instanceof HTTPError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unknown error'
    const errors = error instanceof Error ? error.stack : null
    logger.withMetadata({ status: event.res.status }).withError(error).error(message)
    return { success: false, message, data: null, errors }
  }
})
