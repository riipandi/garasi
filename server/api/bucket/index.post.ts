import { HTTPError, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'

interface CreateBucketLocalAlias {
  accessKeyId: string // ID of the access key to which the local alias is attached
  alias: string // Local alias for the bucket
  allow?: {
    owner?: boolean // Allow owner permissions
    read?: boolean // Allow read permissions
    write?: boolean // Allow write permissions
  }
}

interface CreateBucketRequestBody {
  globalAlias?: string | null // Global alias for the bucket
  localAlias?: CreateBucketLocalAlias | null // Local alias for the bucket
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

  const body = await readBody<CreateBucketRequestBody>(event)
  if (!body?.globalAlias && !body?.localAlias) {
    logger.debug('Either globalAlias or localAlias is required')
    throw new HTTPError({
      status: 400,
      statusText: 'Either globalAlias or localAlias is required'
    })
  }

  logger.withMetadata({ body }).info('Creating bucket')
  const data = await gfetch<GetBucketInfoResponse>('/v2/CreateBucket', {
    method: 'POST',
    body
  })

  return { status: 'success', message: 'Create Bucket', data }
})
