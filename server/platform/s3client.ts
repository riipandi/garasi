import { S3Client } from 'bun'
import { H3Event, HTTPError } from 'nitro/h3'
import { protectedEnv } from '~/shared/envars'

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

interface KeyInfoBucketResponse {
  accessKeyId: string
  created: string
  name: string
  expiration: string | null
  expired: boolean
  secretAccessKey: string | null
  permissions: {
    createBucket: boolean
  }
  buckets: string[]
}

export async function createS3ClientFromBucket(event: H3Event, bucket: string): Promise<S3Client> {
  const { gfetch, logger } = event.context

  const bucketInfo = await gfetch<GetBucketInfoResponse>('/v2/GetBucketInfo', {
    params: { search: bucket }
  })

  if (!bucketInfo) {
    logger.withMetadata(bucketInfo).debug('Failed to retrieve bucket information')
    throw new HTTPError({ status: 417, statusText: 'Failed to retrieve bucket information' })
  }

  if (bucketInfo.keys.length === 0) {
    logger.withMetadata(bucketInfo).debug("Bucket doesn't have access keys")
    throw new HTTPError({
      status: 417,
      statusText:
        'Please grant bucket access credentials that include both read and write permissions'
    })
  }

  const accessKeyId = bucketInfo.keys[0]?.accessKeyId
  if (!accessKeyId) {
    throw new HTTPError({ status: 417, statusText: "Bucket doesn't have access keys" })
  }

  const key = await gfetch<KeyInfoBucketResponse>('/v2/GetKeyInfo', {
    params: { id: accessKeyId, showSecretKey: true }
  })

  logger.withMetadata(key).info('Getting key information')
  if (!key.secretAccessKey) {
    logger.withMetadata(key).debug('Failed to retrieve access key info')
    throw new HTTPError({ status: 417, statusText: 'Failed to retrieve access key info' })
  }

  // Initialize S3Client: (https://bun.sh/docs/runtime/s3
  const secretAccessKey = key.secretAccessKey
  const endpoint = protectedEnv.GARAGE_S3_ENDPOINT
  const region = 'auto' // TODO: Retrieve from garage configuration

  return new S3Client({ accessKeyId, secretAccessKey, endpoint, region })
}
