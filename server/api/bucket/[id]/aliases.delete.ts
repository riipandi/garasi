import { getRouterParam, HTTPError, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'

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

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

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
})
