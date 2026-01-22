// List API response (from /bucket endpoint)
export interface BucketListItem {
  id: string
  created: string
  globalAliases: string[]
  localAliases: Array<{
    accessKeyId: string
    alias: string
  }>
}

// Detail API response (from /bucket/:id endpoint)
export interface Bucket {
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

export interface CreateBucketLocalAlias {
  accessKeyId: string
  alias: string
  allow?: {
    owner?: boolean
    read?: boolean
    write?: boolean
  }
}

export interface CreateBucketRequest {
  globalAlias?: string | null
  localAlias?: CreateBucketLocalAlias | null
}

export interface UpdateBucketQuotas {
  maxObjects: number | null
  maxSize: number | null
}

export interface UpdateBucketWebsiteAccess {
  enabled: boolean
  indexDocument?: string | null
  errorDocument?: string | null
}

export interface UpdateBucketRequest {
  websiteAccess?: UpdateBucketWebsiteAccess | null
  quotas?: UpdateBucketQuotas | null
}

export interface ApiBucketKeyPerm {
  owner?: boolean
  read?: boolean
  write?: boolean
}

export interface CleanupIncompleteUploadsResponse {
  uploadsDeleted: number
}

export interface InspectObjectBlock {
  partNumber: number
  offset: number
  hash: string
  size: number
}

export interface InspectObjectVersion {
  uuid: string
  timestamp: string
  encrypted: boolean
  uploading: boolean
  aborted: boolean
  deleteMarker: boolean
  inline: boolean
  etag?: string | null
  size?: number | null
  headers?: Array<[string, string]>
  blocks?: InspectObjectBlock[]
}

export interface InspectObjectResponse {
  bucketId: string
  key: string
  versions: InspectObjectVersion[]
}
