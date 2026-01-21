import { getRouterParam, HTTPError, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'

interface AddBucketAliasRequestBody {
  globalAlias?: string // Global alias for the bucket
  localAlias?: {
    accessKeyId: string // ID of the access key to which the local alias is attached
    alias: string // Local alias for the bucket
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

  const body = await readBody<AddBucketAliasRequestBody>(event)
  if (!body?.globalAlias && !body?.localAlias) {
    logger.debug('Either globalAlias or localAlias is required')
    throw new HTTPError({
      status: 400,
      statusText: 'Either globalAlias or localAlias is required'
    })
  }

  logger.withMetadata({ bucketId: id, body }).info('Adding bucket alias')
  const data = await gfetch<GetBucketInfoResponse>('/v2/AddBucketAlias', {
    method: 'POST',
    body: { ...body, bucketId: id }
  })

  return { status: 'success', message: 'Add Bucket Alias', data }
})
