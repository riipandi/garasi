import { defineHandler, getRouterParam, HTTPError, readBody } from 'nitro/h3'

interface RemoveBucketAliasRequestBody {
  globalAlias?: string // Global alias to remove
  localAlias?: {
    accessKeyId: string // ID of access key to which local alias is attached
    alias: string // Local alias to remove
  }
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

    const body = await readBody<RemoveBucketAliasRequestBody>(event)

    if (!body?.globalAlias && !body?.localAlias) {
      logger.debug('Either globalAlias or localAlias is required')
      throw new HTTPError({
        status: 400,
        statusText: 'Either globalAlias or localAlias is required'
      })
    }

    logger
      .withMetadata({
        bucketId: id,
        globalAlias: body.globalAlias,
        localAlias: body.localAlias?.alias
      })
      .info('Removing bucket alias')
    const data = await gfetch<GetBucketInfoResponse>('/v2/RemoveBucketAlias', {
      method: 'POST',
      body: { ...body, bucketId: id }
    })

    return { status: 'success', message: 'Remove Bucket Alias', data }
  } catch (error) {
    event.res.status = error instanceof HTTPError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unknown error'
    const errors = error instanceof Error ? error.stack : null
    logger.withMetadata({ status: event.res.status }).withError(error).error(message)
    return { success: false, message, data: null, errors }
  }
})
