export interface ListBucketObjectsParams {
  bucket: string
  prefix?: string
}

export interface S3Object {
  key: string
  last_modified?: string
  e_tag?: string
  size?: number
  storage_class?: string
  owner?: {
    id: string
    display_name?: string
  }
}

export interface CommonPrefix {
  prefix: string
}

export interface ListBucketObjectsResponse {
  is_truncated?: boolean
  marker?: string
  next_marker?: string
  contents?: S3Object[]
  common_prefixes?: CommonPrefix[]
  name?: string
  prefix?: string
  delimiter?: string
  max_keys?: number
  common_prefixes_count?: number
  keys_count?: number
}

export interface UploadFileParams {
  bucket: string
  overwrite?: boolean
}

export interface UploadFileRequest {
  file: File | Blob | FormData
}

export interface UploadFileResponse {
  filename: string
  contentType: string
  fileSize: string
  forceUpload: boolean
}

export interface CreateFolderParams {
  bucket: string
  prefix?: string
}

export interface CreateFolderRequest {
  name: string
}

export interface CreateFolderResponse {
  name: string
  folder_key: string
  bucket: string
}

export interface PresignUrlParams {
  bucket: string
  key: string
  operation: 'get' | 'put'
  contentType?: string
  expiresIn?: number
}

export interface PresignUrlResponse {
  url: string
  key: string
  operation: 'get' | 'put'
  expires_in: number
  expires_at: string
}

export interface DeleteObjectParams {
  bucket: string
  key: string
  force?: boolean
}

export interface DeleteObjectResponse {
  key: string
  type: 'file' | 'folder'
  deleted_count: number
}

export interface DeleteObjectsParams {
  bucket: string
  keys: string[]
  force?: boolean
}

export interface DeleteObjectsResponse {
  deleted: string[]
  deleted_count: number
  errors?: Array<{
    key: string
    error: string
  }>
}

export interface GetObjectDetailParams {
  bucket: string
  key: string
}

export interface ObjectDetailFile {
  key: string
  type: 'file'
  size: number
  content_type?: string
  last_modified?: string
  e_tag?: string
  storage_class?: string
}

export interface ObjectDetailFolder {
  key: string
  type: 'folder'
  object_count: number
  total_size: number
  last_modified?: string
}

export type GetObjectDetailResponse = ObjectDetailFile | ObjectDetailFolder
