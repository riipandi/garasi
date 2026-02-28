import { getQuery, HTTPError, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { S3Service } from '~/server/platform/s3client'

interface CreateFolderRequestBody {
  name: string
}

export default defineProtectedHandler(async (event) => {
  const { logger } = event.context
  const log = logger.withPrefix('CreateFolder')

  // Validate required query parameter
  const { bucket } = getQuery<{ bucket: string }>(event)
  if (!bucket) {
    log.warn('Missing bucket parameter')
    throw new HTTPError({ status: 400, statusText: 'Missing bucket parameter' })
  }

  // Validate request body
  const body = await readBody<CreateFolderRequestBody>(event)
  if (!body?.name) {
    log.warn('Missing name in request body')
    throw new HTTPError({ status: 400, statusText: 'Missing name in request body' })
  }

  const { name } = body

  // Validate folder name
  if (typeof name !== 'string' || name.trim().length === 0) {
    log.warn('Invalid folder name')
    throw new HTTPError({ status: 400, statusText: 'Invalid folder name' })
  }

  log.withMetadata({ bucket, folderName: name }).debug('Creating folder')

  // Remove leading/trailing slashes and spaces
  const sanitizedFolderName = name.trim().replace(/^\/+|\/+$/g, '')

  if (sanitizedFolderName.length === 0) {
    log.warn('Folder name cannot be empty after sanitization')
    throw new HTTPError({ status: 400, statusText: 'Folder name cannot be empty' })
  }

  // Create S3 service for the bucket
  const s3Client = await S3Service.fromBucket(event, bucket)

  // In S3, folders are created by putting an object with a trailing slash
  const folderKey = `${sanitizedFolderName}/`

  // Check if folder already exists
  const folderExists = await s3Client.exists(folderKey)
  if (folderExists) {
    log.withMetadata({ bucket, folderKey }).warn('Folder already exists')
    throw new HTTPError({ status: 409, statusText: `Folder '${name}' already exists` })
  }

  // Create the folder marker with explicit ContentLength: 0
  // In S3, folders are represented as objects with keys ending in '/'
  // AWS SDK properly sets ContentLength for empty body
  await s3Client.write(folderKey, '')

  // Verify the folder was created successfully
  const verifyExists = await s3Client.exists(folderKey)
  if (!verifyExists) {
    log.withMetadata({ bucket, folderKey }).error('Failed to verify folder creation')
    throw new HTTPError({ status: 500, statusText: 'Failed to create folder' })
  }

  log.withMetadata({ bucket, folderKey }).info('Folder created successfully')
  const data = { name: sanitizedFolderName, folder_key: folderKey, bucket }

  return { status: 'success', message: 'Folder created successfully', data }
})
