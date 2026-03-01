import type { ApiBucketKeyPerm } from './bucket.schema'

export interface KeyPerm {
  createBucket: boolean
}

/**
 * Returns all API access keys in the cluster.
 */
export interface ListAccessKeysResponse {
  created?: string | null // Bucket creation date (RFC3339)
  expiration?: string | null // Expiration time and date, formatted according to RFC3339
  expired: boolean
  id: string
  name: string
}

/**
 * Return information about a specific key like its identifiers,
 * its permissions and buckets on which it has permissions.
 * You can search by specifying the exact key identifier (`id`)
 * or by specifying a pattern (`search`).
 *
 * For confidentiality reasons, the secret key is not returned
 * by default: you must pass the `showSecretKey` query parameter
 * to get it.
 */
export interface GetKeyInformationParams {
  id?: string // Access key ID
  search?: string // Partial key ID or name to search for
  showSecretKey?: string // Whether to return the secret access key
}

export interface GetKeyInformationResponse {
  accessKeyId: string
  buckets: KeyInfoBucketResponse[]
  created?: string | null // Bucket creation date (RFC3339)
  expiration?: string | null // Expiration time and date, formatted according to RFC3339
  expired: boolean
  name: string
  permissions: KeyPerm
  secretAccessKey: string | null
}

/**
 * Creates a new API access key.
 */
export interface CreateAccessKeyRequest {
  allow?: KeyPerm | null
  deny?: KeyPerm | null
  expiration?: string | null // Expiration time and date, formatted according to RFC 3339
  name?: string | null // Name of the API key
  neverExpires?: boolean // Set the access key to never expire
}

export interface KeyInfoBucketResponse {
  globalAliases: string[]
  id: string
  localAliases: string[]
  permissions: ApiBucketKeyPerm
}

export interface CreateAccessKeyResponse {
  accessKeyId: string
  buckets: KeyInfoBucketResponse[]
  created?: string | null // Bucket creation date (RFC3339)
  expiration?: string | null // Expiration time and date, formatted according to RFC3339
  expired: boolean
  name: string
  permissions: KeyPerm
  secretAccessKey: string | null
}

/**
 * Updates information about the specified API access key.
 * Note: the secret key is not returned in the response, null is sent instead.
 */
export interface UpdateAccessKeyParams {
  id: string // Access key ID
}

export interface UpdateAccessKeyRequest {
  allow?: KeyPerm | null
  deny?: KeyPerm | null
  expiration?: string | null // Expiration time and date, formatted according to RFC 3339
  name?: string | null // Name of the API key
  neverExpires?: boolean // Set the access key to never expire
}

export interface UpdateAccessKeyResponse {
  accessKeyId: string
  buckets: KeyInfoBucketResponse[]
  created?: string | null // Bucket creation date (RFC3339)
  expiration?: string | null // Expiration time and date, formatted according to RFC3339
  expired: boolean
  name: string
  permissions: KeyPerm
  secretAccessKey: string | null
}

/**
 * Delete a key from the cluster. Its access will be removed
 * from all the buckets. Buckets are not automatically deleted
 * and can be dangling. You should manually delete them before.
 */
export interface DeleteAccessKeyParams {
  id: string // Access key ID
}

export interface DeleteAccessKeyResponse {
  accessKeyId: string
}

/**
 * Imports an existing API key. This feature must only be used
 * for migrations and backup restore.
 *
 * Do not use it to generate custom key identifiers or you will
 * break your Garage cluster.
 */
export interface ImportKeyRequest {
  accessKeyId: string
  name?: string | null
  secretAccessKey: string
}

export interface ImportKeyResponse {
  accessKeyId: string
  buckets: KeyInfoBucketResponse[]
  created?: string | null // Bucket creation date (RFC3339)
  expiration?: string | null // Expiration time and date, formatted according to RFC3339
  expired: boolean
  name: string
  permissions: KeyPerm
  secretAccessKey: string | null
}
