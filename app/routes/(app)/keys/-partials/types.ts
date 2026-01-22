// List API response (from /keys endpoint)
export interface AccessKeyListItem {
  id: string
  name: string
  created: string | null
  deleted: boolean
}

// Detail API response (from /keys/:id?secret=true endpoint)
export interface AccessKey {
  name: string
  accessKeyId: string
  secretKeyId?: string
  secretAccessKey?: string
  permissions?: {
    createBucket?: boolean
  }
  created: string | null
  deleted: boolean
  expiration?: string | null
  neverExpires?: boolean
  expired?: boolean
  buckets?: string[]
}

export interface CreateKeyRequest {
  name: string
  neverExpires: boolean
  expiration: string | null
  allow: { createBucket: boolean } | null
  deny: { createBucket: boolean } | null
}

export interface UpdateKeyRequest {
  name: string | null
  expiration: string | null
  neverExpires: boolean
  allow: { createBucket: boolean } | null
  deny: { createBucket: boolean } | null
  status?: string
}

export interface ImportKeyRequest {
  accessKeyId: string
  secretKeyId: string
  name: string | null
}

export interface KeysResponse {
  success: boolean
  data: AccessKeyListItem[]
}
