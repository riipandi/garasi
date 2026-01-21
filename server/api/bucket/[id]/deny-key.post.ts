import { defineHandler, getRouterParam, HTTPError, readBody } from 'nitro/h3'
import { createErrorResonse } from '~/server/platform/responder'

interface ApiBucketKeyPerm {
  owner?: boolean // Deny owner permissions
  read?: boolean // Deny read permissions
  write?: boolean // Deny write permissions
}

interface DenyBucketKeyRequestBody {
  accessKeyId: string // ID of access key
  permissions: ApiBucketKeyPerm // Permissions to deny
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

    const body = await readBody<DenyBucketKeyRequestBody>(event)
    if (!body?.accessKeyId) {
      logger.debug('Access Key ID is required')
      throw new HTTPError({ status: 400, statusText: 'Access Key ID is required' })
    }
    if (!body?.permissions) {
      logger.debug('Permissions are required')
      throw new HTTPError({ status: 400, statusText: 'Permissions are required' })
    }

    logger.withMetadata({ bucketId: id, accessKeyId: body.accessKeyId }).info('Denying bucket key')
    const data = await gfetch<GetBucketInfoResponse>('/v2/DenyBucketKey', {
      method: 'POST',
      body: { ...body, bucketId: id }
    })

    return { status: 'success', message: 'Deny Bucket Key', data }
  } catch (error) {
    return createErrorResonse(event, error)
  }
})
