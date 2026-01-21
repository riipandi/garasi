import { getRouterParam, HTTPError, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'

interface ApiBucketQuotas {
  maxObjects: number | null // Maximum number of objects allowed in the bucket
  maxSize: number | null // Maximum size in bytes allowed in the bucket
}

interface UpdateBucketWebsiteAccess {
  enabled: boolean // Whether website access is enabled
  indexDocument?: string | null // Index document for static website
  errorDocument?: string | null // Error document for static website
}

interface UpdateBucketRequestBody {
  websiteAccess?: UpdateBucketWebsiteAccess | null // Website access configuration
  quotas?: ApiBucketQuotas | null // Bucket quotas
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

  const body = await readBody<UpdateBucketRequestBody>(event)
  if (!body?.websiteAccess && !body?.quotas) {
    logger.debug('Either websiteAccess or quotas is required')
    throw new HTTPError({ status: 400, statusText: 'Either websiteAccess or quotas is required' })
  }

  logger.withMetadata({ id }).info('Updating bucket')
  const data = await gfetch<GetBucketInfoResponse>('/v2/UpdateBucket', {
    method: 'POST',
    params: { id },
    body
  })

  return { status: 'success', message: 'Update Bucket', data }
})
