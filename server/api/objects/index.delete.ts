import { getQuery, HTTPError, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import { S3Service } from '~/server/platform/s3client'
import type { DeleteObjectResponse, DeleteObjectsResponse } from '~/shared/schemas/objects.schema'

interface DeleteRequestBody {
  key?: string
  keys?: string[]
  force?: boolean
}

export default defineProtectedHandler(async (event) => {
  const { logger } = event.context
  const log = logger.withPrefix('DeleteObject')

  const { bucket, prefix } = getQuery<{
    bucket: string
    prefix?: string
  }>(event)

  if (!bucket) {
    log.warn('Missing bucket parameter')
    throw new HTTPError({ status: 400, statusText: 'Missing bucket parameter' })
  }

  const body = await readBody<DeleteRequestBody | undefined>(event)
  const { key, keys, force: forceDelete } = body ?? {}

  const hasSingleKey = key !== undefined && key !== ''
  const hasKeys = keys !== undefined && Array.isArray(keys) && keys.length > 0

  if (!hasSingleKey && !hasKeys) {
    log.warn('Missing key or keys in request body')
    throw new HTTPError({
      status: 400,
      statusText: 'Either key (string) or keys (array) is required in request body'
    })
  }

  const isBatch = hasKeys
  log.withMetadata({ bucket, prefix, isBatch, forceDelete }).debug('Processing delete request')

  const s3Client = await S3Service.fromBucket(event, bucket)

  let keysToDelete: string[]
  if (isBatch) {
    keysToDelete = keys!
  } else {
    keysToDelete = [key!]
  }

  if (keysToDelete.some((k) => !k || k.trim() === '')) {
    throw new HTTPError({ status: 400, statusText: 'Key cannot be empty' })
  }

  const deletedKeys: string[] = []
  const errors: Array<{ key: string; error: string }> = []

  for (const keyToDelete of keysToDelete) {
    const sanitizedKey = keyToDelete.trim()
    const isFolder = sanitizedKey.endsWith('/')

    log.withMetadata({ key: sanitizedKey, isFolder }).debug('Processing delete for key')

    const exists = await s3Client.exists(sanitizedKey)
    if (!exists) {
      log.withMetadata({ key: sanitizedKey }).warn('Object not found')
      errors.push({ key: sanitizedKey, error: 'Object not found' })
      continue
    }

    if (isFolder) {
      const objectCount = await s3Client.listUnderPrefix(sanitizedKey)
      if (objectCount > 0 && !forceDelete) {
        log.withMetadata({ key: sanitizedKey, objectCount }).warn('Folder is not empty')
        throw new HTTPError({
          status: 400,
          statusText: `Cannot delete non-empty folder '${sanitizedKey}'`,
          data: {
            key: sanitizedKey,
            object_count: objectCount,
            hint: 'Use force=true to delete anyway'
          }
        })
      }
    }

    try {
      await s3Client.delete(sanitizedKey)
      deletedKeys.push(sanitizedKey)
      log.withMetadata({ key: sanitizedKey }).info('Object deleted successfully')
    } catch (error: any) {
      log.withMetadata({ key: sanitizedKey, error: error.message }).error('Failed to delete object')
      errors.push({ key: sanitizedKey, error: error.message })
    }
  }

  if (deletedKeys.length === 0) {
    throw new HTTPError({
      status: 400,
      statusText: 'No objects were deleted',
      data: { errors }
    })
  }

  const deletedCount = deletedKeys.length
  const message =
    errors.length > 0
      ? `Deleted ${deletedCount} objects with ${errors.length} errors`
      : 'Objects deleted successfully'

  if (errors.length > 0) {
    throw new HTTPError({ status: 400, statusText: message })
  }

  if (isBatch) {
    return createResponse<DeleteObjectsResponse>(event, message, {
      data: {
        deleted: deletedKeys,
        deleted_count: deletedCount,
        errors
      }
    })
  }

  const firstKey = deletedKeys[0] ?? ''
  return createResponse<DeleteObjectResponse>(event, message, {
    data: { key: firstKey, type: 'file', deleted_count: deletedCount }
  })
})
