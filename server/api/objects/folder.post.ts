import { getQuery, HTTPError, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import { S3Service } from '~/server/platform/s3client'
import type { CreateFolderRequest, CreateFolderResponse } from '~/shared/schemas/objects.schema'

export default defineProtectedHandler(async (event) => {
  const { logger } = event.context
  const log = logger.withPrefix('CreateFolder')

  const { bucket } = getQuery<{ bucket: string }>(event)
  if (!bucket) {
    log.warn('Missing bucket parameter')
    throw new HTTPError({ status: 400, statusText: 'Missing bucket parameter' })
  }

  const body = await readBody<CreateFolderRequest>(event)
  if (!body?.name) {
    log.warn('Missing name in request body')
    throw new HTTPError({ status: 400, statusText: 'Missing name in request body' })
  }

  const { name } = body

  if (typeof name !== 'string' || name.trim().length === 0) {
    log.warn('Invalid folder name')
    throw new HTTPError({ status: 400, statusText: 'Invalid folder name' })
  }

  log.withMetadata({ bucket, folderName: name }).debug('Creating folder')

  const sanitizedFolderName = name.trim().replace(/^\/+|\/+$/g, '')

  if (sanitizedFolderName.length === 0) {
    log.warn('Folder name cannot be empty after sanitization')
    throw new HTTPError({ status: 400, statusText: 'Folder name cannot be empty' })
  }

  const s3Client = await S3Service.fromBucket(event, bucket)

  const folderKey = `${sanitizedFolderName}/`

  const folderExists = await s3Client.exists(folderKey)
  if (folderExists) {
    log.withMetadata({ bucket, folderKey }).warn('Folder already exists')
    throw new HTTPError({ status: 409, statusText: `Folder '${name}' already exists` })
  }

  await s3Client.write(folderKey, '')

  const verifyExists = await s3Client.exists(folderKey)
  if (!verifyExists) {
    log.withMetadata({ bucket, folderKey }).error('Failed to verify folder creation')
    throw new HTTPError({ status: 500, statusText: 'Failed to create folder' })
  }

  log.withMetadata({ bucket, folderKey }).info('Folder created successfully')

  return createResponse<CreateFolderResponse>(event, 'Folder created successfully', {
    data: { name: sanitizedFolderName, folder_key: folderKey, bucket }
  })
})
