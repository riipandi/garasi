import { defineHandler, getRouterParam, HTTPError, readBody } from 'nitro/h3'

interface ApiBucketKeyPerm {
  owner?: boolean // Allow owner permissions
  read?: boolean // Allow read permissions
  write?: boolean // Allow write permissions
}

interface AllowBucketKeyRequestBody {
  accessKeyId: string // ID of access key
  permissions: ApiBucketKeyPerm // Permissions to grant
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

    const body = await readBody<AllowBucketKeyRequestBody>(event)
    if (!body?.accessKeyId) {
      logger.debug('Access Key ID is required')
      throw new HTTPError({ status: 400, statusText: 'Access Key ID is required' })
    }
    if (!body?.permissions) {
      logger.debug('Permissions are required')
      throw new HTTPError({ status: 400, statusText: 'Permissions are required' })
    }

    logger.withMetadata({ bucketId: id, accessKeyId: body.accessKeyId }).info('Allowing bucket key')
    const data = await gfetch<GetBucketInfoResponse>('/v2/AllowBucketKey', {
      method: 'POST',
      body: { ...body, bucketId: id }
    })

    return { status: 'success', message: 'Allow Bucket Key', data }
  } catch (error) {
    event.res.status = error instanceof HTTPError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unknown error'
    const errors = error instanceof Error ? error.stack : null
    logger.withMetadata({ status: event.res.status }).withError(error).error(message)
    return { success: false, message, data: null, errors }
  }
})
