export interface BucketLocalAlias {
  accessKeyId: string
  alias: string
}

/**
 * List all the buckets on the cluster with their UUID and
 * their global and local aliases.
 */
export interface ListBucketsResponse {
  created: string // Bucket creation date (RFC3339)
  globalAliases: string[]
  id: string
  localAliases: BucketLocalAlias[]
}

/**
 * Given a bucket identifier (`id`) or a global alias (`alias`),
 * get its information. It includes its aliases, its web configuration,
 * keys that have some permissions on it, some statistics (number of objects, size),
 * number of dangling multipart uploads, and its quotas (if any).
 */
export interface GetBucketInfoParams {
  id?: string // Exact bucket ID to look up
  globalAlias?: string // Global alias of bucket to look up
  search?: string // Partial ID or alias to search for
}

export interface GetBucketInfoResponse {
  bytes: number // Total number of bytes used by objects in this bucket
  created: string // Bucket creation date (RFC3339)
  globalAliases: string[] // List of global aliases for this bucket
  id: string // Identifier of the bucket
  keys: GetBucketInfoKey[] // List of access keys that have permissions granted on this bucket
  objects: number // Number of objects in this bucket
  quotas: ApiBucketQuotas // Quotas that apply to this bucket
  unfinishedMultipartUploadBytes: number // Total number of bytes used by unfinished multipart uploads in this bucket
  unfinishedMultipartUploadParts: number // Number of parts in unfinished multipart uploads in this bucket
  unfinishedMultipartUploads: number // Number of unfinished multipart uploads in this bucket
  unfinishedUploads: number // Number of unfinished uploads in this bucket
  websiteAccess: boolean // Whether website acces is enabled for this bucket
  websiteConfig: GetBucketInfoWebsiteResponse
}

export interface InspectObjectBlock {
  hash: string // Hash (blake2 sum) of the block's data
  offset: number // Offset of this block within the part
  partNumber: number // Part number of the part containing this block, for multipart uploads
  size: number // Length of the blocks's data
}

export interface InspectObjectVersion {
  aborted: boolean // Whether this is an aborted upload
  blocks: InspectObjectBlock[] // List of data blocks for this object version
  deleteMarker: boolean // Whether this version is a delete marker (a tombstone indicating that a previous version of the object has been deleted)
  encrypted: boolean // Whether this object version was created with SSE-C encryption
  etag?: string | null // Etag of this object version
  headers?: [string, string][]
  inline: boolean // Whether the object's data is stored inline (for small objects)
  size?: number | null // Size of the object, in bytes
  timestamp: string // Creation timestamp of this object version (RFC3339)
  uploading: boolean // Whether this object version is still uploading
  uuid: string // Version ID
}

/**
 * Returns detailed information about an object in a bucket, including its
 * internal state in Garage. This API call can be used to list the data
 * blocks referenced by an object, as well as to view metadata associated
 * to the object. This call may return a list of more than one version for
 * the object, for instance in the case where there is a currently stored
 * version of the object, and a newer version whose upload is in progress
 * and not yet finished.
 */
export interface InspectObjectParams {
  bucketId: string
  key: string
}

export interface InspectObjectResponse {
  bucketId: string // ID of the bucket containing the inspected object
  key: string // Key of the inspected object
  versions: InspectObjectVersion[]
}

export interface CreateBucketLocalAlias {
  accessKeyId: string
  alias: string
  allow?: ApiBucketKeyPerm
}

/**
 * Creates a new bucket, either with a global alias, a local one,
 * or no alias at all. Technically, you can also specify both
 * `globalAlias` and `localAlias` and that would create two aliases.
 */
export interface CreateBucketRequest {
  globalAlias: string
  localAlias: CreateBucketLocalAlias | null
}

export interface CreateBucketResponse {
  bytes: number // Total number of bytes used by objects in this bucket
  created: string // Bucket creation date (RFC3339)
  globalAliases: string[] // List of global aliases for this bucket
  id: string // Identifier of the bucket
  keys: GetBucketInfoKey[] // List of access keys that have permissions granted on this bucket
  objects: number // Number of objects in this bucket
  quotas: ApiBucketQuotas // Quotas that apply to this bucket
  unfinishedMultipartUploadBytes: number // Total number of bytes used by unfinished multipart uploads in this bucket
  unfinishedMultipartUploadParts: number // Number of parts in unfinished multipart uploads in this bucket
  unfinishedMultipartUploads: number // Number of unfinished multipart uploads in this bucket
  unfinishedUploads: number // Number of unfinished uploads in this bucket
  websiteAccess: boolean // Whether website acces is enabled for this bucket
  websiteConfig: GetBucketInfoWebsiteResponse
}

/**
 * Deletes a storage bucket. A bucket cannot be deleted if it is not empty.
 * Warning: this will delete all aliases associated with the bucket!
 */
export interface DeleteBucketParams {
  id: string // ID of the bucket to delete
}

/**
 * All fields (`websiteAccess` and `quotas`) are optional. If they are present,
 * the corresponding modifications are applied to the bucket, otherwise
 * nothing is changed.
 *
 * In `websiteAccess`: if `enabled` is `true`, `indexDocument` must be specified.
 * The field `errorDocument` is optional, if no error document is set a generic
 * error message is displayed when errors happen. Conversely, if `enabled` is
 * `false`, neither `indexDocument` nor `errorDocument` must be specified.
 *
 * In `quotas`: new values of `maxSize` and `maxObjects` must both be specified,
 * or set to `null` to remove the quotas. An absent value will be considered
 * the same as a null. It is not possible to change only one of the two quotas.
 */
export interface UpdateBucketParams {
  id: string // ID of the bucket to update
}

export interface UpdateBucketWebsiteAccess {
  enabled: boolean
  errorDocument: string | null
  indexDocument: string | null
}

export interface UpdateBucketRequest {
  quotas: ApiBucketQuotas
  websiteAccess: UpdateBucketWebsiteAccess | null
}

export interface UpdateBucketResponse {
  bytes: number // Total number of bytes used by objects in this bucket
  created: string // Bucket creation date (RFC3339)
  globalAliases: string[] // List of global aliases for this bucket
  id: string // Identifier of the bucket
  keys: GetBucketInfoKey[] // List of access keys that have permissions granted on this bucket
  objects: number // Number of objects in this bucket
  quotas: ApiBucketQuotas // Quotas that apply to this bucket
  unfinishedMultipartUploadBytes: number // Total number of bytes used by unfinished multipart uploads in this bucket
  unfinishedMultipartUploadParts: number // Number of parts in unfinished multipart uploads in this bucket
  unfinishedMultipartUploads: number // Number of unfinished multipart uploads in this bucket
  unfinishedUploads: number // Number of unfinished uploads in this bucket
  websiteAccess: boolean // Whether website acces is enabled for this bucket
  websiteConfig: GetBucketInfoWebsiteResponse
}

/**
 * Removes all incomplete multipart uploads that are older
 * than the specified number of seconds.
 */
export interface CleanupUploadsRequest {
  bucketId: string
  olderThanSecs: number
}

export interface CleanupUploadsResponse {
  uploadsDeleted: number
}

/**
 * Add an alias for the target bucket. This can be either a global
 * or a local alias, depending on which fields are specified.
 */

export interface AddBucketAliasParams {
  type: 'global' | 'local'
}

export interface AddGlobalBucketAliasRequest {
  globalAlias: string
  bucketId: string
}

export interface AddLocalBucketAliasRequest {
  localAlias: string
  bucketId: string
  accessKeyId: string
}

export interface ApiBucketKeyPerm {
  owner: boolean
  read: boolean
  write: boolean
}

export interface GetBucketInfoKey {
  accessKeyId: string
  bucketLocalAliases: string[]
  name: string
  permissions: ApiBucketKeyPerm
}

export interface ApiBucketQuotas {
  maxObjects: number | null
  maxSize: number | null
}

export interface GetBucketInfoWebsiteResponse {
  indexDocument: string
  errorDocument?: string | null
}

export interface AddBucketAliasResponse {
  bytes: number // Total number of bytes used by objects in this bucket
  created: string // Bucket creation date (RFC3339)
  globalAliases: string[] // List of global aliases for this bucket
  id: string // Identifier of the bucket
  keys: GetBucketInfoKey[] // List of access keys that have permissions granted on this bucket
  objects: number // Number of objects in this bucket
  quotas: ApiBucketQuotas // Quotas that apply to this bucket
  unfinishedMultipartUploadBytes: number // Total number of bytes used by unfinished multipart uploads in this bucket
  unfinishedMultipartUploadParts: number // Number of parts in unfinished multipart uploads in this bucket
  unfinishedMultipartUploads: number // Number of unfinished multipart uploads in this bucket
  unfinishedUploads: number // Number of unfinished uploads in this bucket
  websiteAccess: boolean // Whether website acces is enabled for this bucket
  websiteConfig: GetBucketInfoWebsiteResponse
}

/**
 * Remove an alias for the target bucket. This can be either a global
 * or a local alias, depending on which fields are specified.
 */
export interface RemoveBucketGlobalAliasRequest {
  globalAlias: string
  bucketId: string
}

export interface RemoveBucketLocalAliasRequest {
  accessKeyId: string
  localAlias: string
  bucketId: string
}

export interface RemoveBucketAliasResponse {
  bytes: number // Total number of bytes used by objects in this bucket
  created: string // Bucket creation date (RFC3339)
  globalAliases: string[] // List of global aliases for this bucket
  id: string // Identifier of the bucket
  keys: GetBucketInfoKey[] // List of access keys that have permissions granted on this bucket
  objects: number // Number of objects in this bucket
  quotas: ApiBucketQuotas // Quotas that apply to this bucket
  unfinishedMultipartUploadBytes: number // Total number of bytes used by unfinished multipart uploads in this bucket
  unfinishedMultipartUploadParts: number // Number of parts in unfinished multipart uploads in this bucket
  unfinishedMultipartUploads: number // Number of unfinished multipart uploads in this bucket
  unfinishedUploads: number // Number of unfinished uploads in this bucket
  websiteAccess: boolean // Whether website acces is enabled for this bucket
  websiteConfig: GetBucketInfoWebsiteResponse
}

/**
 * Allows a key to do read/write/owner operations on a bucket.

 * Flags in permissions which have the value true will be activated.
 * Other flags will remain unchanged (ie. they will keep their internal value).

 * For example, if you set read to true, the key will be allowed to read
 * the bucket. If you set it to false, the key will keeps its previous
 * read permission. If you want to disallow read for the key, check the
 * DenyBucketKey operation.
 */
export interface AllowBucketKeyRequest {
  accessKeyId: string
  bucketId: string
  permissions: ApiBucketKeyPerm
}

export interface AllowBucketKeyResponse {
  bytes: number // Total number of bytes used by objects in this bucket
  created: string // Bucket creation date (RFC3339)
  globalAliases: string[] // List of global aliases for this bucket
  id: string // Identifier of the bucket
  keys: GetBucketInfoKey[] // List of access keys that have permissions granted on this bucket
  objects: number // Number of objects in this bucket
  quotas: ApiBucketQuotas // Quotas that apply to this bucket
  unfinishedMultipartUploadBytes: number // Total number of bytes used by unfinished multipart uploads in this bucket
  unfinishedMultipartUploadParts: number // Number of parts in unfinished multipart uploads in this bucket
  unfinishedMultipartUploads: number // Number of unfinished multipart uploads in this bucket
  unfinishedUploads: number // Number of unfinished uploads in this bucket
  websiteAccess: boolean // Whether website acces is enabled for this bucket
  websiteConfig: GetBucketInfoWebsiteResponse
}

/**
 * Denies a key from doing read/write/owner operations on a bucket.
 *
 * Flags in permissions which have the value true will be deactivated.
 * Other flags will remain unchanged.
 *
 * For example, if you set read to true, the key will be denied from reading.
 * If you set read to false, the key will keep its previous permissions.
 * If you want the key to have the reading permission, check the
 * AllowBucketKey operation.
 */
export interface DenyBucketKeyRequest {
  accessKeyId: string
  bucketId: string
  permissions: ApiBucketKeyPerm
}

export interface DenyBucketKeyResponse {
  bytes: number // Total number of bytes used by objects in this bucket
  created: string // Bucket creation date (RFC3339)
  globalAliases: string[] // List of global aliases for this bucket
  id: string // Identifier of the bucket
  keys: GetBucketInfoKey[] // List of access keys that have permissions granted on this bucket
  objects: number // Number of objects in this bucket
  quotas: ApiBucketQuotas // Quotas that apply to this bucket
  unfinishedMultipartUploadBytes: number // Total number of bytes used by unfinished multipart uploads in this bucket
  unfinishedMultipartUploadParts: number // Number of parts in unfinished multipart uploads in this bucket
  unfinishedMultipartUploads: number // Number of unfinished multipart uploads in this bucket
  unfinishedUploads: number // Number of unfinished uploads in this bucket
  websiteAccess: boolean // Whether website acces is enabled for this bucket
  websiteConfig: GetBucketInfoWebsiteResponse
}
