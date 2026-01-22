import { getQuery, HTTPError, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createS3ClientFromBucket } from '~/server/platform/s3client'

interface CreateFolderRequestBody {
  name: string
}

export default defineProtectedHandler(async (event) => {
  const { logger } = event.context

  // Validate required query parameter
  const { bucket } = getQuery<{ bucket: string }>(event)
  if (!bucket) {
    logger.debug('Missing bucket parameter')
    throw new HTTPError({ status: 400, statusText: 'Missing bucket parameter' })
  }

  // Validate request body
  const body = await readBody<CreateFolderRequestBody>(event)
  if (!body?.name) {
    logger.debug('Missing name in request body')
    throw new HTTPError({ status: 400, statusText: 'Missing name in request body' })
  }

  const { name } = body

  // Validate folder name
  if (typeof name !== 'string' || name.trim().length === 0) {
    logger.debug('Invalid folder name')
    throw new HTTPError({ status: 400, statusText: 'Invalid folder name' })
  }

  // Remove leading/trailing slashes and spaces
  const sanitizedFolderName = name.trim().replace(/^\/+|\/+$/g, '')

  if (sanitizedFolderName.length === 0) {
    logger.debug('Folder name cannot be empty after sanitization')
    throw new HTTPError({ status: 400, statusText: 'Folder name cannot be empty' })
  }

  // Create S3 client for the bucket
  const s3Client = await createS3ClientFromBucket(event, bucket)

  // In S3, folders are created by putting an object with a trailing slash
  const folderKey = `${sanitizedFolderName}/`

  // Check if folder already exists
  const folderExists = await s3Client.exists(folderKey, { bucket })
  if (folderExists) {
    logger.withMetadata({ folderKey }).debug('Folder already exists')
    throw new HTTPError({ status: 409, statusText: `Folder '${name}' already exists` })
  }

  // Create the folder by writing an empty buffer with a trailing slash
  // In S3, folders are represented as objects with keys ending in '/'
  // Using Buffer instead of string to ensure compatibility with S3-compatible systems
  await s3Client.write(folderKey, Buffer.alloc(0), { bucket })

  // Verify the folder was created successfully
  const verifyExists = await s3Client.exists(folderKey, { bucket })
  if (!verifyExists) {
    logger.withMetadata({ folderKey }).error('Failed to verify folder creation')
    throw new HTTPError({ status: 500, statusText: 'Failed to create folder' })
  }

  logger.withMetadata({ folderKey }).info('Folder created successfully')
  const data = { name: sanitizedFolderName, folderKey, bucket }

  return { status: 'success', message: 'Folder created successfully', data }
})
