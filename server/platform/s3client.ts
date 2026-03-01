import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  type PutObjectCommandInput,
  type ListObjectsV2CommandInput,
  type HeadObjectCommandOutput,
  type _Object
} from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { H3Event, HTTPError } from 'nitro/h3'
import { toSnakeCase } from '~/server/utils/parser'
import { protectedEnv } from '~/shared/envars'

/**
 * S3 multipart upload configuration
 * - threshold: Files larger than 100MB will use multipart upload
 * - partSize: 5MB per part
 * - queueSize: 3 concurrent uploads
 */
const MULTIPART_CONFIG = {
  threshold: 100 * 1024 * 1024, // 100MB
  partSize: 5 * 1024 * 1024, // 5MB
  queueSize: 3
}

/**
 * Default presigned URL expiry in seconds (1 hour)
 */
const DEFAULT_PRESIGNED_EXPIRY = 3600

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

/**
 * S3 Service wrapper for Garage S3-compatible storage.
 * Provides methods for CRUD operations and presigned URLs.
 *
 * Bun S3 client doesn't support create folder yet.
 * @see: https://github.com/oven-sh/bun/issues/25874
 */
export class S3Service {
  private client: S3Client
  private bucket: string

  /**
   * Create S3Service instance from bucket name
   * Fetches credentials from Garage API
   */
  static async fromBucket(event: H3Event, bucket: string): Promise<S3Service> {
    const { gfetch, logger } = event.context

    // Determine if bucket is a UUID or an alias
    // UUID pattern: 8-4-4-4-12 hex characters
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bucket)

    // Build params based on bucket type
    const params = isUUID ? { id: bucket } : { globalAlias: bucket }

    // Get bucket info from Garage API
    const bucketInfo = await gfetch<GetBucketInfoResponse>('/v2/GetBucketInfo', { params })

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

    // Get key info with secret
    const key = await gfetch<KeyInfoBucketResponse>('/v2/GetKeyInfo', {
      params: { id: accessKeyId, showSecretKey: true }
    })

    logger.withMetadata(key).info('Getting key information')
    if (!key.secretAccessKey) {
      logger.withMetadata(key).debug('Failed to retrieve access key info')
      throw new HTTPError({ status: 417, statusText: 'Failed to retrieve access key info' })
    }

    return new S3Service(key.accessKeyId, key.secretAccessKey, bucket)
  }

  constructor(accessKeyId: string, secretAccessKey: string, bucket: string) {
    this.bucket = bucket

    // Initialize S3Client for Garage (S3-compatible)
    const endpoint = protectedEnv.GARAGE_S3_ENDPOINT
    this.client = new S3Client({
      endpoint,
      region: 'auto',
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: true // Required for Garage/S3-compatible services
    })
  }

  /**
   * Write an object to S3
   * Uses multipart upload for files > 100MB
   */
  async write(
    key: string,
    body: Buffer | string,
    options?: { contentType?: string; contentEncoding?: string }
  ): Promise<number> {
    const params: PutObjectCommandInput = {
      Bucket: this.bucket,
      Key: key,
      Body: body,
      ContentType: options?.contentType,
      ContentEncoding: options?.contentEncoding
    }

    // Use multipart upload for large files
    if (body.length > MULTIPART_CONFIG.threshold) {
      const upload = new Upload({
        client: this.client,
        params,
        ...MULTIPART_CONFIG
      })
      await upload.done()
      return body.length
    }

    // Single part upload
    const command = new PutObjectCommand(params)
    await this.client.send(command)
    return body.length
  }

  /**
   * Check if an object exists in S3
   */
  async exists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({ Bucket: this.bucket, Key: key })
      await this.client.send(command)
      return true
    } catch (error: any) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return false
      }
      throw error
    }
  }

  /**
   * Delete an object from S3
   */
  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({ Bucket: this.bucket, Key: key })
    await this.client.send(command)
  }

  /**
   * List objects under a specific prefix
   * Used to check if folder is empty before deletion
   * Returns count of objects found (excluding the folder marker itself)
   */
  async listUnderPrefix(prefix: string): Promise<number> {
    const params: ListObjectsV2CommandInput = {
      Bucket: this.bucket,
      Prefix: prefix,
      Delimiter: '', // No delimiter to get all objects
      MaxKeys: 100 // Check up to 100 to see if folder has content
    }

    const command = new ListObjectsV2Command(params)
    const result = await this.client.send(command)

    // Filter out the folder marker itself (prefix)
    // The folder key itself should not count as content
    const contents = result.Contents ?? []
    const filteredCount = contents.filter((obj) => obj.Key !== prefix).length

    return filteredCount
  }

  /**
   * List objects in S3 bucket with optional prefix
   * Returns snake_case response for frontend compatibility
   */
  async list(
    prefix?: string,
    options?: {
      delimiter?: string
      maxKeys?: number
      continuationToken?: string
    }
  ): Promise<ReturnType<typeof toSnakeCase>> {
    const params: ListObjectsV2CommandInput = {
      Bucket: this.bucket,
      Prefix: prefix,
      Delimiter: options?.delimiter,
      MaxKeys: options?.maxKeys ?? 1000,
      ContinuationToken: options?.continuationToken
    }

    const command = new ListObjectsV2Command(params)
    const result = await this.client.send(command)
    return toSnakeCase(result)
  }

  /**
   * Generate presigned URL for GET (download) operation
   */
  async presignGet(key: string, expiresIn: number = DEFAULT_PRESIGNED_EXPIRY): Promise<string> {
    const command = new HeadObjectCommand({ Bucket: this.bucket, Key: key })
    return await getSignedUrl(this.client, command, { expiresIn })
  }

  /**
   * Generate presigned URL for PUT (upload) operation
   */
  async presignPut(
    key: string,
    contentType: string,
    expiresIn: number = DEFAULT_PRESIGNED_EXPIRY
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType
    })
    return await getSignedUrl(this.client, command, { expiresIn })
  }

  /**
   * Get metadata of an object
   */
  async head(key: string): Promise<HeadObjectCommandOutput> {
    const command = new HeadObjectCommand({ Bucket: this.bucket, Key: key })
    return await this.client.send(command)
  }
}

/**
 * Legacy function for backward compatibility
 * Creates S3Service from bucket name
 * @deprecated Use S3Service.fromBucket() instead
 */
export async function createS3ClientFromBucket(event: H3Event, bucket: string): Promise<S3Service> {
  return await S3Service.fromBucket(event, bucket)
}
