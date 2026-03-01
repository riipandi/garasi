import { getQuery, HTTPError, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import { S3Service } from '~/server/platform/s3client'

interface DeleteRequestBody {
  key?: string
  keys?: string[]
  force?: boolean
}

/**
 * Delete object(s) from S3 bucket
 * Supports single key (key) or batch (keys) delete from request body
 * For folders: checks if empty before deletion (unless force=true)
 */
export default defineProtectedHandler(async (event) => {
  const { logger } = event.context
  const log = logger.withPrefix('DeleteObject')

  // Query parameters
  const { bucket, prefix } = getQuery<{
    bucket: string
    prefix?: string
  }>(event)

  if (!bucket) {
    log.warn('Missing bucket parameter')
    throw new HTTPError({ status: 400, statusText: 'Missing bucket parameter' })
  }

  // Request body
  const body = await readBody<DeleteRequestBody | undefined>(event)
  const { key, keys, force: forceDelete } = body ?? {}

  // Determine if single or batch delete
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

  // Create S3 service
  const s3Client = await S3Service.fromBucket(event, bucket)

  // Parse keys
  let keysToDelete: string[]
  if (isBatch) {
    keysToDelete = keys!
  } else {
    keysToDelete = [key!]
  }

  // Validate no empty keys
  if (keysToDelete.some((k) => !k || k.trim() === '')) {
    throw new HTTPError({ status: 400, statusText: 'Key cannot be empty' })
  }

  const deletedKeys: string[] = []
  const errors: Array<{ key: string; error: string }> = []

  // Process each key
  for (const keyToDelete of keysToDelete) {
    const sanitizedKey = keyToDelete.trim()
    const isFolder = sanitizedKey.endsWith('/')

    log.withMetadata({ key: sanitizedKey, isFolder }).debug('Processing delete for key')

    // Check if object exists
    const exists = await s3Client.exists(sanitizedKey)
    if (!exists) {
      log.withMetadata({ key: sanitizedKey }).warn('Object not found')
      errors.push({ key: sanitizedKey, error: 'Object not found' })
      continue
    }

    // If folder, check if empty
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

    // Delete the object
    try {
      await s3Client.delete(sanitizedKey)
      deletedKeys.push(sanitizedKey)
      log.withMetadata({ key: sanitizedKey }).info('Object deleted successfully')
    } catch (error: any) {
      log.withMetadata({ key: sanitizedKey, error: error.message }).error('Failed to delete object')
      errors.push({ key: sanitizedKey, error: error.message })
    }
  }

  // Handle results
  if (deletedKeys.length === 0) {
    throw new HTTPError({
      status: 400,
      statusText: 'No objects were deleted',
      data: { errors }
    })
  }

  const deletedCount = deletedKeys.length
  const data = {
    deleted: deletedKeys,
    deleted_count: deletedCount,
    ...(errors.length > 0 && { errors })
  }

  const message =
    errors.length > 0
      ? `Deleted ${deletedCount} objects with ${errors.length} errors`
      : 'Objects deleted successfully'

  if (errors.length > 0) {
    throw new HTTPError({ status: 400, statusText: message })
  }

  return createResponse(event, message, { data })
})
