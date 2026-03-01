import { getQuery, HTTPError } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import { S3Service } from '~/server/platform/s3client'
import { parseBoolean } from '~/server/utils/parser'
import { protectedEnv } from '~/shared/envars'
import type { UploadFileResponse } from '~/shared/schemas/objects.schema'
import { prettyBytes } from '~/shared/utils/humanize'

export default defineProtectedHandler(async (event) => {
  const { logger } = event.context
  const log = logger.withPrefix('UploadFile')

  const { bucket, prefix, overwrite } = getQuery<{
    bucket: string
    prefix?: string
    overwrite?: string | null
  }>(event)
  if (!bucket) {
    log.warn('Missing bucket parameter')
    throw new HTTPError({ status: 400, statusText: 'Missing bucket parameter' })
  }

  log.withMetadata({ bucket, prefix }).debug('Processing file upload')

  const form: FormData = await event.req.formData()

  const files: any[] = []
  for (const [, val] of form.entries()) {
    if (val && typeof (val as any).arrayBuffer === 'function' && (val as any).name) {
      files.push(val)
    }
  }

  if (files.length === 0) {
    log.warn('No file uploaded')
    throw new HTTPError({ status: 401, statusText: 'Expecting form-data with a file field' })
  }

  if (files.length > 1) {
    throw new HTTPError({ status: 401, statusText: 'Only single file upload allowed' })
  }

  const fileEntry = files[0]

  let arrayBuf: ArrayBuffer
  arrayBuf = await fileEntry.arrayBuffer()

  const buffer = Buffer.from(arrayBuf)
  if (buffer.length === 0) {
    log.warn('Uploaded file has no content')
    throw new HTTPError({ status: 401, statusText: 'File part contains no data' })
  }

  const maxUploadSize = protectedEnv.S3_MAX_UPLOAD_SIZE
  if (buffer.length > maxUploadSize) {
    log
      .withMetadata({ fileSize: buffer.length, maxSize: maxUploadSize })
      .warn('Uploaded file size too large')
    throw new HTTPError({ status: 401, statusText: `Max upload size is ${maxUploadSize} bytes` })
  }

  const filename = (fileEntry.name as string) ?? `file-${Date.now()}`
  const contentType = (fileEntry.type as string) ?? 'application/octet-stream'

  const s3Client = await S3Service.fromBucket(event, bucket)

  const fullKey = prefix ? `${prefix}${filename}` : filename

  const forceUpload = parseBoolean(overwrite ?? null)
  const fileExists = await s3Client.exists(fullKey)
  if (!forceUpload && fileExists) {
    log.withMetadata({ filename: fullKey }).warn('File already exists')
    throw new HTTPError({ status: 401, statusText: `File '${fullKey}' already exists` })
  }

  const bytesWritten = await s3Client.write(fullKey, buffer, { contentType })
  log
    .withMetadata({ filename: fullKey, fileSize: prettyBytes(bytesWritten) })
    .debug('File uploaded successfully')

  return createResponse<UploadFileResponse>(event, 'Upload file to bucket', {
    data: {
      filename,
      contentType,
      fileSize: prettyBytes(bytesWritten),
      forceUpload
    }
  })
})
