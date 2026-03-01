import type { _Object, CommonPrefix, EncodingType } from '@aws-sdk/client-s3'

export interface ListBucketObjectsParams {
  bucket: string
  prefix?: string
}

export interface ListBucketObjectsResponse {
  name?: string | undefined
  prefix?: string | undefined
  delimiter?: string | undefined
  is_truncated?: boolean | undefined
  contents?: _Object[] | undefined
  max_keys?: number | undefined
  common_prefixes?: CommonPrefix[] | undefined
  encoding_type?: EncodingType | undefined
  key_count?: number | undefined
  continuation_token?: string | undefined
  next_continuation_token?: string | undefined
  start_after?: string | undefined
}

export interface UploadFileParams {
  bucket: string
  prefix?: string
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
