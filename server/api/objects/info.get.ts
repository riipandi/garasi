import { getQuery, HTTPError } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import { S3Service } from '~/server/platform/s3client'

export default defineProtectedHandler(async (event) => {
  const { logger } = event.context
  const log = logger.withPrefix('GetObjectInfo')

  const { bucket, key } = getQuery<{ bucket: string; key: string }>(event)

  if (!bucket) {
    log.warn('Missing bucket parameter')
    throw new HTTPError({ status: 400, statusText: 'Missing bucket parameter' })
  }

  if (!key) {
    log.warn('Missing key parameter')
    throw new HTTPError({ status: 400, statusText: 'Missing key parameter' })
  }

  log.withMetadata({ bucket, key }).debug('Getting object info')

  const s3Client = await S3Service.fromBucket(event, bucket)

  const exists = await s3Client.exists(key)
  if (!exists) {
    log.withMetadata({ bucket, key }).warn('Object not found')
    throw new HTTPError({ status: 404, statusText: `Object '${key}' not found` })
  }

  const isFolder = key.endsWith('/')

  if (isFolder) {
    const objectCount = await s3Client.listUnderPrefix(key)
    const listResult = await s3Client.list(key, { delimiter: '' })

    let totalSize = 0
    let lastModified: string | undefined

    if (listResult.contents) {
      for (const obj of listResult.contents) {
        totalSize += obj.size || 0
        if (!lastModified || (obj.last_modified && obj.last_modified > lastModified)) {
          lastModified = obj.last_modified
        }
      }
    }

    const data = {
      key,
      type: 'folder' as const,
      object_count: objectCount,
      total_size: totalSize,
      last_modified: lastModified
    }

    log.withMetadata(data).info('Folder info retrieved successfully')
    return createResponse(event, 'Folder info retrieved successfully', { data })
  }

  const metadata = await s3Client.head(key)

  const data = {
    key,
    type: 'file' as const,
    size: metadata.ContentLength || 0,
    content_type: metadata.ContentType,
    last_modified: metadata.LastModified?.toISOString(),
    e_tag: metadata.ETag,
    storage_class: metadata.StorageClass
  }

  log.withMetadata(data).info('File info retrieved successfully')
  return createResponse(event, 'File info retrieved successfully', { data })
})
